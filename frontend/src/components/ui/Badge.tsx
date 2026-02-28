import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'danger' | 'warning';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
      {
        'bg-white/10 text-gray-300': variant === 'default',
        'bg-green-500/20 text-green-400': variant === 'success',
        'bg-red-500/20 text-red-400': variant === 'danger',
        'bg-yellow-500/20 text-yellow-400': variant === 'warning',
      },
      className
    )}>
      {children}
    </span>
  );
}
