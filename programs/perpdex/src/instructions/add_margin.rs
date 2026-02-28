use anchor_lang::prelude::*;
use crate::state::{Exchange, UserAccount, Position};
use crate::errors::PerpDexError;

#[derive(Accounts)]
pub struct AddMargin<'info> {
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

pub fn handler(ctx: Context<AddMargin>, amount: u64) -> Result<()> {
    require!(amount > 0, PerpDexError::InvalidAmount);
    require!(
        ctx.accounts.user_account.collateral >= amount,
        PerpDexError::InsufficientCollateral
    );

    ctx.accounts.user_account.collateral = ctx.accounts.user_account.collateral
        .checked_sub(amount)
        .unwrap();
    ctx.accounts.position.margin = ctx.accounts.position.margin
        .checked_add(amount)
        .unwrap();

    msg!("Added {} to position margin", amount);
    Ok(())
}
