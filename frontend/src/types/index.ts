export type PositionSide = 'long' | 'short';

export interface Market {
  symbol: string;
  name: string;
  baseAsset: string;
  price: number;
  priceChange24h: number;
  markPrice: number;
  indexPrice: number;
  fundingRate: number;
  longOI: number;
  shortOI: number;
  pythFeedId: string;
}

export interface Position {
  id: string;
  marketSymbol: string;
  side: PositionSide;
  size: number;
  entryPrice: number;
  markPrice: number;
  margin: number;
  leverage: number;
  liquidationPrice: number;
  pnl: number;
  pnlPercent: number;
  marginRatio: number;
}

export interface UserStats {
  totalBalance: number;
  freeCollateral: number;
  unrealizedPnl: number;
  totalVolume: number;
  realizedPnl: number;
}

export interface PriceData {
  price: number;
  confidence: number;
  timestamp: number;
  isStale: boolean;
}
