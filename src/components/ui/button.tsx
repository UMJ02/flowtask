import * as React from 'react';
import { LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils/classnames';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  loading?: boolean;
}

export function Button({ className, variant = 'primary', loading = false, children, disabled, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2.25 text-sm font-semibold transition-all duration-200 active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-60',
        variant === 'primary' && 'bg-slate-950 text-white shadow-[0_12px_24px_rgba(15,23,42,0.15)] hover:-translate-y-0.5 hover:bg-slate-900 hover:shadow-[0_16px_30px_rgba(15,23,42,0.18)]',
        variant === 'secondary' && 'border border-slate-200 bg-white text-slate-900 shadow-[0_4px_12px_rgba(15,23,42,0.03)] hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800',
        variant === 'ghost' && 'bg-transparent text-slate-700 hover:bg-slate-100',
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
}
