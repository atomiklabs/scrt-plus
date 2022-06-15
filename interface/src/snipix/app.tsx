import { useCallback, useState } from 'react'
import { createClient, getPreferredChainInfo } from './secret-client'
import type { ContractManifest, SecretNetworkExtendedClient, PreferredChainInfo } from './secret-client'

const _snipixManifest = require('./snipix.manifest.json')

interface SnipixAppProps {
  snipixManifest?: ContractManifest
}

export default function App({ snipixManifest = _snipixManifest }: SnipixAppProps) {
  const [secretClient, setSecretClient] = useState<SecretNetworkExtendedClient | null>()
  const [preferredChain, setPreferredChain] = useState<PreferredChainInfo>()

  const suggestWalletNetworkSwitch = useCallback(async (suggestedChain: PreferredChainInfo) => {
    if (typeof window.keplr === 'undefined') {
      throw Error('Wallet is not connected. Connect and try again.')
    }

    let chainInfo = {
      bip44: {
        coinType: 529,
      },
      bech32Config: {
        bech32PrefixAccAddr: 'secret',
        bech32PrefixAccPub: 'secretpub',
        bech32PrefixValAddr: 'secretvaloper',
        bech32PrefixValPub: 'secretvaloperpub',
        bech32PrefixConsAddr: 'secretvalcons',
        bech32PrefixConsPub: 'secretvalconspub',
      },
      currencies: [
        {
          coinDenom: 'SCRT',
          coinMinimalDenom: 'uscrt',
          coinDecimals: 6,
          coinGeckoId: 'secret',
        },
      ],
      feeCurrencies: [
        {
          coinDenom: 'SCRT',
          coinMinimalDenom: 'uscrt',
          coinDecimals: 6,
          coinGeckoId: 'secret',
        },
      ],
      stakeCurrency: {
        coinDenom: 'SCRT',
        coinMinimalDenom: 'uscrt',
        coinDecimals: 6,
        coinGeckoId: 'secret',
      },
      coinType: 529,
      gasPriceStep: {
        low: 0.1,
        average: 0.25,
        high: 1,
      },
      features: ['secretwasm', 'ibc-transfer', 'ibc-go'],
      ...suggestedChain,
    }

    console.log('[suggestWalletNetworkSwitch]', chainInfo)

    try {
      await window.keplr.experimentalSuggestChain(chainInfo)
    } catch (error: any) {
      console.error(`Failed to suggest the network switch: ${error.message}`)
    }
  }, [])

  const connectWallet = useCallback(() => {
    createClient()
      .then(({ client, chainInfo }) => {
        setSecretClient(client)
        setPreferredChain(chainInfo)
      })
      .catch(error => {
        console.error(error)
        let preferredChainInfo = getPreferredChainInfo()
        setPreferredChain(preferredChainInfo)

        if (error.message === `There is no chain info for ${preferredChainInfo.chainId}`) {
          suggestWalletNetworkSwitch(preferredChainInfo)
        }
      })
  }, [suggestWalletNetworkSwitch])

  const instantiateSnip20Contract = useCallback(
    async function instantiateSnip20Contract() {
      if (!secretClient) {
        throw new Error('Cannot instantiate contract, missing Secret Network client instance')
      }

      const initMsg = {
        name: 'Test token',
        symbol: 'TTX',
        decimals: 6,
        prng_seed: btoa(window.crypto.randomUUID()),
        marketing_info: {
          project: `Atomik Labs #${window.crypto.randomUUID()}`
        }
      }

      const { contractAddress } = await secretClient.instantiate({
        codeId: snipixManifest.codeId!,
        codeHash: snipixManifest.codeHash!,
        sender: secretClient.address,
        label: `SNIP-20 token #${Math.random() * 1000}`,
        initMsg
      })

      await window.keplr!.suggestToken(preferredChain!.chainId, contractAddress)

    },
    [secretClient, preferredChain, snipixManifest]
  )

  return (
    <div>
      <h1>Yo Secret dApp</h1>
      {typeof secretClient === 'undefined' && <button onClick={connectWallet}>Connect wallet</button>}
      {secretClient === null && (
        <p>
          Could not connect wallet:{' '}
          <a href='https://www.keplr.app' target='_blank' rel='noreferrer'>
            the Keplr extension
          </a>{' '}
          is not available.
        </p>
      )}
      {secretClient && preferredChain ? (
        <div>
          <p>Wallet connected</p>
          <button onClick={instantiateSnip20Contract}>Create token contract</button>
        </div>
      ) : null}
    </div>
  )
}
