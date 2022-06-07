init:
	yarn install
	docker pull ghcr.io/scrtlabs/localsecret:v1.3.1
.PHONY: init

dev-node/start:
	cd vendor/localsecret && \
		docker compose up -d
.PHONY: dev-node/start

dev-node/stop:
	cd vendor/localsecret && \
		docker compose down
.PHONY: dev-node/stop

# This is a local build with debug-prints activated. Debug prints only show up
# in the local development chain and mainnet won't accept contracts built with the feature enabled.
.PHONY: build _build
build: _build compress-wasm
_build:
	RUSTFLAGS='-C link-arg=-s' cargo build --release --target wasm32-unknown-unknown --features="debug-print"

.PHONY: compress-wasm
compress-wasm:
	cp ./target/wasm32-unknown-unknown/release/*.wasm ./contract.wasm
	@## The following line is not necessary, may work only on linux (extra size optimization)
	@# wasm-opt -Os ./contract.wasm -o ./contract.wasm
	cat ./contract.wasm | gzip -9 > ./contract.wasm.gz

.PHONY: clean
clean:
	cargo clean
	-rm -f ./contract.wasm ./contract.wasm.gz

.PHONY: schema
schema:
	cargo run --example schema
