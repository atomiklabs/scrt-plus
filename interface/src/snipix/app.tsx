import { useCallback, useState } from 'react'
import { createClient, getPreferredChainInfo } from './secret-client'
import type { SecretNetworkClient, PreferredChainInfo } from './secret-client'

export default function App() {
  const [secretClient, setSecretClient] = useState<SecretNetworkClient | null>()
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
        </div>
      ) : null}
    </div>
  )
}
