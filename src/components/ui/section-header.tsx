import type { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils/classnames';

export function SectionHeader({
  eyebrow,
  title,
  description,
  actions,
  icon,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn('flex flex-col gap-4 md:flex-row md:items-start md:justify-between', className)}>
      <div className="flex min-w-0 items-start gap-3">
        {icon ? (
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
            {icon}
          </span>
        ) : null}
        <div className="min-w-0 max-w-[42rem]">
          {eyebrow ? <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{eyebrow}</p> : null}
          <h1 className="mt-1 text-[1.9rem] font-semibold leading-tight tracking-tight text-slate-950">{title}</h1>
          {description ? <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p> : null}
        </div>
      </div>
      {actions ? <div className="flex w-full flex-wrap gap-2 md:w-auto md:justify-end">{actions}</div> : null}
    </Card>
  );
}
