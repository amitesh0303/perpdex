'use client';
import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useProgram } from '@/hooks/useProgram';
import { Position } from '@/types';

interface Props { position: Position; onClose: () => void; }

export function AddMarginModal({ position, onClose }: Props) {
  const [amount, setAmount] = useState('');
  const { addMargin } = useProgram();
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    setLoading(true);
    try {
      await addMargin(position.id, parseFloat(amount) * 1_000_000);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Add Margin</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          <Input label="Amount (USDC)" type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} suffix="USDC" />
          <Button className="w-full" onClick={handleAdd} disabled={loading || !amount}>
            {loading ? 'Adding...' : 'Add Margin'}
          </Button>
        </div>
      </div>
    </div>
  );
}
