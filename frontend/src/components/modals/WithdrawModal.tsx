'use client';
import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useProgram } from '@/hooks/useProgram';

interface WithdrawModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export function WithdrawModal({ onClose, onSuccess }: WithdrawModalProps) {
  const [amount, setAmount] = useState('');
  const { withdraw } = useProgram();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleWithdraw = async () => {
    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0) { setError('Enter a valid amount'); return; }
    setLoading(true);
    setError('');
    try {
      await withdraw(amountNum * 1_000_000);
      onSuccess?.();
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Withdraw USDC</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          <Input label="Amount" type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} suffix="USDC" />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button className="w-full" variant="secondary" onClick={handleWithdraw} disabled={loading || !amount}>
            {loading ? 'Withdrawing...' : 'Withdraw'}
          </Button>
        </div>
      </div>
    </div>
  );
}
