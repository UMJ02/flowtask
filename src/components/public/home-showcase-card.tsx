'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils/classnames';

const ITEMS = [
  { label: 'Hoy', value: '3 tareas por vencer', tone: 'border-emerald-100 bg-emerald-50/70' },
  { label: 'Proyecto colaborativo', value: 'Lanzamiento campaña abril', tone: 'border-sky-100 bg-sky-50/70' },
  { label: 'Seguimiento', value: 'Comentarios y cambios con fecha automática', tone: 'border-violet-100 bg-violet-50/70' },
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
    <div className="rounded-[26px] border border-slate-200/80 bg-white/42 p-3 backdrop-blur-sm">
      <div className="space-y-3">
        {ITEMS.map((item, index) => {
          const active = index === activeIndex;
          return (
            <div
              key={item.label}
              className={cn(
                'rounded-[20px] border px-4 py-4 transition-all duration-500',
                active ? `${item.tone} shadow-[0_12px_30px_rgba(15,23,42,0.06)]` : 'border-white/40 bg-white/55 opacity-80'
              )}
            >
              <p className="text-sm text-slate-500">{item.label}</p>
              <p className={cn('mt-1 text-lg font-semibold text-slate-900 transition-all duration-500', active && 'animate-[fade-rise_500ms_ease-out]')}>
                {item.value}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
