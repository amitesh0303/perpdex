'use client';
import { cn } from '@/lib/utils';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { Toast as ToastType } from '@/hooks/useToast';

interface ToastContainerProps {
  toasts: ToastType[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm border min-w-64 max-w-sm',
            {
              'bg-green-900/80 border-green-500/30 text-green-100': toast.type === 'success',
              'bg-red-900/80 border-red-500/30 text-red-100': toast.type === 'error',
              'bg-blue-900/80 border-blue-500/30 text-blue-100': toast.type === 'info',
            }
          )}
        >
          {toast.type === 'success' && <CheckCircle className="w-4 h-4 shrink-0" />}
          {toast.type === 'error' && <AlertCircle className="w-4 h-4 shrink-0" />}
          {toast.type === 'info' && <Info className="w-4 h-4 shrink-0" />}
          <span className="flex-1 text-sm">{toast.message}</span>
          <button onClick={() => onRemove(toast.id)} className="text-current opacity-60 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
