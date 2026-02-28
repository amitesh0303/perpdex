use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::state::{Exchange, UserAccount};
use crate::errors::PerpDexError;

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        seeds = [b"exchange"],
        bump = exchange.bump,
    )]
    pub exchange: Account<'info, Exchange>,
    #[account(
        init_if_needed,
        payer = user,
        space = UserAccount::SPACE,
        seeds = [b"user_account", exchange.key().as_ref(), user.key().as_ref()],
        bump
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
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<Deposit>, amount: u64) -> Result<()> {
    require!(amount > 0, PerpDexError::InvalidAmount);

    let user_account = &mut ctx.accounts.user_account;
    if user_account.authority == Pubkey::default() {
        user_account.exchange = ctx.accounts.exchange.key();
        user_account.authority = ctx.accounts.user.key();
        user_account.collateral = 0;
        user_account.realized_pnl = 0;
        user_account.cumulative_fees = 0;
        user_account.position_count = 0;
        user_account.bump = ctx.bumps.user_account;
    }

    let transfer_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.user_token_account.to_account_info(),
            to: ctx.accounts.vault_token_account.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        },
    );
    token::transfer(transfer_ctx, amount)?;

    user_account.collateral = user_account.collateral.checked_add(amount).unwrap();

    msg!("Deposited {} into user account", amount);
    Ok(())
}
