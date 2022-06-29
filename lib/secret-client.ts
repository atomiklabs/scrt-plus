import { MsgInstantiateContractParams, SecretNetworkClient, Wallet } from 'secretjs'
import type { CreateClientOptions } from 'secretjs'
import type { Window as KeplrWindow } from '@keplr-wallet/types'

declare global {
  interface Window extends KeplrWindow { }
}

export { SecretNetworkClient, Wallet }

export interface ContractManifest {
  codeId?: number
  codeHash?: string
  contractAddress?: string
}

export interface StoreCodeResult {
  codeId: number;
  codeHash: string;
}

export type InstantiateContractProps = Omit<MsgInstantiateContractParams, 'sender'>

export interface InstantiateContractResult {
  contractAddress: string
}

export interface SecretNetworkExtendedClient extends SecretNetworkClient {
  storeCode: (wasmByteCode: Buffer, contractSourceCodeUrl?: string) => Promise<StoreCodeResult>
  instantiateContract: (props: InstantiateContractProps) => Promise<InstantiateContractResult>
  suggestAddingSecretNetworkToKeplrApp: (props: Partial<ChainInfo>) => Promise<void>
}

type ChainInfo = {
  grpcUrl: CreateClientOptions['grpcWebUrl']
  rpcUrl?: string
  restUrl?: string
  chainName?: string
}

type CreateClientProps = Omit<CreateClientOptions, 'grpcWebUrl'> & ChainInfo

type CreateClientResult = {
  client: SecretNetworkExtendedClient
  chainInfo: Partial<ChainInfo>
}

export async function createClient(props: CreateClientProps): Promise<CreateClientResult> {
  const grpcUrl = props.grpcUrl
  const rpcUrl = props.rpcUrl
  const restUrl = props.restUrl
  const chainId = props.chainId
  const chainName = props.chainName

  let signer = props.wallet
  let walletAddress = props.walletAddress
  let encryptionUtils = props.encryptionUtils

  // if no signer defined
  if (typeof props.wallet === 'undefined') {
    // if browser env available -> try using Keplr as a signer
    const hasBrowserDepsAvailable = () =>
      typeof window !== 'undefined' &&
      typeof window.keplr !== 'undefined' &&
      typeof window.getEnigmaUtils === 'function' &&
      typeof window.getOfflineSignerOnlyAmino === 'function'

    if (hasBrowserDepsAvailable()) {
      await window.keplr!.enable(chainId)

      encryptionUtils = window.getEnigmaUtils!(chainId)
      signer = window.getOfflineSignerOnlyAmino!(chainId)
      walletAddress = (await signer.getAccounts())[0].address
    } else {
      const offlineSigner = new Wallet() // Use default constructor of wallet to generate random mnemonic.
      walletAddress = offlineSigner.address
      signer = offlineSigner
    }
  }

  const client = await SecretNetworkClient.create({
    wallet: signer,
    grpcWebUrl: grpcUrl,
    chainId,
    walletAddress,
    encryptionUtils,
  })


  async function storeCode(wasmByteCode: Buffer, contractSourceCodeUrl: string = ''): Promise<StoreCodeResult> {
    console.log('Uploading contract')

    const uploadReceipt = await client.tx.compute.storeCode(
      {
        wasmByteCode: wasmByteCode,
        sender: client.address,
        source: contractSourceCodeUrl,
        builder: '',
      },
      {
        gasLimit: 5000000,
      }
    )

    if (uploadReceipt.code !== 0) {
      console.log(`Failed to get code id: ${JSON.stringify(uploadReceipt.rawLog)}`)
      throw new Error(`Failed to upload contract`)
    }

    const codeIdKv = uploadReceipt.jsonLog![0].events[0].attributes.find((a: any) => {
      return a.key === 'code_id'
    })

    if (!codeIdKv) {
      console.log(`Failed to get code id: ${JSON.stringify(uploadReceipt.rawLog)}`)
      throw new Error(`Failed to upload contract`)
    }

    const codeId = Number(codeIdKv.value)
    const codeHash = await client.query.compute.codeHash(codeId)

    return { codeId, codeHash }
  }

  async function instantiateContract({ codeId, codeHash, initMsg, label }: InstantiateContractProps): Promise<InstantiateContractResult> {
    const contract = await client.tx.compute.instantiateContract(
      {
        sender: client.address,
        codeId,
        codeHash,
        initMsg,
        label,
      },
      {
        gasLimit: 1000000,
      }
    )

    if (contract.code !== 0) {
      throw new Error(`Failed to instantiate the contract with the following error ${contract.rawLog}`)
    }

    const contractAddress = contract.arrayLog!.find(
      log => log.type === 'message' && log.key === 'contract_address'
    )!.value

    return { contractAddress }
  }

  async function suggestAddingSecretNetworkToKeplrApp({ restUrl: restUrlOverride, rpcUrl: rpcUrlOverride, chainName: chainNameOverride }: Partial<ChainInfo> = {}) {
    if (typeof window.keplr === 'undefined') {
      throw Error('Wallet is not connected. Connect and try again.')
    }

    const completeChainInfo = {
      rpc: rpcUrlOverride || rpcUrl || '',
      rest: restUrlOverride || restUrl || '',
      chainName: chainNameOverride || chainName || '',
      chainId,
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
    }

    if (completeChainInfo.chainId === 'mainnet') {
      // we never have to suggest adding the Secret Netwrok Mainnet
      console.error('The Secret Netwrok Mainnet is already present in the Keplr App');
      return;
    }


    try {
      if (!completeChainInfo.chainName) {
        throw new Error('Suggested chain info is missing `chainName` property')
      }

      if (!completeChainInfo.rpc) {
        throw new Error('Suggested chain info is missing `rpcUrl` property')
      }

      if (!completeChainInfo.rest) {
        throw new Error('Suggested chain info is missing `restUrl` property')
      }

      await window.keplr.experimentalSuggestChain(completeChainInfo)
    } catch (error: any) {
      console.error(`Failed to suggest the network switch: ${error.message}`)
    }
  }

  const extendedClient: SecretNetworkExtendedClient = Object.assign(client, {
    storeCode,
    instantiateContract,
    suggestAddingSecretNetworkToKeplrApp,
  })

  return {
    client: extendedClient,
    chainInfo: {
      chainName,
      grpcUrl,
      rpcUrl,
      restUrl,
    },
  }
}
