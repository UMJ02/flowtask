import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/classnames';

type ExpandableBarProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  contentClassName?: string;
};

export function ExpandableBar({
  eyebrow,
  title,
  description,
  children,
  defaultOpen = false,
  className,
  contentClassName,
}: ExpandableBarProps) {
  return (
    <details
      className={cn(
        'group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]',
        className,
      )}
      open={defaultOpen}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 marker:content-none hover:bg-slate-50/80">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{eyebrow}</p>
          ) : null}
          <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
            {description ? <p className="text-sm text-slate-500">{description}</p> : null}
          </div>
        </div>
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition group-open:rotate-180">
          <ChevronDown className="h-4 w-4" />
        </span>
      </summary>
      <div className={cn('border-t border-slate-200 p-4', contentClassName)}>{children}</div>
    </details>
  );
}
