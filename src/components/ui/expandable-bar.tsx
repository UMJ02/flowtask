import { Search, ChevronDown } from 'lucide-react';
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
        'group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 open:shadow-[0_8px_22px_rgba(15,23,42,0.06)]',
        className,
      )}
      open={defaultOpen}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 marker:content-none hover:bg-slate-50/80">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{eyebrow}</p>
          ) : null}
          <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
            <h3 className="truncate-1 text-sm font-semibold text-slate-950">{title}</h3>
            {description ? <p className="truncate-1 text-sm text-slate-500">{description}</p> : null}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-emerald-200 bg-emerald-50 text-emerald-700 transition-colors duration-200 group-hover:bg-emerald-100">
            <Search className="h-4 w-4" />
          </span>
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition duration-200 group-open:rotate-180 group-open:text-slate-700">
            <ChevronDown className="h-4 w-4" />
          </span>
        </div>
      </summary>
      <div className={cn('animate-fade-in border-t border-slate-200 p-4', contentClassName)}>{children}</div>
    </details>
  );
}
