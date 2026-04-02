'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils/classnames';

const ITEMS = [
  { label: 'Hoy', value: '3 tareas por vencer', tone: 'border-emerald-200 bg-emerald-500/90 lg:bg-emerald-50/72 glow-emerald text-glow-active' },
  { label: 'Proyecto colaborativo', value: 'Lanzamiento campaña abril', tone: 'border-sky-200 bg-sky-500/90 lg:bg-sky-50/72 glow-sky text-glow-active' },
  { label: 'Seguimiento', value: 'Comentarios y cambios con fecha automática', tone: 'border-violet-200 bg-violet-500/90 lg:bg-violet-50/72 glow-violet text-glow-active' },
] as const;

export function HomeShowcaseCard() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % ITEMS.length);
    }, 8000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="rounded-[26px] border border-white/35 bg-white/14 p-3 backdrop-blur-sm lg:bg-white/8">
      <div className="space-y-3">
        {ITEMS.map((item, index) => {
          const active = index === activeIndex;
          return (
            <div
              key={item.label}
              className={cn(
                'rounded-[20px] border px-4 py-4 transition-all duration-500',
                active
                  ? `${item.tone} animate-[pulse-outline_2.8s_ease-in-out_infinite] shadow-[0_14px_36px_rgba(15,23,42,0.10)] ring-1 ring-white/40`
                  : 'border-white/28 bg-white/45 opacity-84 lg:bg-white/38'
              )}
            >
              <p
                className={cn(
                  'text-sm text-slate-500 transition-colors duration-500 lg:text-slate-700/90',
                  active && 'text-white lg:text-white'
                )}
              >
                {item.label}
              </p>
              <p
                className={cn(
                  'mt-1 text-lg font-semibold text-slate-900 transition-all duration-500',
                  active && 'text-white animate-[fade-rise_500ms_ease-out]'
                )}
              >
                {item.value}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
