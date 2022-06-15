import { MsgInstantiateContractParams, SecretNetworkClient, Wallet } from 'secretjs'
import type { CreateClientOptions } from 'secretjs'

import { LOCAL_CONFIG } from './config/index'
import type { Window as KeplrWindow } from '@keplr-wallet/types'

declare global {
  interface Window extends KeplrWindow {}
}

export { SecretNetworkClient, Wallet }

export interface ContractManifest {
  codeId?: number
  codeHash?: string
  contractAddress?: string
}

export interface PreferredChainInfo {
  chainId: string
  chainName: string
  rpc: string
  rest: string
}

export interface StoreCodeResult {
  codeId: number;
  codeHash: string;
}

export interface SecretNetworkExtendedClient extends SecretNetworkClient {
  storeCode: (wasmByteCode: Buffer) => Promise<StoreCodeResult>
}

type CreateClientProps = CreateClientOptions
type CreateClientResult = {
  client: SecretNetworkExtendedClient
  chainInfo: PreferredChainInfo
}

export async function createClient(options?: Partial<CreateClientProps>): Promise<CreateClientResult> {
  let grpcWebUrl = options?.grpcWebUrl || LOCAL_CONFIG.CHAIN_gRPC
  let chainId = options?.chainId || LOCAL_CONFIG.CHAIN_ID
  let signer = options?.wallet
  let walletAddress = options?.walletAddress
  let encryptionUtils = options?.encryptionUtils

  // if no signer defined
  if (typeof options?.wallet === 'undefined') {
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
    chainId,
    grpcWebUrl,
    walletAddress,
    encryptionUtils,
  })

  const extendedClient: SecretNetworkExtendedClient = Object.assign(client, {
    async storeCode(wasmByteCode: Buffer): Promise<StoreCodeResult> {
      console.log('Uploading contract')

      const uploadReceipt = await client.tx.compute.storeCode(
        {
          wasmByteCode: wasmByteCode,
          sender: client.address,
          source: '',
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
    },
    async intstantiate({ codeId, codeHash, initMsg, label }: MsgInstantiateContractParams) {
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
    
      console.log(`Contract address: ${contractAddress}`)

      return { contractAddress }
    }
  })

  return {
    client: extendedClient,
    chainInfo: getPreferredChainInfo(),
  }
}

export function getPreferredChainInfo() {
  return {
    chainId: LOCAL_CONFIG.CHAIN_ID,
    chainName: LOCAL_CONFIG.CHAIN_NAME,
    rpc: LOCAL_CONFIG.CHAIN_RPC,
    rest: LOCAL_CONFIG.CHAIN_REST,
  }
}
