import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Card } from '@/components/ui/card';

export type CoreRouteItem = {
  title: string;
  description: string;
  href: string;
  icon: ReactNode;
};

export function CoreRouteDeck({
  eyebrow = 'Flujo core',
  title,
  description,
  items,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  items: CoreRouteItem[];
}) {
  return (
    <Card className="surface-glow">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{eyebrow}</p>
        <h2 className="mt-2 text-xl font-bold text-slate-900">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-700 ring-1 ring-slate-200 transition group-hover:bg-emerald-100 group-hover:text-emerald-700 group-hover:ring-emerald-200">
                {item.icon}
              </span>
              <ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover:text-emerald-700" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-slate-900">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
          </Link>
        ))}
      </div>
    </Card>
  );
}
