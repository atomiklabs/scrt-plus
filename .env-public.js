const fs = require('fs')

const envSecretsPath = `${process.cwd()}/.env-private.js`
let envSecrets = {}

try {
  envSecrets = require(envSecretsPath)
} catch (error) {
  console.error(`${error} | Cannot access envSecrets at ${envSecretsPath}`)
}

const sharedEnvPublic = {
  SNIPIX_SOURCODE_URL: 'https://github.com/atomiklabs/scrt-network-dev-setup-example/tree/use-snip-20/contracts/snipix',
}

module.exports = {
  local: {
    ENV_NAME: 'local',
    // Test account data from https://docs.scrt.network/dev/LocalSecret.html#accounts
    MNEMONIC:
      'jelly shadow frog dirt dragon use armed praise universe win jungle close inmate rain oil canvas beauty pioneer chef soccer icon dizzy thunder meadow',
    NETWORK: 'local',
    CHAIN_ID: 'secretdev-1',
    CHAIN_NAME: 'Secret Local',
    CHAIN_GRPC: 'http://localhost:9091',
    CHAIN_RPC: 'http://localhost:26657',
    CHAIN_REST: 'http://localhost:1317',
    ...sharedEnvPublic,
  },
  testnet: {
    ENV_NAME: 'testnet',
    MNEMONIC: envSecrets?.testnet?.MNEMONIC,
    CHAIN_ID: 'pulsar-2',
    CHAIN_NAME: 'Secret Testnet',
    CHAIN_GRPC: 'https://testnet-web-rpc.roninventures.io',
    CHAIN_RPC: 'https://testnet-rpc.roninventures.io',
    CHAIN_REST: 'https://testnet-api.roninventures.io',
    ...sharedEnvPublic,
  },
  mainnet: {
    ENV_NAME: 'mainnet',
    MNEMONIC: envSecrets?.mainnet?.MNEMONIC,
    CHAIN_ID: 'secret-4',
    CHAIN_GRPC: 'https://secret-4.api.trivium.network:9091',
    ...sharedEnvPublic,
  },
}
