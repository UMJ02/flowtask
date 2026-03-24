import type { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils/classnames';

export type CoreMetricItem = {
  label: string;
  value: string | number;
  helper?: string;
  icon?: ReactNode;
  tone?: 'default' | 'attention' | 'critical' | 'stable';
};

function toneClass(tone: CoreMetricItem['tone']) {
  if (tone === 'critical') return 'border-rose-100 bg-rose-50/80';
  if (tone === 'attention') return 'border-amber-100 bg-amber-50/80';
  if (tone === 'stable') return 'border-emerald-100 bg-emerald-50/80';
  return 'border-slate-200 bg-white';
}

function iconToneClass(tone: CoreMetricItem['tone']) {
  if (tone === 'critical') return 'bg-rose-100 text-rose-700';
  if (tone === 'attention') return 'bg-amber-100 text-amber-700';
  if (tone === 'stable') return 'bg-emerald-100 text-emerald-700';
  return 'bg-slate-100 text-slate-700';
}

export function CoreMetricStrip({
  eyebrow = 'Resumen',
  title,
  description,
  items,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  items: CoreMetricItem[];
}) {
  return (
    <Card className="surface-glow">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{eyebrow}</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className={cn('rounded-[24px] border px-4 py-4', toneClass(item.tone))}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{item.label}</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{item.value}</p>
              </div>
              {item.icon ? (
                <span className={cn('inline-flex h-11 w-11 items-center justify-center rounded-2xl', iconToneClass(item.tone))}>
                  {item.icon}
                </span>
              ) : null}
            </div>
            {item.helper ? <p className="mt-3 text-sm text-slate-600">{item.helper}</p> : null}
          </div>
        ))}
      </div>
    </Card>
  );
}
