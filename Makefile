init:
	yarn install
	docker pull ghcr.io/scrtlabs/localsecret:v1.3.1
.PHONY: init

dev-node/start:
	docker compose up -d
.PHONY: dev-node/start

dev-node/stop:
	docker compose down
.PHONY: dev-node/stop