import { randomUUID } from 'node:crypto'
import { createClient, Wallet } from '../lib/secret-client'
import type { ContractManifest } from '../lib/secret-client'
import { readContractManifestFile, writeContractManifestFile } from '../lib/utils'

async function main() {
  const envName = process.env.ENV_NAME!;
  const mnemonic = process.env.MNEMONIC!;
  const chainId = process.env.CHAIN_ID!;
  const chainName = process.env.CHAIN_NAME!;
  const grpcUrl = process.env.CHAIN_GRPC!;
  const rpcUrl = process.env.CHAIN_RPC!;
  const restUrl = process.env.CHAIN_REST!;
  const contractName = process.env.CONTRACT_NAME!;

  const hasAllRequiredEnvsPresent = () => [mnemonic, chainId, grpcUrl, contractName].every(
    value => typeof value === 'string' && value.length > 0
  );

  if (!hasAllRequiredEnvsPresent()) {
    throw new Error('Missing env vars. Ensure providing all: `ENV_NAME`, `MNEMONIC`, `CHAIN_ID`, `CHAIN_GRPC`, and `CONTRACT_NAME`');
  }

  const offlineSigner = new Wallet(mnemonic)
  const walletAddress = offlineSigner.address

  const contractManifestFilePath = `${contractName}.${envName}`

  const snipixManifest = (await readContractManifestFile(contractManifestFilePath)) as ContractManifest
  const codeId = process.env.CODE_ID || snipixManifest.codeId;
  const codeHash = process.env.CODE_HASH || snipixManifest.codeHash;

  if (!codeId) {
    throw new Error('Missing `codeId`')
  }

  if (!codeHash) {
    throw new Error('Missing `codeHash`')
  }

  const { client } = await createClient({
    wallet: offlineSigner,
    walletAddress,
    chainId,
    chainName,
    grpcUrl,
    rpcUrl,
    restUrl, 
  })

  const initMsg = {
    name: 'Test token',
    symbol: 'TTX',
    decimals: 6,
    prng_seed: Buffer.from(randomUUID()).toString('base64'),
    marketing_info: {
      project: `Atomik Labs: Token #${randomUUID()}`
    }
  }

  const contractInstantiateResult = await client.instantiateContract({
    codeId: typeof codeId === 'string' ? parseInt(codeId, 10) : codeId,
    codeHash,
    label: 'Snip-20 from Atomiklabs.io',
    initMsg
  })

  await writeContractManifestFile(contractManifestFilePath, Object.assign({}, snipixManifest, { ...contractInstantiateResult }))
}

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err
})

main()
