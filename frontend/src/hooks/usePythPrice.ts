'use client';
import { useTradingStore } from '@/store/trading';

export function usePythPrice(marketSymbol: string) {
  const markets = useTradingStore((s) => s.markets);
  const market = markets.find((m) => m.symbol === marketSymbol);
  
  return {
    price: market?.price ?? 0,
    markPrice: market?.markPrice ?? 0,
    lastUpdate: Date.now(),
    isStale: market?.price === 0,
  };
}
