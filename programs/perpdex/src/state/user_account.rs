use anchor_lang::prelude::*;

#[account]
pub struct UserAccount {
    pub exchange: Pubkey,
    pub authority: Pubkey,
    pub collateral: u64,
    pub realized_pnl: i64,
    pub cumulative_fees: u64,
    pub position_count: u8,
    pub bump: u8,
}

impl UserAccount {
    pub const SPACE: usize = 8  // discriminator
        + 32  // exchange
        + 32  // authority
        + 8   // collateral
        + 8   // realized_pnl
        + 8   // cumulative_fees
        + 1   // position_count
        + 1;  // bump
}
