'use client';
import { useWallet } from '@solana/wallet-adapter-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';

const MOCK_LIQUIDATABLE = [
  { id: '1', trader: '7xKX...3mPQ', market: 'SOL-PERP', side: 'long' as const, size: 50000000, markPrice: 138.5, liquidationPrice: 140.2, marginRatio: 0.048 },
  { id: '2', trader: 'Ae4R...9nWZ', market: 'BTC-PERP', side: 'short' as const, size: 200000000, markPrice: 68500, liquidationPrice: 67800, marginRatio: 0.046 },
];

export default function LiquidatePage() {
  const { connected } = useWallet();

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-screen-xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Liquidation Dashboard</h1>
          <p className="text-gray-400 text-sm">Liquidate undercollateralized positions and earn a liquidation bonus.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Liquidatable Positions', value: MOCK_LIQUIDATABLE.length.toString(), color: 'text-yellow-400' },
            { label: 'Total Liquidatable Value', value: '$250,000', color: 'text-white' },
            { label: 'Liquidation Bonus', value: '5%', color: 'text-green-400' },
          ].map(({ label, value, color }) => (
            <Card key={label}>
              <CardContent>
                <p className="text-sm text-gray-400 mb-1">{label}</p>
                <p className={`text-xl font-bold ${color}`}>{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <h2 className="font-semibold text-white">At-Risk Positions</h2>
          </CardHeader>
          <CardContent>
            {!connected ? (
              <p className="text-center py-8 text-gray-400 text-sm">Connect wallet to liquidate positions</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 border-b border-white/10">
                      {['Trader', 'Market', 'Side', 'Size', 'Mark Price', 'Liq. Price', 'Margin Ratio', 'Action'].map((h) => (
                        <th key={h} className="text-left pb-2 px-2 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_LIQUIDATABLE.map((pos) => (
                      <tr key={pos.id} className="border-b border-white/5">
                        <td className="py-3 px-2 font-mono text-xs">{pos.trader}</td>
                        <td className="py-3 px-2 font-medium">{pos.market}</td>
                        <td className="py-3 px-2">
                          <Badge variant={pos.side === 'long' ? 'success' : 'danger'}>
                            {pos.side.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="py-3 px-2">${formatPrice(pos.size / 1_000_000)}</td>
                        <td className="py-3 px-2">${formatPrice(pos.markPrice)}</td>
                        <td className="py-3 px-2 text-red-400">${formatPrice(pos.liquidationPrice)}</td>
                        <td className="py-3 px-2">
                          <span className="text-yellow-400">{(pos.marginRatio * 100).toFixed(2)}%</span>
                        </td>
                        <td className="py-3 px-2">
                          <Button size="sm" variant="danger">Liquidate</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
