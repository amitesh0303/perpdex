'use client';
import { useWallet } from '@solana/wallet-adapter-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useState } from 'react';

export default function AdminPage() {
  const { connected } = useWallet();
  const [maxLeverage, setMaxLeverage] = useState('20');
  const [maintenanceMargin, setMaintenanceMargin] = useState('5');
  const [takerFee, setTakerFee] = useState('0.1');
  const [makerFee, setMakerFee] = useState('0.05');

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-screen-xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Admin Panel</h1>
          <p className="text-gray-400 text-sm">Protocol administration and configuration.</p>
        </div>

        {!connected ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">Connect wallet to access admin panel</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Exchange Config */}
            <Card>
              <CardHeader>
                <h2 className="font-semibold text-white">Exchange Configuration</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input label="Max Leverage" type="number" value={maxLeverage} onChange={(e) => setMaxLeverage(e.target.value)} suffix="x" />
                <Input label="Maintenance Margin Ratio" type="number" value={maintenanceMargin} onChange={(e) => setMaintenanceMargin(e.target.value)} suffix="%" />
                <Input label="Taker Fee" type="number" value={takerFee} onChange={(e) => setTakerFee(e.target.value)} suffix="%" />
                <Input label="Maker Fee" type="number" value={makerFee} onChange={(e) => setMakerFee(e.target.value)} suffix="%" />
                <Button className="w-full">Update Configuration</Button>
              </CardContent>
            </Card>

            {/* Market Status */}
            <Card>
              <CardHeader>
                <h2 className="font-semibold text-white">Market Status</h2>
              </CardHeader>
              <CardContent className="space-y-3">
                {['SOL-PERP', 'BTC-PERP', 'ETH-PERP'].map((market) => (
                  <div key={market} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="font-medium text-white">{market}</span>
                    <div className="flex items-center gap-3">
                      <Badge variant="success">Active</Badge>
                      <Button size="sm" variant="secondary">Pause</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Protocol Stats */}
            <Card>
              <CardHeader>
                <h2 className="font-semibold text-white">Protocol Stats</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  {[
                    ['Total Volume', '$82.7M'],
                    ['Total Fees Collected', '$82,700'],
                    ['Insurance Fund', '$125,000'],
                    ['Total Users', '4,291'],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-gray-400">{label}</span>
                      <span className="text-white font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Admin Actions */}
            <Card>
              <CardHeader>
                <h2 className="font-semibold text-white">Admin Actions</h2>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="secondary">Initialize Exchange</Button>
                <Button className="w-full" variant="secondary">Add Market</Button>
                <Button className="w-full" variant="secondary">Update Oracle</Button>
                <Button className="w-full" variant="danger">Emergency Pause All</Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
