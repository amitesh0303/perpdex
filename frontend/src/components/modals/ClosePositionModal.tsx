'use client';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useProgram } from '@/hooks/useProgram';
import { Position } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useState } from 'react';

interface Props { position: Position; onClose: () => void; }

export function ClosePositionModal({ position, onClose }: Props) {
  const { closePosition } = useProgram();
  const [loading, setLoading] = useState(false);

  const handleClose = async () => {
    setLoading(true);
    try {
      await closePosition(position.id);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Close Position</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-3 text-sm mb-4">
          <div className="flex justify-between"><span className="text-gray-400">Market</span><span className="text-white">{position.marketSymbol}</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Side</span><span className={position.side === 'long' ? 'text-green-400' : 'text-red-400'}>{position.side.toUpperCase()}</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Size</span><span className="text-white">${formatPrice(position.size / 1_000_000)}</span></div>
        </div>
        <Button className="w-full" variant="danger" onClick={handleClose} disabled={loading}>
          {loading ? 'Closing...' : 'Close Position'}
        </Button>
      </div>
    </div>
  );
}
