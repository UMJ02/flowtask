'use client';

import { useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Search, SlidersHorizontal } from 'lucide-react';

type FilterOption = { label: string; value: string };

type FilterConfig = {
  key: string;
  label: string;
  options: FilterOption[];
};

export function UnifiedSearchBar({
  placeholder = 'Buscar…',
  searchLabel = 'Buscar',
  filters = [],
  values = {},
  onSearch,
}: {
  placeholder?: string;
  searchLabel?: string;
  filters?: FilterConfig[];
  values?: Record<string, string>;
  onSearch?: (values: Record<string, string>) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [localValues, setLocalValues] = useState<Record<string, string>>(values);
  const router = useRouter();
  const pathname = usePathname();

  const hasAdvancedFilters = useMemo(() => filters.length > 0, [filters]);

  const submit = () => {
    onSearch?.(localValues);
    const params = new URLSearchParams();
    Object.entries(localValues).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 md:flex-row">
        <div className="flex min-h-12 flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            value={localValues.q ?? ''}
            onChange={(event) => setLocalValues((current) => ({ ...current, q: event.target.value }))}
            onKeyDown={(event) => {
              if (event.key === 'Enter') submit();
            }}
            placeholder={placeholder}
            className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setExpanded((current) => !current)}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Expandir
          </button>
          <button
            type="button"
            onClick={submit}
            className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            {searchLabel}
          </button>
        </div>
      </div>

      {expanded && hasAdvancedFilters ? (
        <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-3 xl:grid-cols-4">
          {filters.map((filter) => (
            <label key={filter.key} className="space-y-2 text-sm">
              <span className="font-medium text-slate-600">{filter.label}</span>
              <select
                value={localValues[filter.key] ?? ''}
                onChange={(event) => setLocalValues((current) => ({ ...current, [filter.key]: event.target.value }))}
                className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-emerald-300"
              >
                <option value="">Todos</option>
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
          ))}
        </div>
      ) : null}
    </div>
  );
}
