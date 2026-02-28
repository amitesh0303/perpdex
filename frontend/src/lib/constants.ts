export const PROGRAM_ID = process.env.NEXT_PUBLIC_PROGRAM_ID || 'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS';
export const CLUSTER = (process.env.NEXT_PUBLIC_CLUSTER as 'devnet' | 'mainnet-beta') || 'devnet';
export const HELIUS_API_KEY = process.env.NEXT_PUBLIC_HELIUS_API_KEY || '';

export const RPC_ENDPOINT = HELIUS_API_KEY
  ? `https://devnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`
  : 'https://api.devnet.solana.com';

export const MARKETS = [
  { symbol: 'SOL-PERP', name: 'Solana', baseAsset: 'SOL', pythFeedId: '0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d' },
  { symbol: 'BTC-PERP', name: 'Bitcoin', baseAsset: 'BTC', pythFeedId: '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43' },
  { symbol: 'ETH-PERP', name: 'Ethereum', baseAsset: 'ETH', pythFeedId: '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace' },
];

export const MAX_LEVERAGE = 20;
export const MAINTENANCE_MARGIN_RATIO = 0.05;
export const PRICE_PRECISION = 1_000_000;
export const USDC_DECIMALS = 6;

export const PYTH_HERMES_ENDPOINT = 'https://hermes.pyth.network';
