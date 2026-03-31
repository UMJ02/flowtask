'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils/classnames';

type HiddenField = { name: string; value: string };

type ExpandableSearchShellProps = {
  actionHref: string;
  placeholder: string;
  queryName?: string;
  queryValue?: string;
  hiddenFields?: HiddenField[];
  hasAdvancedFilters?: boolean;
  advancedFilters?: React.ReactNode;
};

export function ExpandableSearchShell({
  actionHref,
  placeholder,
  queryName = 'q',
  queryValue = '',
  hiddenFields = [],
  hasAdvancedFilters = false,
  advancedFilters,
}: ExpandableSearchShellProps) {
  const shouldOpenInitially = useMemo(() => hasAdvancedFilters, [hasAdvancedFilters]);
  const [expanded, setExpanded] = useState(shouldOpenInitially);

  return (
    <form className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.04)]" method="get">
      {hiddenFields.map((field) => (
        <input key={field.name} type="hidden" name={field.name} value={field.value} />
      ))}

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <Input
            className="h-14 rounded-[22px] border-slate-200 pl-12 pr-4 text-base"
            defaultValue={queryValue}
            name={queryName}
            placeholder={placeholder}
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row xl:flex-none">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setExpanded((current) => !current)}
            className={cn('h-14 rounded-[22px] px-5', expanded && 'border-emerald-200 bg-emerald-50 text-emerald-700')}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Expandir
            <ChevronDown className={cn('h-4 w-4 transition-transform', expanded && 'rotate-180')} />
          </Button>
          <Link href={actionHref} className="sm:min-w-[126px]">
            <Button type="button" variant="secondary" className="h-14 w-full rounded-[22px] px-5">Limpiar</Button>
          </Link>
          <Button type="submit" className="h-14 rounded-[22px] px-6 sm:min-w-[140px]">Buscar</Button>
        </div>
      </div>

      {expanded && advancedFilters ? (
        <div className="mt-4 rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">{advancedFilters}</div>
      ) : null}
    </form>
  );
}
