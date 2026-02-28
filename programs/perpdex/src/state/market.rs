use anchor_lang::prelude::*;

#[account]
pub struct Market {
    pub exchange: Pubkey,
    pub market_index: u8,
    pub name: [u8; 16],
    pub funding_interval: i64,
    pub mark_price: u64,
    pub index_price: u64,
    pub cumulative_funding_rate: i64,
    pub long_open_interest: u64,
    pub short_open_interest: u64,
    pub active: bool,
    pub pyth_oracle: Pubkey,
    pub bump: u8,
}

impl Market {
    pub const SPACE: usize = 8  // discriminator
        + 32  // exchange
        + 1   // market_index
        + 16  // name
        + 8   // funding_interval
        + 8   // mark_price
        + 8   // index_price
        + 8   // cumulative_funding_rate
        + 8   // long_open_interest
        + 8   // short_open_interest
        + 1   // active
        + 32  // pyth_oracle
        + 1;  // bump
}
