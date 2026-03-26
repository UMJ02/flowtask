"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils/classnames';

type FocusItem = {
  label: string;
  value: number;
  tone: 'danger' | 'attention' | 'neutral';
  helper: string;
};

function metricTone(value: number, type: 'danger' | 'attention' | 'neutral' = 'neutral') {
  if (type === 'danger') return value > 0 ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-100' : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100';
  if (type === 'attention') return value > 0 ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-100' : 'bg-slate-100 text-slate-700 ring-1 ring-slate-200';
  return 'bg-slate-100 text-slate-700 ring-1 ring-slate-200';
}

export function FocusDrawer({
  focus,
  recommendation,
}: {
  focus: FocusItem[];
  recommendation?: string | null;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Ver foco del día"
        aria-label="Ver foco del día"
        className={cn(
          'fixed right-0 top-1/2 z-40 -translate-y-1/2 rounded-l-2xl bg-slate-950 text-white shadow-[0_18px_40px_rgba(15,23,42,0.22)] transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2',
          open ? 'translate-x-full opacity-0 pointer-events-none' : 'translate-x-0 opacity-100'
        )}
      >
        <span className="flex items-center gap-2 px-3 py-4 md:px-3 md:py-5">
          <Sparkles className="h-4 w-4 shrink-0" />
          <span className="[writing-mode:vertical-rl] rotate-180 text-[11px] font-semibold uppercase tracking-[0.18em]">Foco del día</span>
        </span>
      </button>

      <div
        className={cn(
          'fixed inset-0 z-50 transition',
          open ? 'pointer-events-auto' : 'pointer-events-none'
        )}
        aria-hidden={!open}
      >
        <button
          type="button"
          aria-label="Cerrar foco del día"
          onClick={() => setOpen(false)}
          className={cn(
            'absolute inset-0 bg-slate-950/30 transition-opacity',
            open ? 'opacity-100' : 'opacity-0'
          )}
        />
        <aside
          className={cn(
            'absolute right-0 top-5 h-[calc(100%-2.5rem)] w-full max-w-[420px] overflow-y-auto rounded-l-[28px] border border-slate-200 bg-white shadow-2xl transition-transform duration-300',
            open ? 'translate-x-0' : 'translate-x-full'
          )}
        >
          <div className="sticky top-0 z-10 rounded-tl-[28px] border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur md:px-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Foco del día</p>
                <h3 className="mt-2 text-[1.65rem] font-bold tracking-tight text-slate-900">Qué atender ahora</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">Consulta alertas, prioridades e insights sin mover el resto del layout.</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
                title="Cerrar"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4">
              <Link href="/app/intelligence" className="inline-flex min-h-[48px] items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                Ver insights <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="space-y-4 px-5 py-5 md:px-6 md:py-6">
            <div className="grid gap-3 sm:grid-cols-2">
              {focus.map((item) => (
                <div key={item.label} className="rounded-[24px] border border-slate-200 bg-slate-50/70 px-4 py-4 md:px-5 md:py-5">
                  <div className="flex items-start justify-between gap-3">
                    <p className="min-w-0 pr-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{item.label}</p>
                    <span className={`inline-flex shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${metricTone(item.value, item.tone)}`}>{item.value > 0 ? 'Activo' : 'Estable'}</span>
                  </div>
                  <div className="mt-5 space-y-2">
                    <p className="text-4xl font-bold leading-none text-slate-950 tabular-nums">{item.value}</p>
                    <p className="text-sm leading-6 text-slate-500">{item.helper}</p>
                  </div>
                </div>
              ))}
            </div>

            {recommendation ? (
              <div className="rounded-[24px] border border-emerald-100 bg-emerald-50/80 px-5 py-4 text-sm leading-7 text-emerald-900">
                {recommendation}
              </div>
            ) : null}
          </div>
        </aside>
      </div>
    </>
  );
}
