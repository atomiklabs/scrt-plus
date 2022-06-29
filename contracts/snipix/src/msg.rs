use std::convert::TryInto;

use atl_snip20_reference_impl::{batch, msg, transaction_history, viewing_key};
use cosmwasm_std::{Binary, HumanAddr, StdError, Uint128};
use schemars::JsonSchema;
use secret_toolkit::permit::Permit;
use serde::{Deserialize, Serialize};

/// This is used for uploading logo data, or setting it in InstantiateData
#[derive(Serialize, Deserialize, Clone, PartialEq, JsonSchema, Debug)]
#[serde(rename_all = "snake_case")]
pub enum Logo {
    /// A reference to an externally hosted logo. Must be a valid HTTP or HTTPS URL.
    Url(String),
    /// Logo content stored on the blockchain. Enforce maximum size of 5KB on all variants
    Embedded(EmbeddedLogo),
}

/// This is used to store the logo on the blockchain in an accepted format.
/// Enforce maximum size of 5KB on all variants.
#[derive(Serialize, Deserialize, Clone, PartialEq, JsonSchema, Debug)]
#[serde(rename_all = "snake_case")]
pub enum EmbeddedLogo {
    /// Store the Logo as an SVG file. The content must conform to the spec
    /// at https://en.wikipedia.org/wiki/Scalable_Vector_Graphics
    /// (The contract should do some light-weight sanity-check validation)
    Svg(Binary),
    /// Store the Logo as a PNG file. This will likely only support up to 64x64 or so
    /// within the 5KB limit.
    Png(Binary),
}

#[derive(Serialize, Deserialize, JsonSchema, Debug, Clone, PartialEq)]
pub struct MarketingInfo {
    pub project: Option<String>,
    pub description: Option<String>,
    pub marketing: Option<String>,
    pub logo: Option<Logo>,
}

#[derive(Serialize, Deserialize, JsonSchema, Clone, Debug, PartialEq)]
pub struct InitMsg {
    pub name: String,
    pub admin: Option<HumanAddr>,
    pub symbol: String,
    pub decimals: u8,
    pub initial_balances: Option<Vec<msg::InitialBalance>>,
    pub prng_seed: Binary,
    pub config: Option<msg::InitConfig>,
    pub marketing_info: Option<MarketingInfo>,
}

impl Into<msg::InitMsg> for InitMsg {
    fn into(self) -> msg::InitMsg {
        msg::InitMsg {
            name: self.name,
            admin: self.admin,
            symbol: self.symbol,
            decimals: self.decimals,
            initial_balances: self.initial_balances,
            prng_seed: self.prng_seed,
            config: self.config,
        }
    }
}

#[derive(Serialize, Deserialize, JsonSchema, Clone, Debug, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum HandleMsg {
    // Native coin interactions
    Redeem {
        amount: Uint128,
        denom: Option<String>,
        padding: Option<String>,
    },
    Deposit {
        padding: Option<String>,
    },

    // Base ERC-20 stuff
    Transfer {
        recipient: HumanAddr,
        amount: Uint128,
        memo: Option<String>,
        padding: Option<String>,
    },
    Send {
        recipient: HumanAddr,
        recipient_code_hash: Option<String>,
        amount: Uint128,
        msg: Option<Binary>,
        memo: Option<String>,
        padding: Option<String>,
    },
    BatchTransfer {
        actions: Vec<batch::TransferAction>,
        padding: Option<String>,
    },
    BatchSend {
        actions: Vec<batch::SendAction>,
        padding: Option<String>,
    },
    Burn {
        amount: Uint128,
        memo: Option<String>,
        padding: Option<String>,
    },
    RegisterReceive {
        code_hash: String,
        padding: Option<String>,
    },
    CreateViewingKey {
        entropy: String,
        padding: Option<String>,
    },
    SetViewingKey {
        key: String,
        padding: Option<String>,
    },

    // Allowance
    IncreaseAllowance {
        spender: HumanAddr,
        amount: Uint128,
        expiration: Option<u64>,
        padding: Option<String>,
    },
    DecreaseAllowance {
        spender: HumanAddr,
        amount: Uint128,
        expiration: Option<u64>,
        padding: Option<String>,
    },
    TransferFrom {
        owner: HumanAddr,
        recipient: HumanAddr,
        amount: Uint128,
        memo: Option<String>,
        padding: Option<String>,
    },
    SendFrom {
        owner: HumanAddr,
        recipient: HumanAddr,
        recipient_code_hash: Option<String>,
        amount: Uint128,
        msg: Option<Binary>,
        memo: Option<String>,
        padding: Option<String>,
    },
    BatchTransferFrom {
        actions: Vec<batch::TransferFromAction>,
        padding: Option<String>,
    },
    BatchSendFrom {
        actions: Vec<batch::SendFromAction>,
        padding: Option<String>,
    },
    BurnFrom {
        owner: HumanAddr,
        amount: Uint128,
        memo: Option<String>,
        padding: Option<String>,
    },
    BatchBurnFrom {
        actions: Vec<batch::BurnFromAction>,
        padding: Option<String>,
    },

    // Mint
    Mint {
        recipient: HumanAddr,
        amount: Uint128,
        memo: Option<String>,
        padding: Option<String>,
    },
    BatchMint {
        actions: Vec<batch::MintAction>,
        padding: Option<String>,
    },
    AddMinters {
        minters: Vec<HumanAddr>,
        padding: Option<String>,
    },
    RemoveMinters {
        minters: Vec<HumanAddr>,
        padding: Option<String>,
    },
    SetMinters {
        minters: Vec<HumanAddr>,
        padding: Option<String>,
    },

    // Admin
    ChangeAdmin {
        address: HumanAddr,
        padding: Option<String>,
    },
    SetContractStatus {
        level: msg::ContractStatusLevel,
        padding: Option<String>,
    },

    // Permit
    RevokePermit {
        permit_name: String,
        padding: Option<String>,
    },

    // MarketingInfo
    SetMarketingInfo {
        marketing_info: Option<MarketingInfo>,
        padding: Option<String>,
    },
}

impl TryInto<msg::HandleMsg> for HandleMsg {
    type Error = StdError;

    fn try_into(self) -> Result<msg::HandleMsg, Self::Error> {
        match self {
            HandleMsg::Redeem {
                amount,
                denom,
                padding,
            } => Ok(msg::HandleMsg::Redeem {
                amount,
                denom,
                padding,
            }),
            HandleMsg::Deposit { padding } => Ok(msg::HandleMsg::Deposit { padding }),
            HandleMsg::Transfer {
                recipient,
                amount,
                memo,
                padding,
            } => Ok(msg::HandleMsg::Transfer {
                recipient,
                amount,
                memo,
                padding,
            }),
            HandleMsg::Send {
                recipient,
                recipient_code_hash,
                amount,
                msg,
                memo,
                padding,
            } => Ok(msg::HandleMsg::Send {
                recipient,
                recipient_code_hash,
                amount,
                msg,
                memo,
                padding,
            }),
            HandleMsg::BatchTransfer { actions, padding } => {
                Ok(msg::HandleMsg::BatchTransfer { actions, padding })
            }
            HandleMsg::BatchSend { actions, padding } => {
                Ok(msg::HandleMsg::BatchSend { actions, padding })
            }
            HandleMsg::Burn {
                amount,
                memo,
                padding,
            } => Ok(msg::HandleMsg::Burn {
                amount,
                memo,
                padding,
            }),
            HandleMsg::RegisterReceive { code_hash, padding } => {
                Ok(msg::HandleMsg::RegisterReceive { code_hash, padding })
            }
            HandleMsg::CreateViewingKey { entropy, padding } => {
                Ok(msg::HandleMsg::CreateViewingKey { entropy, padding })
            }
            HandleMsg::SetViewingKey { key, padding } => {
                Ok(msg::HandleMsg::SetViewingKey { key, padding })
            }
            HandleMsg::IncreaseAllowance {
                spender,
                amount,
                expiration,
                padding,
            } => Ok(msg::HandleMsg::IncreaseAllowance {
                spender,
                amount,
                expiration,
                padding,
            }),
            HandleMsg::DecreaseAllowance {
                spender,
                amount,
                expiration,
                padding,
            } => Ok(msg::HandleMsg::DecreaseAllowance {
                spender,
                amount,
                expiration,
                padding,
            }),
            HandleMsg::TransferFrom {
                owner,
                recipient,
                amount,
                memo,
                padding,
            } => Ok(msg::HandleMsg::TransferFrom {
                owner,
                recipient,
                amount,
                memo,
                padding,
            }),
            HandleMsg::SendFrom {
                owner,
                recipient,
                recipient_code_hash,
                amount,
                msg,
                memo,
                padding,
            } => Ok(msg::HandleMsg::SendFrom {
                owner,
                recipient,
                recipient_code_hash,
                amount,
                msg,
                memo,
                padding,
            }),
            HandleMsg::BatchTransferFrom { actions, padding } => {
                Ok(msg::HandleMsg::BatchTransferFrom { actions, padding })
            }
            HandleMsg::BatchSendFrom { actions, padding } => {
                Ok(msg::HandleMsg::BatchSendFrom { actions, padding })
            }
            HandleMsg::BurnFrom {
                owner,
                amount,
                memo,
                padding,
            } => Ok(msg::HandleMsg::BurnFrom {
                owner,
                amount,
                memo,
                padding,
            }),
            HandleMsg::BatchBurnFrom { actions, padding } => {
                Ok(msg::HandleMsg::BatchBurnFrom { actions, padding })
            }
            HandleMsg::Mint {
                recipient,
                amount,
                memo,
                padding,
            } => Ok(msg::HandleMsg::Mint {
                recipient,
                amount,
                memo,
                padding,
            }),
            HandleMsg::BatchMint { actions, padding } => {
                Ok(msg::HandleMsg::BatchMint { actions, padding })
            }
            HandleMsg::AddMinters { minters, padding } => {
                Ok(msg::HandleMsg::AddMinters { minters, padding })
            }
            HandleMsg::RemoveMinters { minters, padding } => {
                Ok(msg::HandleMsg::RemoveMinters { minters, padding })
            }
            HandleMsg::SetMinters { minters, padding } => {
                Ok(msg::HandleMsg::SetMinters { minters, padding })
            }
            HandleMsg::ChangeAdmin { address, padding } => {
                Ok(msg::HandleMsg::ChangeAdmin { address, padding })
            }
            HandleMsg::SetContractStatus { level, padding } => {
                Ok(msg::HandleMsg::SetContractStatus { level, padding })
            }
            HandleMsg::RevokePermit {
                permit_name,
                padding,
            } => Ok(msg::HandleMsg::RevokePermit {
                permit_name,
                padding,
            }),
            _ => Err(StdError::generic_err("Cannot convert into the target type")),
        }
    }
}

#[derive(Serialize, Deserialize, JsonSchema, Clone, Debug, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum HandleAnswer {
    // Native
    Deposit {
        status: msg::ResponseStatus,
    },
    Redeem {
        status: msg::ResponseStatus,
    },

    // Base
    Transfer {
        status: msg::ResponseStatus,
    },
    Send {
        status: msg::ResponseStatus,
    },
    BatchTransfer {
        status: msg::ResponseStatus,
    },
    BatchSend {
        status: msg::ResponseStatus,
    },
    Burn {
        status: msg::ResponseStatus,
    },
    RegisterReceive {
        status: msg::ResponseStatus,
    },
    CreateViewingKey {
        key: viewing_key::ViewingKey,
    },
    SetViewingKey {
        status: msg::ResponseStatus,
    },

    // Allowance
    IncreaseAllowance {
        spender: HumanAddr,
        owner: HumanAddr,
        allowance: Uint128,
    },
    DecreaseAllowance {
        spender: HumanAddr,
        owner: HumanAddr,
        allowance: Uint128,
    },
    TransferFrom {
        status: msg::ResponseStatus,
    },
    SendFrom {
        status: msg::ResponseStatus,
    },
    BatchTransferFrom {
        status: msg::ResponseStatus,
    },
    BatchSendFrom {
        status: msg::ResponseStatus,
    },
    BurnFrom {
        status: msg::ResponseStatus,
    },
    BatchBurnFrom {
        status: msg::ResponseStatus,
    },

    // Mint
    Mint {
        status: msg::ResponseStatus,
    },
    BatchMint {
        status: msg::ResponseStatus,
    },
    AddMinters {
        status: msg::ResponseStatus,
    },
    RemoveMinters {
        status: msg::ResponseStatus,
    },
    SetMinters {
        status: msg::ResponseStatus,
    },

    // Other
    ChangeAdmin {
        status: msg::ResponseStatus,
    },
    SetContractStatus {
        status: msg::ResponseStatus,
    },

    // Permit
    RevokePermit {
        status: msg::ResponseStatus,
    },

    // MarketingInfo
    SetMarketingInfo {
        status: msg::ResponseStatus,
    },
}

#[derive(Serialize, Deserialize, JsonSchema, Clone, Debug, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum QueryMsg {
    TokenInfo {},
    TokenConfig {},
    ContractStatus {},
    ExchangeRate {},
    Allowance {
        owner: HumanAddr,
        spender: HumanAddr,
        key: String,
    },
    Balance {
        address: HumanAddr,
        key: String,
    },
    TransferHistory {
        address: HumanAddr,
        key: String,
        page: Option<u32>,
        page_size: u32,
    },
    TransactionHistory {
        address: HumanAddr,
        key: String,
        page: Option<u32>,
        page_size: u32,
    },
    Minters {},
    WithPermit {
        permit: Permit,
        query: msg::QueryWithPermit,
    },
    MarketingInfo {},
}

impl TryInto<msg::QueryMsg> for QueryMsg {
    type Error = StdError;

    fn try_into(self) -> Result<msg::QueryMsg, Self::Error> {
        match self {
            QueryMsg::TokenInfo {} => Ok(msg::QueryMsg::TokenInfo {}),
            QueryMsg::TokenConfig {} => Ok(msg::QueryMsg::TokenConfig {}),
            QueryMsg::ContractStatus {} => Ok(msg::QueryMsg::ContractStatus {}),
            QueryMsg::ExchangeRate {} => Ok(msg::QueryMsg::ExchangeRate {}),
            QueryMsg::Allowance {
                owner,
                spender,
                key,
            } => Ok(msg::QueryMsg::Allowance {
                owner,
                spender,
                key,
            }),
            QueryMsg::Balance { address, key } => Ok(msg::QueryMsg::Balance { address, key }),
            QueryMsg::TransferHistory {
                address,
                key,
                page,
                page_size,
            } => Ok(msg::QueryMsg::TransferHistory {
                address,
                key,
                page,
                page_size,
            }),
            QueryMsg::TransactionHistory {
                address,
                key,
                page,
                page_size,
            } => Ok(msg::QueryMsg::TransactionHistory {
                address,
                key,
                page,
                page_size,
            }),
            QueryMsg::Minters {} => Ok(msg::QueryMsg::Minters {}),
            QueryMsg::WithPermit { permit, query } => {
                Ok(msg::QueryMsg::WithPermit { permit, query })
            }
            _ => Err(StdError::generic_err("Cannot convert into the target type")),
        }
    }
}

#[derive(Serialize, Deserialize, JsonSchema, Clone, Debug, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum QueryAnswer {
    TokenInfo {
        name: String,
        symbol: String,
        decimals: u8,
        total_supply: Option<Uint128>,
    },
    TokenConfig {
        public_total_supply: bool,
        deposit_enabled: bool,
        redeem_enabled: bool,
        mint_enabled: bool,
        burn_enabled: bool,
    },
    ContractStatus {
        status: msg::ContractStatusLevel,
    },
    ExchangeRate {
        rate: Uint128,
        denom: String,
    },
    Allowance {
        spender: HumanAddr,
        owner: HumanAddr,
        allowance: Uint128,
        expiration: Option<u64>,
    },
    Balance {
        amount: Uint128,
    },
    TransferHistory {
        txs: Vec<transaction_history::Tx>,
        total: Option<u64>,
    },
    TransactionHistory {
        txs: Vec<transaction_history::RichTx>,
        total: Option<u64>,
    },
    ViewingKeyError {
        msg: String,
    },
    Minters {
        minters: Vec<HumanAddr>,
    },
    MarketingInfo {
        marketing_info: Option<MarketingInfo>,
    },
}
