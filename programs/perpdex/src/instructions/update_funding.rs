use anchor_lang::prelude::*;
use crate::state::Market;
use crate::errors::PerpDexError;
use crate::instructions::oracle::get_oracle_price;

const FUNDING_PRECISION: i64 = 1_000_000;

#[derive(Accounts)]
pub struct UpdateFunding<'info> {
    #[account(mut)]
    pub market: Account<'info, Market>,
    /// CHECK: Pyth oracle account - should use pyth_sdk_solana in production
    pub pyth_oracle: UncheckedAccount<'info>,
}

pub fn handler(ctx: Context<UpdateFunding>) -> Result<()> {
    // Verify oracle is the expected one for this market
    require!(
        ctx.accounts.pyth_oracle.key() == ctx.accounts.market.pyth_oracle,
        PerpDexError::InvalidOracleAccount
    );

    let index_price = get_oracle_price(&ctx.accounts.pyth_oracle.to_account_info())?;
    let market = &mut ctx.accounts.market;

    // Use mark price if set, otherwise use index_price
    let mark_price = if market.mark_price > 0 {
        market.mark_price
    } else {
        index_price
    };

    market.index_price = index_price;

    // Compute funding rate: (mark_price - index_price) / index_price * FUNDING_PRECISION
    if index_price > 0 {
        let price_diff = mark_price as i64 - index_price as i64;
        let funding_rate = price_diff
            .checked_mul(FUNDING_PRECISION)
            .unwrap_or(0)
            .checked_div(index_price as i64)
            .unwrap_or(0);

        market.cumulative_funding_rate = market.cumulative_funding_rate
            .checked_add(funding_rate)
            .unwrap_or(market.cumulative_funding_rate);
    }

    msg!(
        "Updated funding: index_price={}, mark_price={}, cumulative_funding_rate={}",
        index_price,
        mark_price,
        market.cumulative_funding_rate
    );
    Ok(())
}
