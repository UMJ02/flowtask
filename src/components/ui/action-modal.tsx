'use client';

import type { ReactNode } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type ActionNoticeTone = 'success' | 'error' | 'info';

export function ActionNotice({ tone = 'info', children }: { tone?: ActionNoticeTone; children: ReactNode }) {
  return (
    <div className={`rounded-[16px] border px-4 py-3 text-sm font-semibold ${
      tone === 'error'
        ? 'border-rose-200 bg-rose-50 text-rose-700'
        : tone === 'success'
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
          : 'border-slate-200 bg-slate-50 text-slate-700'
    }`}>
      <span className="inline-flex items-center gap-2">
        {tone === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
        {children}
      </span>
    </div>
  );
}

export function ConfirmDialog({
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  tone = 'danger',
  onCancel,
  onConfirm,
}: {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'default';
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const danger = tone === 'danger';
  return (
    <div className={`rounded-[20px] border p-4 shadow-sm ${danger ? 'border-rose-200 bg-rose-50 text-rose-900' : 'border-slate-200 bg-white text-slate-900'}`}>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-bold">{title}</p>
          {description ? <p className={`mt-1 text-xs font-semibold ${danger ? 'text-rose-700' : 'text-slate-500'}`}>{description}</p> : null}
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={onCancel} className="h-10 rounded-[12px] px-4">{cancelLabel}</Button>
          <Button type="button" onClick={onConfirm} className={`h-10 rounded-[12px] px-4 text-white ${danger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-[#050B18] hover:bg-slate-900'}`}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function PromptModal({
  title,
  value,
  placeholder,
  confirmLabel = 'Guardar',
  cancelLabel = 'Cancelar',
  onChange,
  onCancel,
  onConfirm,
}: {
  title: string;
  value: string;
  placeholder?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onChange: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <label className="block flex-1 space-y-2">
          <span className="text-sm font-bold ft-text-main">{title}</span>
          <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="h-11 w-full rounded-[14px] border ft-border bg-white px-3 text-sm font-semibold ft-text-main outline-none focus:border-[#16C784]"
            placeholder={placeholder}
          />
        </label>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={onCancel} className="h-11 rounded-[12px] px-4">{cancelLabel}</Button>
          <Button type="button" onClick={onConfirm} className="h-11 rounded-[12px] bg-[#050B18] px-4 text-white">{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}
