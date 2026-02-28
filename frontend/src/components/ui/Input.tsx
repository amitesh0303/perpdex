import { cn } from '@/lib/utils';
import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  suffix?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, suffix, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && <label className="text-sm text-gray-400">{label}</label>}
        <div className="relative">
          <input
            ref={ref}
            className={cn(
              'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors',
              suffix && 'pr-12',
              className
            )}
            {...props}
          />
          {suffix && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              {suffix}
            </span>
          )}
        </div>
      </div>
    );
  }
);
Input.displayName = 'Input';
