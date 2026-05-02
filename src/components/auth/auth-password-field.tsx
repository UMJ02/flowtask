'use client';

import { Eye, EyeOff } from 'lucide-react';
import { forwardRef, useState, type InputHTMLAttributes } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils/classnames';

type AuthPasswordFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  wrapperClassName?: string;
};

export const AuthPasswordField = forwardRef<HTMLInputElement, AuthPasswordFieldProps>(
  ({ className, wrapperClassName, disabled, ...props }, ref) => {
    const [visible, setVisible] = useState(false);
    const Icon = visible ? EyeOff : Eye;

    return (
      <div className={cn('relative', wrapperClassName)}>
        <Input
          ref={ref}
          className={cn('pr-12', className)}
          disabled={disabled}
          type={visible ? 'text' : 'password'}
          {...props}
        />
        <button
          type="button"
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          aria-pressed={visible}
          className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-4 focus:ring-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => setVisible((current) => !current)}
          disabled={disabled}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    );
  },
);

AuthPasswordField.displayName = 'AuthPasswordField';
