setup:
	yarn install --frozen-lockfile
	yarn --cwd interface install 
	docker pull ghcr.io/scrtlabs/localsecret:v1.3.1
	cargo check
	cp .template.env-private.js .env-private.js
.PHONY: setup

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
	- cd contracts/counter && \
		RUSTFLAGS='-C link-arg=-s' cargo build --release --target wasm32-unknown-unknown --features="debug-print"
	- cd contracts/snipix && \
		RUSTFLAGS='-C link-arg=-s' cargo build --release --target wasm32-unknown-unknown --features="debug-print"


build-prod: _build-prod compress-wasm
_build-prod:
	- cd contracts/counter && \
		RUSTFLAGS='-C link-arg=-s' cargo build --release --target wasm32-unknown-unknown
	- cd contracts/snipix && \
		RUSTFLAGS='-C link-arg=-s' cargo build --release --target wasm32-unknown-unknown


.PHONY: compress-wasm
compress-wasm:
	rm -f ./artifacts/*.wasm ./artifacts/*.wasm.gz
	cp ./target/wasm32-unknown-unknown/release/*.wasm ./artifacts/
	gzip -k -9 ./artifacts/*.wasm

.PHONY: clean
clean:
	cargo clean
	-rm -f ./artifacts/*.wasm ./artifacts/*.wasm.gz

.PHONY: schema
schema:
	cargo run --example schema

.PHONY: local/storeCode/snipix
local/storeCode/snipix: build
	CONTRACT_NAME=snipix \
		yarn env-cmd -r .env-public.js -e local ts-node scripts/upload-contract.ts 

.PHONY: testnet/storeCode/snipix
testnet/storeCode/snipix: build-prod
	CONTRACT_NAME=snipix \
		yarn env-cmd -r .env-public.js -e testnet ts-node scripts/upload-contract.ts 