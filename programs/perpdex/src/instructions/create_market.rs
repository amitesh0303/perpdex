use anchor_lang::prelude::*;
use crate::state::{Exchange, Market};
use crate::errors::PerpDexError;

#[derive(Accounts)]
#[instruction(name: [u8;16], funding_interval: i64, pyth_oracle: Pubkey)]
pub struct CreateMarket<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        mut,
        seeds = [b"exchange"],
        bump = exchange.bump,
        constraint = !exchange.paused @ PerpDexError::ExchangePaused,
        constraint = exchange.admin == admin.key() @ PerpDexError::Unauthorized,
    )]
    pub exchange: Account<'info, Exchange>,
    #[account(
        init,
        payer = admin,
        space = Market::SPACE,
        seeds = [b"market", exchange.key().as_ref(), &[exchange.market_count]],
        bump
    )]
    pub market: Account<'info, Market>,
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<CreateMarket>,
    name: [u8; 16],
    funding_interval: i64,
    pyth_oracle: Pubkey,
) -> Result<()> {
    let exchange = &mut ctx.accounts.exchange;
    let market = &mut ctx.accounts.market;

    market.exchange = exchange.key();
    market.market_index = exchange.market_count;
    market.name = name;
    market.funding_interval = funding_interval;
    market.mark_price = 0;
    market.index_price = 0;
    market.cumulative_funding_rate = 0;
    market.long_open_interest = 0;
    market.short_open_interest = 0;
    market.active = true;
    market.pyth_oracle = pyth_oracle;
    market.bump = ctx.bumps.market;

    exchange.market_count = exchange.market_count.checked_add(1).unwrap();

    msg!("Market {} created: {:?}", market.market_index, market.name);
    Ok(())
}
