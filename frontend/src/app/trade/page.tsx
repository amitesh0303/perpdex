'use client';
import { useState } from 'react';
import { useTradingStore } from '@/store/trading';
import { usePyth } from '@/hooks/usePyth';
import { CandleChart } from '@/components/charts/CandleChart';
import { OrderPanel } from '@/components/OrderPanel';
import { PositionsTable } from '@/components/PositionsTable';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function TradePage() {
  usePyth();
  const { markets, selectedMarket, setSelectedMarket } = useTradingStore();
  const currentMarket = markets.find((m) => m.symbol === selectedMarket);
  const [activeTab, setActiveTab] = useState<'positions' | 'history'>('positions');

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Market selector bar */}
      <div className="border-b border-white/10 bg-black/20">
        <div className="max-w-screen-2xl mx-auto px-4">
          <div className="flex items-center gap-1 overflow-x-auto py-2">
            {markets.map((market) => (
              <button
                key={market.symbol}
                onClick={() => setSelectedMarket(market.symbol)}
                className={cn(
                  'flex items-center gap-3 px-4 py-2 rounded-lg whitespace-nowrap transition-colors',
                  selectedMarket === market.symbol
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                )}
              >
                <span className="font-medium text-sm">{market.symbol}</span>
                <span className="text-sm">{market.price > 0 ? `$${formatPrice(market.price)}` : '—'}</span>
                {market.priceChange24h !== 0 && (
                  <Badge variant={market.priceChange24h >= 0 ? 'success' : 'danger'}>
                    {market.priceChange24h >= 0 ? '+' : ''}{market.priceChange24h.toFixed(2)}%
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Chart + positions */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            {/* Market info */}
            {currentMarket && (
              <div className="flex items-center gap-6 text-sm">
                <div>
                  <span className="text-gray-400">Mark Price</span>
                  <div className="text-white font-bold text-lg">
                    {currentMarket.price > 0 ? `$${formatPrice(currentMarket.price)}` : '—'}
                  </div>
                </div>
                <div>
                  <span className="text-gray-400">24h Change</span>
                  <div className={currentMarket.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {currentMarket.priceChange24h >= 0 ? '+' : ''}{currentMarket.priceChange24h.toFixed(2)}%
                  </div>
                </div>
                <div>
                  <span className="text-gray-400">Funding Rate</span>
                  <div className="text-white">{(currentMarket.fundingRate * 100).toFixed(4)}%</div>
                </div>
                <div>
                  <span className="text-gray-400">Long OI</span>
                  <div className="text-green-400">${formatPrice(currentMarket.longOI / 1_000_000)}</div>
                </div>
                <div>
                  <span className="text-gray-400">Short OI</span>
                  <div className="text-red-400">${formatPrice(currentMarket.shortOI / 1_000_000)}</div>
                </div>
              </div>
            )}

            {/* Chart */}
            <Card>
              <CardHeader className="py-2">
                <span className="text-sm font-medium">{selectedMarket} · 5m</span>
              </CardHeader>
              <CardContent className="p-2">
                <CandleChart symbol={selectedMarket} height={380} />
              </CardContent>
            </Card>

            {/* Positions */}
            <Card>
              <CardHeader>
                <div className="flex gap-4">
                  {(['positions', 'history'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        'text-sm font-medium pb-1 capitalize border-b-2 transition-colors',
                        activeTab === tab
                          ? 'border-blue-500 text-white'
                          : 'border-transparent text-gray-400 hover:text-white'
                      )}
                    >
                      {tab === 'positions' ? 'Open Positions' : 'Trade History'}
                    </button>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                {activeTab === 'positions' ? (
                  <PositionsTable />
                ) : (
                  <div className="text-center py-8 text-gray-400 text-sm">No trade history</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order panel */}
          <div className="lg:col-span-1">
            <OrderPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
