export type HumanAddr = string

export type Uint128 = string

export type Binary = string

export type Logo = { url: string } | { embedded: EmbeddedLogo }

export type EmbeddedLogo = { svg: Binary } | { png: Binary }

export interface InitConfig {
  enable_burn?: boolean | null
  enable_deposit?: boolean | null
  enable_mint?: boolean | null
  enable_redeem?: boolean | null
  public_total_supply?: boolean | null
}

export interface Snip20InitMsg {
  admin?: HumanAddr | null
  config?: InitConfig | null
  decimals: number
  initial_balances?: Array<InitialBalance> | null
  name: string
  prng_seed: Binary
  symbol: string
}

export interface SnipixInitMsg extends Snip20InitMsg {
  marketing_info?: MarketingInfo | null
}

export interface MarketingInfoResponse {
  marketing_info: {
    marketing_info: MarketingInfo | null
  }
}

export interface InitialBalance {
  address: HumanAddr
  amount: Uint128
}

export interface MarketingInfo {
  description?: string | null
  logo?: Logo | null
  marketing?: string | null
  project?: string | null
}
