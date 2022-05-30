import { useEffect, useState, createContext, useContext } from 'react'
import { SecretNetworkClient } from 'secretjs'

const SecretJSContext = createContext({
  secretjs: null,
})

export const SecretContext = ({ children }) => {
  const [secretjs, setSecretJS] = useState(null)

  useEffect(() => {
    getScrtBalance(secretjs)
  }, [secretjs])

  useEffect(() => {
    addCustomChainToKepler()

    // https://github.com/scrtlabs/secret.js#keplr-wallet
    const setupSecretJS = async () => {
      await addCustomChainToKepler()

      const END_POINT = 'http://localhost:9091'
      const CHAIN_ID = 'secretdev-1'

      const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

      while (!window.keplr || !window.getEnigmaUtils || !window.getOfflineSignerOnlyAmino) {
        await sleep(100)
      }

      await window.keplr.enable(CHAIN_ID)

      const keplrOfflineSigner = window.getOfflineSignerOnlyAmino(CHAIN_ID)
      const [{ address: myAddress }] = await keplrOfflineSigner.getAccounts()

      const secretjs = await SecretNetworkClient.create({
        grpcWebUrl: END_POINT,
        chainId: CHAIN_ID,
        wallet: keplrOfflineSigner,
        walletAddress: myAddress,
        encryptionUtils: window.getEnigmaUtils(CHAIN_ID),
      })

      setSecretJS(secretjs)
    }

    setupSecretJS()
  }, [])

  return (
    <SecretJSContext.Provider
      value={{
        secretjs
      }}
    >
      {children}
    </SecretJSContext.Provider>
  )
}

export const useSecret = () => useContext(SecretJSContext)

async function getScrtBalance(secretjs) {
  console.log('secretjs:', secretjs)

  if (secretjs) {
    let keplrOfflineSigner = window.getOfflineSigner('secret-2')
    const [{ address: userAddress }] = await keplrOfflineSigner.getAccounts()
    console.log('userAddress:', userAddress)

    // https://github.com/scrtlabs/secret.js#sending-queries
    // TODO ERROR: http://localhost:9091/cosmos.bank.v1beta1.Query/Balance net::ERR_CONNECTION_REFUSED
    let amount
    try {
      amount = { balance: { amount } } = await secretjs.query.bank.balance({
        address: userAddress,
        denom: "uscrt",
      })
    } catch (error) {
      console.log('Balance error:', error)

    }

    console.log(`I have ${Number(amount) / 1e6} SCRT!`)
  }
}

// https://docs.scrt.network/dev/LocalSecret.html#keplr
// To add a custom chain to Keplr, use this code:
async function addCustomChainToKepler() {
  await window.keplr.experimentalSuggestChain({
    chainId: 'secretdev-1',
    chainName: 'LocalSecret',
    rpc: 'http://localhost:26657',
    rest: 'http://localhost:1317',
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
    features: ['secretwasm', 'stargate', 'ibc-transfer', 'ibc-go'],
  })
}
