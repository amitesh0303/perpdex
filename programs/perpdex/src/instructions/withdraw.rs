use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::state::{Exchange, UserAccount};
use crate::errors::PerpDexError;

#[derive(Accounts)]
pub struct Withdraw<'info> {
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
    /// CHECK: Vault authority PDA used for signing
    #[account(
        seeds = [b"vault", exchange.key().as_ref()],
        bump
    )]
    pub vault_authority: UncheckedAccount<'info>,
    #[account(mut)]
    pub vault_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
    require!(amount > 0, PerpDexError::InvalidAmount);
    require!(
        ctx.accounts.user_account.collateral >= amount,
        PerpDexError::InsufficientCollateral
    );

    let exchange_key = ctx.accounts.exchange.key();
    let vault_seeds = &[b"vault", exchange_key.as_ref(), &[ctx.bumps.vault_authority]];
    let signer_seeds = &[&vault_seeds[..]];

    let transfer_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.vault_token_account.to_account_info(),
            to: ctx.accounts.user_token_account.to_account_info(),
            authority: ctx.accounts.vault_authority.to_account_info(),
        },
        signer_seeds,
    );
    token::transfer(transfer_ctx, amount)?;

    ctx.accounts.user_account.collateral = ctx.accounts.user_account.collateral
        .checked_sub(amount)
        .unwrap();

    msg!("Withdrew {} from user account", amount);
    Ok(())
}
