'use client';
import { useTradingStore } from '@/store/trading';
import { useProgram } from '@/hooks/useProgram';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';

export function PositionsTable() {
  const { positions, isLoading } = useTradingStore();
  const { closePosition } = useProgram();

  if (positions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        No open positions
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-400 border-b border-white/10">
            {['Market', 'Side', 'Size', 'Entry', 'Mark', 'Liq. Price', 'PnL', 'Margin', 'Actions'].map((h) => (
              <th key={h} className="text-left pb-2 px-2 font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {positions.map((pos) => (
            <tr key={pos.id} className="border-b border-white/5 hover:bg-white/[0.03]">
              <td className="py-3 px-2 font-medium">{pos.marketSymbol}</td>
              <td className="py-3 px-2">
                <Badge variant={pos.side === 'long' ? 'success' : 'danger'}>
                  {pos.side.toUpperCase()}
                </Badge>
              </td>
              <td className="py-3 px-2">${formatPrice(pos.size / 1_000_000)}</td>
              <td className="py-3 px-2">${formatPrice(pos.entryPrice)}</td>
              <td className="py-3 px-2">${formatPrice(pos.markPrice || pos.entryPrice)}</td>
              <td className="py-3 px-2 text-red-400">${formatPrice(pos.liquidationPrice)}</td>
              <td className={cn('py-3 px-2 font-medium', pos.pnl >= 0 ? 'text-green-400' : 'text-red-400')}>
                {pos.pnl >= 0 ? '+' : ''}{formatPrice(pos.pnl / 1_000_000)}
              </td>
              <td className="py-3 px-2">${formatPrice(pos.margin / 1_000_000)}</td>
              <td className="py-3 px-2">
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => closePosition(pos.id)}
                  disabled={isLoading}
                >
                  Close
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
