use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum PositionSide {
    Long,
    Short,
}

#[account]
pub struct Position {
    pub market: Pubkey,
    pub authority: Pubkey,
    pub size: u64,
    pub side: PositionSide,
    pub entry_price: u64,
    pub margin: u64,
    pub leverage: u8,
    pub liquidation_price: u64,
    pub cumulative_funding_entry: i64,
    pub realized_pnl: i64,
    pub open: bool,
    pub bump: u8,
}

impl Position {
    pub const SPACE: usize = 8  // discriminator
        + 32  // market
        + 32  // authority
        + 8   // size
        + 1   // side (enum)
        + 8   // entry_price
        + 8   // margin
        + 1   // leverage
        + 8   // liquidation_price
        + 8   // cumulative_funding_entry
        + 8   // realized_pnl
        + 1   // open
        + 1;  // bump
}
