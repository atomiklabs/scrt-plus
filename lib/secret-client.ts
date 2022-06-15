import { SecretNetworkClient, Wallet } from "secretjs";
import type { CreateClientOptions } from "secretjs"

import { LOCAL_CONFIG } from './config'
import type { Window as KeplrWindow } from '@keplr-wallet/types'

declare global {
  interface Window extends KeplrWindow { }
}

export { SecretNetworkClient, Wallet }

export interface PreferredChainInfo {
  chainId: string;
  chainName: string;
  rpc: string;
  rest: string;
}

type CreateClientProps = CreateClientOptions;
type CreateClientResult = {
  client: SecretNetworkClient;
  chainInfo: PreferredChainInfo;
}

export async function createClient(options?: Partial<CreateClientProps>): Promise<CreateClientResult> {
  let grpcWebUrl = options?.grpcWebUrl || LOCAL_CONFIG.CHAIN_gRPC;
  let chainId = options?.chainId || LOCAL_CONFIG.CHAIN_ID;
  let signer = options?.wallet;
  let walletAddress = options?.walletAddress;
  let encryptionUtils = options?.encryptionUtils;

  // if no signer defined
  if (typeof options?.wallet === 'undefined') {
    // if browser env available -> try using Keplr as a signer
    const hasBrowserDepsAvailable = () =>
      typeof window !== 'undefined' &&
      typeof window.keplr !== 'undefined' &&
      typeof window.getEnigmaUtils === 'function' &&
      typeof window.getOfflineSignerOnlyAmino === 'function'

    if (hasBrowserDepsAvailable()) {
      await window.keplr!.enable(chainId);

      encryptionUtils = window.getEnigmaUtils!(chainId);
      signer = window.getOfflineSignerOnlyAmino!(chainId);
      walletAddress = (await signer.getAccounts())[0].address;
    } else {
      const offlineSigner = new Wallet() // Use default constructor of wallet to generate random mnemonic.
      walletAddress = offlineSigner.address
      signer = offlineSigner
    }
  }

  return {
    client: await SecretNetworkClient.create({
      wallet: signer,
      chainId,
      grpcWebUrl,
      walletAddress,
      encryptionUtils,
    }),
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