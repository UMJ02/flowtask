import type { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils/classnames';

export type SectionHeaderBadge = {
  label: string;
  tone?: 'default' | 'stable' | 'attention';
};

function badgeTone(tone: SectionHeaderBadge['tone']) {
  if (tone === 'stable') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  if (tone === 'attention') return 'border-amber-200 bg-amber-50 text-amber-700';
  return 'border-slate-200 bg-white text-slate-600';
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  actions,
  icon,
  badges,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  icon?: ReactNode;
  badges?: SectionHeaderBadge[];
  className?: string;
}) {
  return (
    <Card className={cn('surface-glow flex flex-col gap-4 md:flex-row md:items-center md:justify-between', className)}>
      <div className="flex items-start gap-4">
        {icon ? (
          <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-[20px] bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
            {icon}
          </span>
        ) : null}
        <div>
          {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">{eyebrow}</p> : null}
          <h1 className="mt-1 text-2xl font-bold text-slate-900 md:text-3xl">{title}</h1>
          {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{description}</p> : null}
          {badges?.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {badges.map((badge) => (
                <span key={badge.label} className={cn('inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold', badgeTone(badge.tone))}>
                  {badge.label}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
      {actions ? <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap md:w-auto md:justify-end md:items-center">{actions}</div> : null}
    </Card>
  );
}
