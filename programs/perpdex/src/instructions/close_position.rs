use anchor_lang::prelude::*;
use crate::state::{Exchange, Market, UserAccount, Position, PositionSide};
use crate::errors::PerpDexError;
use crate::instructions::oracle::get_oracle_price;

#[derive(Accounts)]
pub struct ClosePosition<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
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
        seeds = [b"user_account", exchange.key().as_ref(), user.key().as_ref()],
        bump = user_account.bump,
        constraint = user_account.authority == user.key() @ PerpDexError::Unauthorized,
    )]
    pub user_account: Account<'info, UserAccount>,
    #[account(
        mut,
        seeds = [b"position", market.key().as_ref(), user.key().as_ref()],
        bump = position.bump,
        constraint = position.authority == user.key() @ PerpDexError::Unauthorized,
        constraint = position.open @ PerpDexError::PositionNotOpen,
    )]
    pub position: Account<'info, Position>,
    /// CHECK: Pyth oracle account - should use pyth_sdk_solana in production
    pub pyth_oracle: UncheckedAccount<'info>,
}

pub fn handler(ctx: Context<ClosePosition>) -> Result<()> {
    // Verify oracle is the expected one for this market
    require!(
        ctx.accounts.pyth_oracle.key() == ctx.accounts.market.pyth_oracle,
        PerpDexError::InvalidOracleAccount
    );

    let current_price = get_oracle_price(&ctx.accounts.pyth_oracle.to_account_info())?;
    let position = &ctx.accounts.position;
    let entry_price = position.entry_price;
    let size = position.size;
    let margin = position.margin;
    let side = position.side;

    // Calculate PnL
    // long pnl = (current_price - entry_price) * size / entry_price
    // short pnl = (entry_price - current_price) * size / entry_price
    let pnl: i64 = match side {
        PositionSide::Long => {
            let price_diff = current_price as i64 - entry_price as i64;
            price_diff
                .checked_mul(size as i64)
                .unwrap_or(i64::MIN)
                .checked_div(entry_price as i64)
                .unwrap_or(0)
        }
        PositionSide::Short => {
            let price_diff = entry_price as i64 - current_price as i64;
            price_diff
                .checked_mul(size as i64)
                .unwrap_or(i64::MIN)
                .checked_div(entry_price as i64)
                .unwrap_or(0)
        }
    };

    // Calculate return amount: margin + pnl
    let return_amount = if pnl >= 0 {
        margin.checked_add(pnl as u64).unwrap_or(margin)
    } else {
        let loss = (-pnl) as u64;
        if loss >= margin {
            0
        } else {
            margin - loss
        }
    };

    let market = &mut ctx.accounts.market;
    match side {
        PositionSide::Long => {
            market.long_open_interest = market.long_open_interest.saturating_sub(size);
        }
        PositionSide::Short => {
            market.short_open_interest = market.short_open_interest.saturating_sub(size);
        }
    }

    let user_account = &mut ctx.accounts.user_account;
    user_account.collateral = user_account.collateral.checked_add(return_amount).unwrap();
    user_account.realized_pnl = user_account.realized_pnl.checked_add(pnl).unwrap_or(user_account.realized_pnl);

    let position = &mut ctx.accounts.position;
    position.realized_pnl = position.realized_pnl.checked_add(pnl).unwrap_or(position.realized_pnl);
    position.open = false;

    msg!(
        "Closed position: current_price={}, pnl={}, return={}",
        current_price,
        pnl,
        return_amount
    );
    Ok(())
}
