export const LOCAL_CONFIG = {
  NETWORK: "local",
  CHAIN_ID: 'secretdev-1',
  CHAIN_NAME: 'Secret Local',
  CHAIN_gRPC: 'http://localhost:9091',
  CHAIN_RPC: 'http://localhost:26657',
  CHAIN_REST: 'http://localhost:1317',
}

// https://faucet.secrettestnet.io/ (faucet)
// https://secretnodes.com/secret/chains/pulsar-2/ (explorer)
export const TESTNET_CONFIG = {
  NETWORK: "testnet",
  CHAIN_ID: 'pulsar-2',
  CHAIN_NAME: 'Secret Testnet',
  CHAIN_gRPC: 'http://rpc.pulsar.griptapejs.com:9091',
  CHAIN_RPC: 'https://rpc.pulsar.griptapejs.com',
  CHAIN_REST: 'https://api.pulsar.griptapejs.com',
}

// TODO: MAINNET_CONFIG
export const MAINNET_CONFIG = {
  NETWORK: "mainnet",
  CHAIN_ID: 'mainnet',
}
