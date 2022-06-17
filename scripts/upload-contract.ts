import { promises as fs } from 'fs'
import path from 'path'
import { PATHS } from '../lib/config/paths'
import { createClient, Wallet } from '../lib/secret-client'
import type { ContractManifest } from '../lib/secret-client'
import { readContractManifestFile, writeContractManifestFile } from '../lib/utils'
import { LOCAL_CONFIG } from '../lib/config'

async function main() {
  const mnemonic = process.env.MNEMONIC;
  const chainId = process.env.CHAIN_ID;
  const grpcWebUrl = process.env.CHAIN_GRPC;

  const hasAllRequiredEnvsPresent = () => [mnemonic, chainId, grpcWebUrl].every(
    value => typeof value === 'string' && value.length > 0
  );

  if (!hasAllRequiredEnvsPresent()) {
    console.log({ mnemonic, chainId, grpcWebUrl})
    throw new Error('Missing env vars. Ensure providing all: `MNEMONIC`, `CHAIN_ID`, `CHAIN_GRPC`');
  }

  const offlineSigner = new Wallet(mnemonic)
  const walletAddress = offlineSigner.address

  console.log({mnemonic, chainId, grpcWebUrl})

  process.exit(0)

  // TODO: read this value from CLI
  const contractName = 'snipix'

  let snipixManifest = (await readContractManifestFile(contractName)) as ContractManifest

  const { client } = await createClient({
    chainId,
    grpcWebUrl,
    wallet: offlineSigner,
    walletAddress,
  })

  const codeStoreResult = await client.storeCode(
    await fs.readFile(
      // TODO: read contract file name from cmd env
      path.resolve(PATHS.artifacts, `${contractName}.wasm`)
    )
  )

  await writeContractManifestFile(contractName, Object.assign({}, snipixManifest, { ...codeStoreResult }))
}

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err
})

main()
