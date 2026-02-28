use anchor_lang::prelude::*;

#[error_code]
pub enum PerpDexError {
    #[msg("Insufficient collateral")]
    InsufficientCollateral,
    #[msg("Insufficient margin")]
    InsufficientMargin,
    #[msg("Exchange is paused")]
    ExchangePaused,
    #[msg("Market is not active")]
    MarketNotActive,
    #[msg("Stale oracle price")]
    StaleOraclePrice,
    #[msg("Invalid leverage")]
    InvalidLeverage,
    #[msg("Position is already open")]
    PositionAlreadyOpen,
    #[msg("Position is not open")]
    PositionNotOpen,
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Maintenance margin violation")]
    MaintenanceMarginViolation,
    #[msg("Position is not liquidatable")]
    PositionNotLiquidatable,
    #[msg("Invalid oracle account")]
    InvalidOracleAccount,
}
