use anchor_lang::prelude::*;
use crate::errors::PerpDexError;

// Offset of price data in Pyth V2 price account format
// In production, use pyth_sdk_solana crate for proper parsing
const PYTH_PRICE_OFFSET: usize = 208;

/// Get oracle price from a Pyth price account.
/// For production use, replace with pyth_sdk_solana::load_price_feed_from_account_info.
pub fn get_oracle_price(oracle_account: &AccountInfo) -> Result<u64> {
    let data = oracle_account.try_borrow_data()?;
    require!(!data.is_empty(), PerpDexError::StaleOraclePrice);
    require!(
        data.len() >= PYTH_PRICE_OFFSET + 8,
        PerpDexError::InvalidOracleAccount
    );

    // Read i64 price from Pyth account at offset 208, then take absolute value as u64
    let price_bytes: [u8; 8] = data[PYTH_PRICE_OFFSET..PYTH_PRICE_OFFSET + 8]
        .try_into()
        .map_err(|_| error!(PerpDexError::InvalidOracleAccount))?;
    let price = i64::from_le_bytes(price_bytes);
    require!(price > 0, PerpDexError::StaleOraclePrice);

    Ok(price as u64)
}
