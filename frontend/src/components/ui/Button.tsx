import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
          {
            'bg-blue-600 hover:bg-blue-700 text-white': variant === 'primary',
            'bg-white/10 hover:bg-white/20 text-white border border-white/20': variant === 'secondary',
            'bg-red-600 hover:bg-red-700 text-white': variant === 'danger',
            'bg-green-600 hover:bg-green-700 text-white': variant === 'success',
            'hover:bg-white/10 text-white': variant === 'ghost',
          },
          {
            'px-3 py-1.5 text-sm': size === 'sm',
            'px-4 py-2 text-base': size === 'md',
            'px-6 py-3 text-lg': size === 'lg',
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
