import { promises as fs } from 'fs'
import path from 'path'
import { PATHS } from '../lib/config/paths'
import { createClient, Wallet } from '../lib/secret-client'
import type { ContractManifest } from '../lib/secret-client'
import { readContractManifestFile, writeContractManifestFile } from '../lib/utils'

export const TEST_ACCOUNT_B_MNEMONIC =
  'jelly shadow frog dirt dragon use armed praise universe win jungle close inmate rain oil canvas beauty pioneer chef soccer icon dizzy thunder meadow'

async function main() {
  const mnemonic = process.env.MNEMONIC || TEST_ACCOUNT_B_MNEMONIC
  const offlineSigner = new Wallet(mnemonic)
  const walletAddress = offlineSigner.address

  // TODO: read this value from CLI
  const contractName = 'snipix'

  let snipixManifest = (await readContractManifestFile(contractName)) as ContractManifest

  const { client } = await createClient({
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
