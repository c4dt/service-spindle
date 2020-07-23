GOROOT := $(shell go env GOROOT)

.PHONY: build
build: webapp/src/assets/geco-cryptolib-js.wasm
build: webapp/src/assets/wasm_exec.js

geco:
	git clone https://github.com/ldsec/geco $@

webapp/src/assets/geco-cryptolib-js.wasm: | geco
	$(MAKE) -C geco/build/package/cryptolib-js build
	cp geco/build/package/cryptolib-js/geco-cryptolib-js.wasm $@
webapp/src/assets/wasm_exec.js: $(GOROOT)/misc/wasm/wasm_exec.js
	cp $< $@
