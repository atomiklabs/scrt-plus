import { SecretNetworkClient } from 'secretjs'

import { CONFIG } from '../config/chain-local'

export async function getCount(
  secretjs: SecretNetworkClient,
  contractAddress = CONFIG.contractAddr,
  contractHash = CONFIG.contractHash
): Promise<number> {
  type CountResponse = { count: number }

  console.log('counterAddress', contractAddress)
  console.log('counterHash', contractHash)

  try {
    // TODO Fix:  Request failed with status code 404
    const countResponse = (await secretjs.query.compute.queryContract({
      contractAddress: contractAddress,
      codeHash: contractHash,
      query: { get_count: {} },
    })) as CountResponse
    
    if ('err"' in countResponse) {
      throw new Error(`Query failed with the following err: ${JSON.stringify(countResponse)}`)
    }

    return countResponse.count;
  } catch (error) {
    console.error(error)
    return -1
  }
}
