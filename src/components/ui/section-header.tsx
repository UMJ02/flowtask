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
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
            {icon}
          </span>
        ) : null}
        <div className="min-w-0">
          {eyebrow ? <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">{eyebrow}</p> : null}
          <h1 className="mt-1 max-w-3xl text-[1.72rem] font-bold leading-[1.05] tracking-tight text-slate-950 md:text-[2rem]">{title}</h1>
          {description ? <p className="prose-balance mt-2 max-w-[38rem] text-sm leading-6 text-slate-500">{description}</p> : null}
        </div>
      </div>
      {actions ? <div className="flex w-full flex-wrap gap-2 md:w-auto md:max-w-[44rem] md:justify-end">{actions}</div> : null}
    </Card>
  );
}
