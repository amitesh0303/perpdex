'use client';
import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { useTradingStore } from '@/store/trading';
import { useProgram } from '@/hooks/useProgram';
import { usePythPrice } from '@/hooks/usePythPrice';
import { formatPrice, calculateLiquidationPrice } from '@/lib/utils';
import { MAX_LEVERAGE } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function OrderPanel() {
  const { connected } = useWallet();
  const { selectedMarket, userStats, isLoading } = useTradingStore();
  const { openPosition } = useProgram();
  const { price } = usePythPrice(selectedMarket);

  const [side, setSide] = useState<'long' | 'short'>('long');
  const [size, setSize] = useState('');
  const [leverage, setLeverage] = useState(5);

  const sizeNum = parseFloat(size) || 0;
  const margin = sizeNum > 0 ? sizeNum / leverage : 0;
  const fee = sizeNum * 0.001;
  const liqPrice = price > 0 && sizeNum > 0
    ? calculateLiquidationPrice(side, price, leverage)
    : 0;

  const handleOpenPosition = async () => {
    if (!sizeNum || !price) return;
    try {
      await openPosition(selectedMarket, side, sizeNum * 1_000_000, leverage, price);
    } catch (e: unknown) {
      console.error('Open position failed:', e);
    }
  };

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex rounded-lg overflow-hidden border border-white/10">
          <button
            onClick={() => setSide('long')}
            className={cn('flex-1 py-2.5 text-sm font-semibold transition-colors',
              side === 'long' ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-white/5'
            )}
          >
            Long
          </button>
          <button
            onClick={() => setSide('short')}
            className={cn('flex-1 py-2.5 text-sm font-semibold transition-colors',
              side === 'short' ? 'bg-red-600 text-white' : 'text-gray-400 hover:bg-white/5'
            )}
          >
            Short
          </button>
        </div>

        <Input
          label="Size (USDC)"
          type="number"
          placeholder="0.00"
          value={size}
          onChange={(e) => setSize(e.target.value)}
          suffix="USDC"
        />

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Leverage</span>
            <span className="text-white font-semibold">{leverage}x</span>
          </div>
          <input
            type="range"
            min={1}
            max={MAX_LEVERAGE}
            value={leverage}
            onChange={(e) => setLeverage(Number(e.target.value))}
            className="w-full accent-blue-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1x</span><span>5x</span><span>10x</span><span>20x</span>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          {[
            ['Entry Price', price > 0 ? `$${formatPrice(price)}` : '—'],
            ['Margin Required', margin > 0 ? `$${formatPrice(margin)}` : '—'],
            ['Liq. Price', liqPrice > 0 ? `$${formatPrice(liqPrice)}` : '—'],
            ['Fee (0.1%)', fee > 0 ? `$${formatPrice(fee)}` : '—'],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between">
              <span className="text-gray-400">{label}</span>
              <span className="text-white">{value}</span>
            </div>
          ))}
        </div>

        {!connected ? (
          <p className="text-center text-sm text-gray-400 py-2">Connect wallet to trade</p>
        ) : (
          <Button
            className="w-full"
            variant={side === 'long' ? 'success' : 'danger'}
            onClick={handleOpenPosition}
            disabled={isLoading || !sizeNum || !price || margin > userStats.freeCollateral / 1_000_000}
          >
            {isLoading ? 'Processing...' : `${side === 'long' ? 'Long' : 'Short'} ${selectedMarket}`}
          </Button>
        )}

        {margin > userStats.freeCollateral / 1_000_000 && userStats.freeCollateral > 0 && (
          <p className="text-xs text-red-400 text-center">Insufficient collateral</p>
        )}
      </CardContent>
    </Card>
  );
}
