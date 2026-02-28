import { create } from 'zustand';
import { Market, Position, UserStats } from '@/types';
import { MARKETS } from '@/lib/constants';

interface TradingStore {
  markets: Market[];
  selectedMarket: string;
  positions: Position[];
  userStats: UserStats;
  isLoading: boolean;
  error: string | null;
  
  setMarkets: (markets: Market[]) => void;
  updateMarketPrice: (symbol: string, price: number, change24h: number) => void;
  setSelectedMarket: (symbol: string) => void;
  setPositions: (positions: Position[]) => void;
  addPosition: (position: Position) => void;
  removePosition: (id: string) => void;
  updateUserStats: (stats: Partial<UserStats>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useTradingStore = create<TradingStore>((set) => ({
  markets: MARKETS.map((m) => ({
    ...m,
    price: 0,
    priceChange24h: 0,
    markPrice: 0,
    indexPrice: 0,
    fundingRate: 0,
    longOI: 0,
    shortOI: 0,
  })),
  selectedMarket: 'SOL-PERP',
  positions: [],
  userStats: {
    totalBalance: 0,
    freeCollateral: 0,
    unrealizedPnl: 0,
    totalVolume: 0,
    realizedPnl: 0,
  },
  isLoading: false,
  error: null,

  setMarkets: (markets) => set({ markets }),
  updateMarketPrice: (symbol, price, priceChange24h) =>
    set((state) => ({
      markets: state.markets.map((m) =>
        m.symbol === symbol ? { ...m, price, priceChange24h, markPrice: price, indexPrice: price } : m
      ),
    })),
  setSelectedMarket: (symbol) => set({ selectedMarket: symbol }),
  setPositions: (positions) => set({ positions }),
  addPosition: (position) =>
    set((state) => ({ positions: [...state.positions, position] })),
  removePosition: (id) =>
    set((state) => ({ positions: state.positions.filter((p) => p.id !== id) })),
  updateUserStats: (stats) =>
    set((state) => ({ userStats: { ...state.userStats, ...stats } })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
