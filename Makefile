# array of uint to encode then decode
MESSAGE ?= 42

GOROOT := $(shell go env GOROOT)
GOPATH := $(shell go env GOPATH)

.PHONY: gen-encrypted
gen-encrypted:
	go run ./cmd/gen-encrypted $(MESSAGE) | \
		awk ' \
			/^param index:/ {print "export const paramsIndex = " $$3} \
			/^secret key:/ {print "export const privateKey = Buffer.from('\''" $$3 "'\'', '\''base64'\'')"} \
			/^encoded:/ {print "export const encoded = Buffer.from('\''" $$2 "'\'', '\''base64'\'')"} \
			/^encoded length:/ {print "export const messageLength = " $$3} \
		' > wasm/src/generated.ts

.PHONY: build
build: gen-encrypted wasm/dist/main.wasm wasm/dist/bundle.js wasm/dist/index.html wasm/dist/wasm_exec.js

wasm/node_modules/.bin/webpack:
	cd wasm && npm i

wasm/dist:
	mkdir $@
wasm/dist/main.wasm: wasm/src/main.go | wasm/dist
	GOARCH=wasm GOOS=js go build -o $@ ./$(<D)
wasm/dist/bundle.js: wasm/tsconfig.json $(wildcard wasm/src/*.ts) | wasm/dist wasm/node_modules/.bin/webpack
	cd wasm && npx webpack
wasm/dist/index.html: wasm/src/index.html | wasm/dist
	cp $< $@
wasm/dist/wasm_exec.js: $(GOROOT)/misc/wasm/wasm_exec.js | wasm/dist
	cp $< $@

.PHONY: serve
$(GOPATH)/bin/goexec:
	go get github.com/shurcooL/goexec
serve: | $(GOPATH)/bin/goexec
serve: private PATH := $(PATH):$(GOPATH)/bin
serve: | build
	goexec 'http.ListenAndServe(`:8080`, http.FileServer(http.Dir(`wasm/dist`)))'
