'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils/classnames';

const ITEMS = [
  {
    label: 'Hoy',
    value: '3 tareas por vencer',
    tone: 'from-emerald-50 to-white border-emerald-100',
  },
  {
    label: 'Proyecto colaborativo',
    value: 'Lanzamiento campaña abril',
    tone: 'from-sky-50 to-white border-sky-100',
  },
  {
    label: 'Seguimiento',
    value: 'Comentarios y cambios con fecha automática',
    tone: 'from-violet-50 to-white border-violet-100',
  },
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
    <div className="mx-auto w-full max-w-[520px] rounded-[30px] border border-slate-200/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.98))] p-5 shadow-[0_22px_56px_rgba(15,23,42,0.10)] backdrop-blur md:p-6">
      <div className="space-y-4">
        {ITEMS.map((item, index) => {
          const active = index === activeIndex;
          return (
            <div
              key={item.label}
              className={cn(
                'rounded-[22px] border bg-white p-4 transition-all duration-500',
                active
                  ? `bg-gradient-to-br ${item.tone} shadow-[0_16px_34px_rgba(15,23,42,0.08)] scale-[1.01]`
                  : 'border-slate-200 bg-white/90 opacity-80'
              )}
            >
              <p className="text-sm text-slate-500">{item.label}</p>
              <p className={cn(
                'mt-1 text-lg font-semibold text-slate-900 transition-all duration-500',
                active && 'translate-x-0 animate-[fade-rise_500ms_ease-out]'
              )}>
                {item.value}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
