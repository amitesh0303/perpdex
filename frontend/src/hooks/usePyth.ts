'use client';
import { useEffect, useCallback } from 'react';
import { useTradingStore } from '@/store/trading';
import { MARKETS, PYTH_HERMES_ENDPOINT } from '@/lib/constants';

export function usePyth() {
  const { updateMarketPrice } = useTradingStore();

  const fetchPrices = useCallback(async () => {
    try {
      const ids = MARKETS.map((m) => m.pythFeedId);
      const params = ids.map((id) => `ids[]=${id}`).join('&');
      const res = await fetch(`${PYTH_HERMES_ENDPOINT}/v2/updates/price/latest?${params}&encoding=hex`);
      if (!res.ok) return;
      const data = await res.json();
      if (data?.parsed) {
        data.parsed.forEach((feed: { id: string; price?: { price: string; expo: number } }) => {
          const market = MARKETS.find((m) => `0x${feed.id}` === m.pythFeedId || feed.id === m.pythFeedId.replace('0x', ''));
          if (market && feed.price) {
            const price = Number(feed.price.price) * Math.pow(10, feed.price.expo);
            updateMarketPrice(market.symbol, price, 0);
          }
        });
      }
    } catch (_) {
      // silently fail - prices will use mock data
    }
  }, [updateMarketPrice]);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 5000);
    return () => clearInterval(interval);
  }, [fetchPrices]);
}
