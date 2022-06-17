const fs = require('fs')

const envSecretsPath = `${process.cwd()}/.env-private.js`;
let envSecrets = {};

try {
  envSecrets = require(envSecretsPath);
} catch (error) {
  console.error(`${error} | Cannot access envSecrets at ${envSecretsPath}`);
}

module.exports = {
  local: {
    // Test account data from https://docs.scrt.network/dev/LocalSecret.html#accounts
    MNEMONIC: 'jelly shadow frog dirt dragon use armed praise universe win jungle close inmate rain oil canvas beauty pioneer chef soccer icon dizzy thunder meadow',
    NETWORK: "local",
    CHAIN_ID: 'secretdev-1',
    CHAIN_NAME: 'Secret Local',
    CHAIN_GRPC: 'http://localhost:9091',
    CHAIN_RPC: 'http://localhost:26657',
    CHAIN_REST: 'http://localhost:1317',
  },
  testnet: {
    MNEMONIC: envSecrets?.testnet?.MNEMONIC,
    CHAIN_ID: 'pulsar-2',
    CHAIN_NAME: 'Secret Testnet',
    CHAIN_GRPC: 'http://rpc.pulsar.griptapejs.com:9091',
    CHAIN_RPC: 'https://rpc.pulsar.griptapejs.com',
    CHAIN_REST: 'https://api.pulsar.griptapejs.com',
  }
}
