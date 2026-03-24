import type { ReactNode } from 'react';
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
    <Card className="surface-glow border-dashed border-slate-200/90 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] text-center">
      {icon ? <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-[20px] bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">{icon}</div> : null}
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Nada por aquí todavía</p>
      <h3 className="mt-2 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">{description}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </Card>
  );
}
