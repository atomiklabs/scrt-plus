import * as fs from 'fs'
import path from 'path'

import { LOCAL_CONFIG, TESTNET_CONFIG, MAINNET_CONFIG } from './config'

// TODO: Dynamic deployed contract name and address -> loadConnections
// https://github.com/terra-money/terrain/blob/a249da233393e0020b1ab90676f54b1ad9641a42/src/config.ts#L44
export async function updateUIContractAddresses({ contractAddr }) {
  let chainConfig

  switch (process.env.NETWORK) {
    case TESTNET_CONFIG.NETWORK:
      chainConfig = TESTNET_CONFIG
      break
    case MAINNET_CONFIG.NETWORK:
      chainConfig = MAINNET_CONFIG
      break
    default:
      chainConfig = LOCAL_CONFIG
  }

  const configFilePathTarget = `./interface/src/config/chain-${chainConfig.NETWORK}.ts`

  let configFileContents = `export const CONFIG = {
  NETWORK: '${chainConfig.NETWORK}',
  CHAIN_ID: '${chainConfig.CHAIN_ID}',
  CHAIN_NAME: '${chainConfig.CHAIN_NAME}',
  CHAIN_gRPC: '${chainConfig.CHAIN_gRPC}',
  CHAIN_RPC: '${chainConfig.CHAIN_RPC}',
  CHAIN_REST: '${chainConfig.CHAIN_REST}',
  contractAddr: '${contractAddr}',
}\n
`

  fs.writeFileSync(path.resolve(configFilePathTarget), configFileContents)
}
