// TODO FIX OPEN OSX ERROR: localhost:9091, 1337, 26657 -> Connection Refused
// Command:   nc -vz localhost 9091
// Result:    nc: connectx to localhost port 9091 (tcp) failed: Connection refused
// WORKAROUND: GITPOD_WORKSPACE_URL -> https://www.gitpod.io/docs/environment-variables/
const TEMP_GITPOD_WORKSPACE_URL = 'atomiklabs-scrtnetworkd-e5iptteirhd.ws-us46.gitpod.io'
export const LOCAL_CONFIG = {
  NETWORK: "local",
  CHAIN_ID: 'secretdev-1',
  CHAIN_NAME: 'Secret Local',
  CHAIN_gRPC: `https://9091-${TEMP_GITPOD_WORKSPACE_URL}`,
  CHAIN_RPC: `https://26657-${TEMP_GITPOD_WORKSPACE_URL}`,
  CHAIN_REST: `https://1317-${TEMP_GITPOD_WORKSPACE_URL}`,
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
