use anchor_lang::prelude::*;
use crate::state::{Exchange, Market, UserAccount, Position, PositionSide};
use crate::errors::PerpDexError;
use crate::instructions::oracle::get_oracle_price;

const PRICE_PRECISION: u64 = 1_000_000;

#[derive(Accounts)]
pub struct OpenPosition<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        seeds = [b"exchange"],
        bump = exchange.bump,
        constraint = !exchange.paused @ PerpDexError::ExchangePaused,
    )]
    pub exchange: Account<'info, Exchange>,
    #[account(
        mut,
        constraint = market.active @ PerpDexError::MarketNotActive,
        constraint = market.exchange == exchange.key(),
    )]
    pub market: Account<'info, Market>,
    #[account(
        mut,
        seeds = [b"user_account", exchange.key().as_ref(), user.key().as_ref()],
        bump = user_account.bump,
        constraint = user_account.authority == user.key() @ PerpDexError::Unauthorized,
    )]
    pub user_account: Account<'info, UserAccount>,
    #[account(
        init_if_needed,
        payer = user,
        space = Position::SPACE,
        seeds = [b"position", market.key().as_ref(), user.key().as_ref()],
        bump
    )]
    pub position: Account<'info, Position>,
    /// CHECK: Pyth oracle account - should use pyth_sdk_solana in production
    pub pyth_oracle: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<OpenPosition>,
    side: PositionSide,
    size: u64,
    leverage: u8,
) -> Result<()> {
    require!(size > 0, PerpDexError::InvalidAmount);
    require!(leverage > 0, PerpDexError::InvalidLeverage);
    require!(
        leverage <= ctx.accounts.exchange.max_leverage,
        PerpDexError::InvalidLeverage
    );
    require!(
        !ctx.accounts.position.open,
        PerpDexError::PositionAlreadyOpen
    );

    let required_margin = size
        .checked_div(leverage as u64)
        .ok_or(PerpDexError::InvalidLeverage)?;

    require!(
        ctx.accounts.user_account.collateral >= required_margin,
        PerpDexError::InsufficientCollateral
    );

    // Verify oracle is the expected one for this market
    require!(
        ctx.accounts.pyth_oracle.key() == ctx.accounts.market.pyth_oracle,
        PerpDexError::InvalidOracleAccount
    );

    let entry_price = get_oracle_price(&ctx.accounts.pyth_oracle.to_account_info())?;

    // Calculate liquidation price
    // long: liq_price = entry_price - (margin / size * price_precision)
    // short: liq_price = entry_price + (margin / size * price_precision)
    let margin_per_unit = required_margin
        .checked_mul(PRICE_PRECISION)
        .unwrap_or(u64::MAX)
        .checked_div(size)
        .unwrap_or(0);

    let liquidation_price = match side {
        PositionSide::Long => entry_price.saturating_sub(margin_per_unit),
        PositionSide::Short => entry_price.saturating_add(margin_per_unit),
    };

    let user_account = &mut ctx.accounts.user_account;
    user_account.collateral = user_account.collateral.checked_sub(required_margin).unwrap();

    let market = &mut ctx.accounts.market;
    match side {
        PositionSide::Long => {
            market.long_open_interest = market.long_open_interest.checked_add(size).unwrap();
        }
        PositionSide::Short => {
            market.short_open_interest = market.short_open_interest.checked_add(size).unwrap();
        }
    }

    let position = &mut ctx.accounts.position;
    position.market = market.key();
    position.authority = ctx.accounts.user.key();
    position.size = size;
    position.side = side;
    position.entry_price = entry_price;
    position.margin = required_margin;
    position.leverage = leverage;
    position.liquidation_price = liquidation_price;
    position.cumulative_funding_entry = market.cumulative_funding_rate;
    position.realized_pnl = 0;
    position.open = true;
    position.bump = ctx.bumps.position;

    msg!(
        "Opened {:?} position: size={}, entry_price={}, margin={}, liq_price={}",
        match side { PositionSide::Long => "Long", PositionSide::Short => "Short" },
        size,
        entry_price,
        required_margin,
        liquidation_price
    );
    Ok(())
}
