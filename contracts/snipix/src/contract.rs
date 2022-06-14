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
        HandleMsg::SetMarketingInfo { marketing_info, .. } => handle_set_marketing_info(deps, marketing_info),
        msg => atl_snip20_reference_impl::contract::handle(deps, env, msg.try_into()?),
    }
}

pub fn query<S: Storage, A: Api, Q: Querier>(deps: &Extern<S, A, Q>, msg: QueryMsg) -> QueryResult {
    match msg {
        QueryMsg::MarketingInfo {} => query_marketing_info(deps),
        msg => atl_snip20_reference_impl::contract::query(deps, msg.try_into()?),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::msg::{Logo, MarketingInfo, QueryAnswer};
    use cosmwasm_std::{
        from_binary,
        testing::{mock_dependencies, mock_env, MockApi, MockQuerier, MockStorage},
        Binary, HumanAddr,
    };

    fn init_helper(
        marketing_info: Option<MarketingInfo>,
    ) -> (
        StdResult<InitResponse>,
        Extern<MockStorage, MockApi, MockQuerier>,
    ) {
        let mut deps = mock_dependencies(20, &[]);
        let env = mock_env("instantiator", &[]);

        let init_msg = InitMsg {
            name: "sec-sec".to_string(),
            admin: Some(HumanAddr("admin".to_string())),
            symbol: "SECSEC".to_string(),
            decimals: 8,
            initial_balances: None,
            prng_seed: Binary::from("lolz fun yay".as_bytes()),
            config: None,
            marketing_info,
        };

        (init(&mut deps, env, init_msg), deps)
    }

    #[test]
    fn test_initiate_marketing_info() {
        let init_marketing_info = Some(MarketingInfo {
            project: None,
            description: None,
            marketing: None,
            logo: Some(Logo::Url(
                "https://assets.coingecko.com/coins/images/11871/large/Secret.png".into(),
            )),
        });

        let (init_result, deps) = init_helper(init_marketing_info.clone());

        assert!(init_result.is_ok());

        let query_result: QueryAnswer =
            from_binary(&query(&deps, QueryMsg::MarketingInfo {}).unwrap()).unwrap();

        match query_result {
            QueryAnswer::MarketingInfo { marketing_info } => {
                assert_eq!(init_marketing_info, marketing_info)
            }
            _ => panic!("Impossible"),
        }
    }

    #[test]
    fn test_update_marketing_info() {
        let init_marketing_info = None;

        let (_, mut deps) = init_helper(init_marketing_info.clone());

        let wanted_marketing_info = Some(MarketingInfo {
            project: Some("Deploy Contracts".into()),
            description: Some("Click, click, click, and here's your own SNIP-20 token".into()),
            marketing: None,
            logo: Some(Logo::Url(
                "https://assets.coingecko.com/coins/images/11871/large/Secret.png".into(),
            )),
        });

        let handle_response = handle(
            &mut deps,
            mock_env("sender", &[]),
            HandleMsg::SetMarketingInfo {
                marketing_info: wanted_marketing_info.clone(),
                padding: None,
            },
        );

        assert!(handle_response.is_ok());

        let query_result: QueryAnswer =
            from_binary(&query(&deps, QueryMsg::MarketingInfo {}).unwrap()).unwrap();

        match query_result {
            QueryAnswer::MarketingInfo { marketing_info } => {
                assert_eq!(marketing_info, wanted_marketing_info)
            }
            _ => panic!("Impossible"),
        }
    }
}
