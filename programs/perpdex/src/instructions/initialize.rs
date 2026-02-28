use anchor_lang::prelude::*;
use crate::state::Exchange;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        init,
        payer = admin,
        space = Exchange::SPACE,
        seeds = [b"exchange"],
        bump
    )]
    pub exchange: Account<'info, Exchange>,
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<Initialize>,
    trading_fee_bps: u16,
    liquidation_fee_bps: u16,
    max_leverage: u8,
) -> Result<()> {
    let exchange = &mut ctx.accounts.exchange;
    exchange.admin = ctx.accounts.admin.key();
    exchange.trading_fee_bps = trading_fee_bps;
    exchange.liquidation_fee_bps = liquidation_fee_bps;
    exchange.max_leverage = max_leverage;
    exchange.insurance_fund = 0;
    exchange.paused = false;
    exchange.market_count = 0;
    exchange.bump = ctx.bumps.exchange;

    msg!("Exchange initialized by {}", ctx.accounts.admin.key());
    Ok(())
}
