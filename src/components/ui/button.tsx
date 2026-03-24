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
        'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-60',
        variant === 'primary' && 'bg-emerald-500 text-slate-950 shadow-[0_8px_20px_rgba(16,185,129,0.18)] hover:-translate-y-px hover:bg-emerald-400 hover:shadow-[0_12px_24px_rgba(16,185,129,0.22)]',
        variant === 'secondary' && 'border border-slate-200 bg-white text-slate-900 hover:-translate-y-px hover:border-emerald-200 hover:bg-emerald-50',
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
