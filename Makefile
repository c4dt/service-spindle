GOROOT := $(shell go env GOROOT)

.PHONY: build
build: webapp/src/assets/geco-cryptolib.wasm

webapp/node_modules/.installed:
	cd webapp && npm ci
	touch $@

webapp/node_modules/geco-cryptolib/geco-cryptolib.wasm: webapp/node_modules/.installed
webapp/src/assets/geco-cryptolib.wasm: webapp/node_modules/geco-cryptolib/geco-cryptolib.wasm
	cp $< $@
