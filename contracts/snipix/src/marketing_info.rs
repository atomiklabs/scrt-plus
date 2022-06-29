use crate::msg::{HandleAnswer, MarketingInfo, QueryAnswer};
use atl_snip20_reference_impl::msg::ResponseStatus;
use cosmwasm_std::{to_binary, Api, Binary, Extern, HandleResponse, Querier, StdResult, Storage};
use cosmwasm_storage::{singleton, singleton_read, ReadonlySingleton, Singleton};

pub fn init_marketing_info<S: Storage, A: Api, Q: Querier>(
    deps: &mut Extern<S, A, Q>,
    marketing_info: MarketingInfo,
) -> StdResult<()> {
    write_marketing_info(&mut deps.storage).save(&Some(marketing_info))
}

pub fn handle_set_marketing_info<S: Storage, A: Api, Q: Querier>(
    deps: &mut Extern<S, A, Q>,
    marketing_info: Option<MarketingInfo>,
) -> StdResult<HandleResponse> {
    write_marketing_info(&mut deps.storage).save(&marketing_info)?;

    Ok(HandleResponse {
        messages: vec![],
        log: vec![],
        data: Some(to_binary(&HandleAnswer::SetMarketingInfo {
            status: ResponseStatus::Success,
        })?),
    })
}

pub fn query_marketing_info<S: Storage, A: Api, Q: Querier>(
    deps: &Extern<S, A, Q>,
) -> StdResult<Binary> {
    let marketing_info = read_marketing_info(&deps.storage).load()?;

    let response = QueryAnswer::MarketingInfo { marketing_info };
    
    to_binary(&response)
}

pub const PREFIX_MARKETING_INFO: &[u8] = b"marketing_info";

pub fn read_marketing_info<S: Storage>(storage: &S) -> ReadonlySingleton<S, Option<MarketingInfo>> {
    singleton_read(storage, PREFIX_MARKETING_INFO)
}

pub fn write_marketing_info<S: Storage>(storage: &mut S) -> Singleton<S, Option<MarketingInfo>> {
    singleton(storage, PREFIX_MARKETING_INFO)
}
