use anchor_lang::prelude::*;
use crate::state::{Exchange, Market, UserAccount, Position, PositionSide};
use crate::errors::PerpDexError;
use crate::instructions::oracle::get_oracle_price;

// Maintenance margin ratio: 5% = 500 bps
const MAINTENANCE_MARGIN_BPS: u64 = 500;
const BPS_DENOMINATOR: u64 = 10_000;
const PRICE_PRECISION: u64 = 1_000_000;

#[derive(Accounts)]
pub struct Liquidate<'info> {
    #[account(mut)]
    pub liquidator: Signer<'info>,
    #[account(
        seeds = [b"exchange"],
        bump = exchange.bump,
    )]
    pub exchange: Account<'info, Exchange>,
    #[account(
        mut,
        constraint = market.exchange == exchange.key(),
    )]
    pub market: Account<'info, Market>,
    #[account(
        mut,
        constraint = user_account.exchange == exchange.key(),
    )]
    pub user_account: Account<'info, UserAccount>,
    #[account(
        mut,
        constraint = position.open @ PerpDexError::PositionNotOpen,
        constraint = position.market == market.key(),
    )]
    pub position: Account<'info, Position>,
    /// CHECK: Pyth oracle account - should use pyth_sdk_solana in production
    pub pyth_oracle: UncheckedAccount<'info>,
}

pub fn handler(ctx: Context<Liquidate>) -> Result<()> {
    // Verify oracle is the expected one for this market
    require!(
        ctx.accounts.pyth_oracle.key() == ctx.accounts.market.pyth_oracle,
        PerpDexError::InvalidOracleAccount
    );

    let current_price = get_oracle_price(&ctx.accounts.pyth_oracle.to_account_info())?;
    let position = &ctx.accounts.position;
    let size = position.size;
    let margin = position.margin;
    let side = position.side;
    let liq_price = position.liquidation_price;

    // Check if position is liquidatable by comparing current price with liquidation price
    // Long: liquidatable when current_price <= liq_price
    // Short: liquidatable when current_price >= liq_price
    let is_liquidatable = match side {
        PositionSide::Long => current_price <= liq_price,
        PositionSide::Short => current_price >= liq_price,
    };

    // Also check margin ratio: margin / (size * current_price / PRICE_PRECISION) < 5%
    let position_value = size
        .checked_mul(current_price)
        .unwrap_or(u64::MAX)
        .checked_div(PRICE_PRECISION)
        .unwrap_or(u64::MAX);
    let margin_ratio_check = if position_value > 0 {
        margin.checked_mul(BPS_DENOMINATOR).unwrap_or(0)
            < position_value.checked_mul(MAINTENANCE_MARGIN_BPS).unwrap_or(u64::MAX)
    } else {
        false
    };

    require!(is_liquidatable || margin_ratio_check, PerpDexError::PositionNotLiquidatable);

    // Calculate liquidation fee
    let liquidation_fee_bps = ctx.accounts.exchange.liquidation_fee_bps as u64;
    let liquidation_fee = margin
        .checked_mul(liquidation_fee_bps)
        .unwrap_or(0)
        .checked_div(BPS_DENOMINATOR)
        .unwrap_or(0);

    let remainder = margin.saturating_sub(liquidation_fee);

    // Update open interest
    let market = &mut ctx.accounts.market;
    match side {
        PositionSide::Long => {
            market.long_open_interest = market.long_open_interest.saturating_sub(size);
        }
        PositionSide::Short => {
            market.short_open_interest = market.short_open_interest.saturating_sub(size);
        }
    }

    // Return remainder to user account
    let user_account = &mut ctx.accounts.user_account;
    user_account.collateral = user_account.collateral.checked_add(remainder).unwrap();

    // Mark position closed
    let position = &mut ctx.accounts.position;
    position.open = false;

    msg!(
        "Liquidated position: current_price={}, margin={}, fee={}, remainder={}",
        current_price,
        margin,
        liquidation_fee,
        remainder
    );
    Ok(())
}
