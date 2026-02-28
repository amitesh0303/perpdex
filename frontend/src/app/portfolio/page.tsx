'use client';
import { useState } from 'react';
import { useTradingStore } from '@/store/trading';
import { useWallet } from '@solana/wallet-adapter-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PositionsTable } from '@/components/PositionsTable';
import { DepositModal } from '@/components/modals/DepositModal';
import { WithdrawModal } from '@/components/modals/WithdrawModal';
import { formatUSDC, formatPnl } from '@/lib/utils';

export default function PortfolioPage() {
  const { userStats, positions } = useTradingStore();
  const { connected } = useWallet();
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  const stats = [
    { label: 'Total Balance', value: formatUSDC(userStats.totalBalance), color: 'text-white' },
    { label: 'Free Collateral', value: formatUSDC(userStats.freeCollateral), color: 'text-white' },
    { label: 'Unrealized PnL', value: formatPnl(userStats.unrealizedPnl), color: userStats.unrealizedPnl >= 0 ? 'text-green-400' : 'text-red-400' },
    { label: 'Realized PnL', value: formatPnl(userStats.realizedPnl), color: userStats.realizedPnl >= 0 ? 'text-green-400' : 'text-red-400' },
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-screen-xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">Portfolio</h1>
          {connected && (
            <div className="flex gap-3">
              <Button onClick={() => setShowDeposit(true)}>Deposit</Button>
              <Button variant="secondary" onClick={() => setShowWithdraw(true)}>Withdraw</Button>
            </div>
          )}
        </div>

        {!connected ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg mb-2">Connect your wallet to view portfolio</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {stats.map(({ label, value, color }) => (
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
                <h2 className="font-semibold text-white">Open Positions ({positions.length})</h2>
              </CardHeader>
              <CardContent>
                <PositionsTable />
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {showDeposit && <DepositModal onClose={() => setShowDeposit(false)} />}
      {showWithdraw && <WithdrawModal onClose={() => setShowWithdraw(false)} />}
    </div>
  );
}
