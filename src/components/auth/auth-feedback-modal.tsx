'use client';

import { CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils/classnames';

export function AuthFeedbackModal({
  open,
  title,
  message,
  tone = 'success',
}: {
  open: boolean;
  title: string;
  message: string;
  tone?: 'success' | 'error';
}) {
  if (!open) return null;

  const isSuccess = tone === 'success';

  return (
    <div className="pointer-events-none fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/18 px-4 backdrop-blur-[2px]">
      <div
        className={cn(
          'pointer-events-auto w-full max-w-sm rounded-[28px] border bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.18)]',
          isSuccess ? 'border-emerald-200' : 'border-rose-200'
        )}
      >
        <div className="flex items-start gap-3">
          <span
            className={cn(
              'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl',
              isSuccess ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            )}
          >
            {isSuccess ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
          </span>

          <div>
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
