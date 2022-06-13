use std::convert::TryInto;

use crate::{
    marketing_info::{handle_set_marketing_info, init_marketing_info, query_marketing_info},
    msg::{HandleMsg, InitMsg, QueryMsg},
};
pub use atl_snip20_reference_impl::contract::*;
use cosmwasm_std::{
    Api, Env, Extern, HandleResponse, InitResponse, Querier, QueryResult, StdResult, Storage,
};

pub fn init<S: Storage, A: Api, Q: Querier>(
    deps: &mut Extern<S, A, Q>,
    env: Env,
    msg: InitMsg,
) -> StdResult<InitResponse> {
    if let Some(marketing_info) = msg.clone().marketing_info {
        init_marketing_info(deps, marketing_info)?;
    }

    atl_snip20_reference_impl::contract::init(deps, env, msg.into())
}

pub fn handle<S: Storage, A: Api, Q: Querier>(
    deps: &mut Extern<S, A, Q>,
    env: Env,
    msg: HandleMsg,
) -> StdResult<HandleResponse> {
    match msg {
        HandleMsg::SetMarketingInfo { marketing_info } => {
            handle_set_marketing_info(deps, marketing_info)
        }
        msg => atl_snip20_reference_impl::contract::handle(deps, env, msg.try_into()?),
    }
}

pub fn query<S: Storage, A: Api, Q: Querier>(deps: &Extern<S, A, Q>, msg: QueryMsg) -> QueryResult {
    match msg {
        QueryMsg::MarketingInfo {} => query_marketing_info(deps),
        msg => atl_snip20_reference_impl::contract::query(deps, msg.try_into()?),
    }
}
