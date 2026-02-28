use anchor_lang::prelude::*;

#[account]
pub struct Exchange {
    pub admin: Pubkey,
    pub trading_fee_bps: u16,
    pub liquidation_fee_bps: u16,
    pub max_leverage: u8,
    pub insurance_fund: u64,
    pub paused: bool,
    pub market_count: u8,
    pub bump: u8,
}

impl Exchange {
    pub const SPACE: usize = 8  // discriminator
        + 32  // admin
        + 2   // trading_fee_bps
        + 2   // liquidation_fee_bps
        + 1   // max_leverage
        + 8   // insurance_fund
        + 1   // paused
        + 1   // market_count
        + 1;  // bump
}
