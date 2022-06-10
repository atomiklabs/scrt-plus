use cosmwasm_std::{Api,Extern,Querier,StdResult,Storage};
use crate::msg::InstantiateMarketingInfo;

pub fn init_marketing_info<S: Storage, A: Api, Q: Querier>(
    deps: &mut Extern<S, A, Q>,
    marketing_info: InstantiateMarketingInfo
) -> StdResult<()> {
    Ok(())
}