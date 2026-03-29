"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, EyeOff, X } from 'lucide-react';
import { cn } from '@/lib/utils/classnames';

type FocusItem = {
  label: string;
  value: number;
  tone: 'danger' | 'attention' | 'neutral';
  helper: string;
};

const HIDE_MS = 30_000;
const HIDE_KEY = 'flowtask-focus-drawer-hidden-until';

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
  const [hiddenUntil, setHiddenUntil] = useState<number | null>(null);

  useEffect(() => {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(HIDE_KEY) : null;
    const next = raw ? Number(raw) : null;
    if (next && next > Date.now()) {
      setHiddenUntil(next);
    } else if (raw) {
      window.localStorage.removeItem(HIDE_KEY);
    }
  }, []);

  useEffect(() => {
    if (!hiddenUntil) return;
    const remaining = hiddenUntil - Date.now();
    if (remaining <= 0) {
      setHiddenUntil(null);
      window.localStorage.removeItem(HIDE_KEY);
      return;
    }
    const timer = window.setTimeout(() => {
      setHiddenUntil(null);
      window.localStorage.removeItem(HIDE_KEY);
    }, remaining);
    return () => window.clearTimeout(timer);
  }, [hiddenUntil]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const isHidden = useMemo(() => Boolean(hiddenUntil && hiddenUntil > Date.now()), [hiddenUntil]);

  const hideTemporarily = () => {
    const until = Date.now() + HIDE_MS;
    setOpen(false);
    setHiddenUntil(until);
    window.localStorage.setItem(HIDE_KEY, String(until));
  };

  return (
    <div className="pointer-events-none absolute right-0 top-[216px] z-30 hidden xl:block">
      {!isHidden ? (
        <>
          <div className="pointer-events-auto absolute -left-10 top-3">
            <button
              type="button"
              title="Ocultar 30 segundos"
              aria-label="Ocultar foco del día por 30 segundos"
              onClick={hideTemporarily}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-emerald-200 bg-white text-emerald-700 shadow-[0_12px_28px_rgba(15,23,42,0.12)] transition hover:bg-emerald-50"
            >
              <EyeOff className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setOpen(true)}
            title="Ver foco del día"
            aria-label="Ver foco del día"
            className={cn(
              'pointer-events-auto rounded-l-[22px] bg-emerald-500 text-white shadow-[0_18px_40px_rgba(16,185,129,0.28)] transition hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2',
              open ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
            )}
          >
            <span className="flex items-center px-2.5 py-4">
              <span className="[writing-mode:vertical-rl] rotate-180 text-[11px] font-semibold uppercase tracking-[0.18em]">Foco del día</span>
            </span>
          </button>
        </>
      ) : null}

      <div
        className={cn(
          'pointer-events-none absolute right-3 top-0 w-[320px] transition',
          open ? 'pointer-events-auto' : 'pointer-events-none'
        )}
        aria-hidden={!open}
      >
        <aside
          className={cn(
            'overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_28px_60px_rgba(15,23,42,0.18)] transition-transform duration-300',
            open ? 'translate-x-0 opacity-100' : 'translate-x-6 opacity-0'
          )}
        >
          <div className="border-b border-slate-200 bg-white px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Foco del día</p>
                <h3 className="mt-2 text-xl font-bold tracking-tight text-slate-900">Qué atender</h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">Alertas e insights rápidos sin quitar espacio a la pizarra.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={hideTemporarily}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-700 transition hover:bg-emerald-100"
                  title="Ocultar 30 segundos"
                  aria-label="Ocultar 30 segundos"
                >
                  <EyeOff className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
                  title="Cerrar"
                  aria-label="Cerrar"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="mt-3">
              <Link href="/app/intelligence" className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600">
                Ver insights <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="space-y-3 px-4 py-4">
            <div className="grid gap-3">
              {focus.map((item) => (
                <div key={item.label} className="rounded-[22px] border border-slate-200 bg-slate-50/70 px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="min-w-0 pr-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{item.label}</p>
                    <span className={`inline-flex shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${metricTone(item.value, item.tone)}`}>{item.value > 0 ? 'Activo' : 'Estable'}</span>
                  </div>
                  <div className="mt-4 space-y-1.5">
                    <p className="text-3xl font-bold leading-none text-slate-950 tabular-nums">{item.value}</p>
                    <p className="text-sm leading-6 text-slate-500">{item.helper}</p>
                  </div>
                </div>
              ))}
            </div>

            {recommendation ? (
              <div className="rounded-[22px] border border-emerald-100 bg-emerald-50/80 px-4 py-3 text-sm leading-6 text-emerald-900">
                {recommendation}
              </div>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}
