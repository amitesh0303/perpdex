use anchor_lang::prelude::*;
use crate::state::{Exchange, UserAccount, Position};
use crate::errors::PerpDexError;

// Maintenance margin ratio in basis points (500 bps = 5%)
const MAINTENANCE_MARGIN_BPS: u64 = 500;
const BPS_DENOMINATOR: u64 = 10_000;

#[derive(Accounts)]
pub struct RemoveMargin<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        seeds = [b"exchange"],
        bump = exchange.bump,
    )]
    pub exchange: Account<'info, Exchange>,
    #[account(
        mut,
        seeds = [b"user_account", exchange.key().as_ref(), user.key().as_ref()],
        bump = user_account.bump,
        constraint = user_account.authority == user.key() @ PerpDexError::Unauthorized,
    )]
    pub user_account: Account<'info, UserAccount>,
    #[account(
        mut,
        constraint = position.authority == user.key() @ PerpDexError::Unauthorized,
        constraint = position.open @ PerpDexError::PositionNotOpen,
    )]
    pub position: Account<'info, Position>,
}

pub fn handler(ctx: Context<RemoveMargin>, amount: u64) -> Result<()> {
    require!(amount > 0, PerpDexError::InvalidAmount);
    require!(
        ctx.accounts.position.margin > amount,
        PerpDexError::InsufficientMargin
    );

    let new_margin = ctx.accounts.position.margin.checked_sub(amount).unwrap();

    // Check maintenance margin: new_margin / size >= MAINTENANCE_MARGIN_BPS / BPS_DENOMINATOR
    // i.e., new_margin * BPS_DENOMINATOR >= size * MAINTENANCE_MARGIN_BPS
    let size = ctx.accounts.position.size;
    require!(
        new_margin.checked_mul(BPS_DENOMINATOR).unwrap_or(0)
            >= size.checked_mul(MAINTENANCE_MARGIN_BPS).unwrap_or(u64::MAX),
        PerpDexError::MaintenanceMarginViolation
    );

    ctx.accounts.position.margin = new_margin;
    ctx.accounts.user_account.collateral = ctx.accounts.user_account.collateral
        .checked_add(amount)
        .unwrap();

    msg!("Removed {} from position margin", amount);
    Ok(())
}
