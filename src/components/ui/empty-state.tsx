import type { ReactNode } from 'react';
import { Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function EmptyState({
  title,
  description,
  icon,
  action,
}: {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <Card className="rounded-[30px] border border-dashed border-slate-300 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.08),_transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.98))] px-6 py-8 text-center shadow-none md:px-8 md:py-10">
      <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
        <Sparkles className="h-3.5 w-3.5" />
        Estado inicial
      </div>
      {icon ? (
        <div className="mx-auto mt-4 inline-flex h-16 w-16 items-center justify-center rounded-[22px] bg-white text-emerald-700 ring-1 ring-emerald-100 shadow-[0_10px_24px_rgba(16,185,129,0.10)]">
          {icon}
        </div>
      ) : null}
      <h3 className="mt-5 text-xl font-semibold text-slate-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </Card>
  );
}
