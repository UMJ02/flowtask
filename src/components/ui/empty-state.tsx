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
    <Card className="rounded-[28px] border border-dashed border-slate-300 bg-gradient-to-br from-white to-slate-50 px-6 py-8 text-center shadow-none">
      {icon ? (
        <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-[20px] bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
          {icon}
        </div>
      ) : null}
      <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">{description}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </Card>
  );
}
