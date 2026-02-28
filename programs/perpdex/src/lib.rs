use anchor_lang::prelude::*;

pub mod errors;
pub mod instructions;
pub mod state;

use instructions::*;
use state::PositionSide;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod perpdex {
    use super::*;

    /// Initialize the exchange with fee and leverage parameters.
    pub fn initialize(
        ctx: Context<Initialize>,
        trading_fee_bps: u16,
        liquidation_fee_bps: u16,
        max_leverage: u8,
    ) -> Result<()> {
        initialize::handler(ctx, trading_fee_bps, liquidation_fee_bps, max_leverage)
    }

    /// Create a new perpetual market.
    pub fn create_market(
        ctx: Context<CreateMarket>,
        name: [u8; 16],
        funding_interval: i64,
        pyth_oracle: Pubkey,
    ) -> Result<()> {
        create_market::handler(ctx, name, funding_interval, pyth_oracle)
    }

    /// Deposit USDC collateral into the user account.
    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        deposit::handler(ctx, amount)
    }

    /// Withdraw USDC collateral from the user account.
    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        withdraw::handler(ctx, amount)
    }

    /// Open a leveraged perpetual position.
    pub fn open_position(
        ctx: Context<OpenPosition>,
        side: PositionSide,
        size: u64,
        leverage: u8,
    ) -> Result<()> {
        open_position::handler(ctx, side, size, leverage)
    }

    /// Close an existing position and settle PnL.
    pub fn close_position(ctx: Context<ClosePosition>) -> Result<()> {
        close_position::handler(ctx)
    }

    /// Add margin to an open position.
    pub fn add_margin(ctx: Context<AddMargin>, amount: u64) -> Result<()> {
        add_margin::handler(ctx, amount)
    }

    /// Remove margin from an open position.
    pub fn remove_margin(ctx: Context<RemoveMargin>, amount: u64) -> Result<()> {
        remove_margin::handler(ctx, amount)
    }

    /// Update the cumulative funding rate for a market.
    pub fn update_funding(ctx: Context<UpdateFunding>) -> Result<()> {
        update_funding::handler(ctx)
    }

    /// Liquidate an undercollateralized position.
    pub fn liquidate(ctx: Context<Liquidate>) -> Result<()> {
        liquidate::handler(ctx)
    }
}
