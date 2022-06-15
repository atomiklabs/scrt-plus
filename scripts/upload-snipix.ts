import { createClient, Wallet } from '../lib/secret-client'

export const TEST_ACCOUNT_B_MNEMONIC =
  'jelly shadow frog dirt dragon use armed praise universe win jungle close inmate rain oil canvas beauty pioneer chef soccer icon dizzy thunder meadow'

async function main() {
  const mnemonic = process.env.MNEMONIC || TEST_ACCOUNT_B_MNEMONIC
  const offlineSigner = new Wallet(mnemonic)
  const walletAddress = offlineSigner.address

  const { chainInfo, client } = await createClient({
    wallet: offlineSigner,
    walletAddress,
  })

  console.log({ chainInfo, client })
}

main()
