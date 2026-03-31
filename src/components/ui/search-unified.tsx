'use client';

import { useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronDown, Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/classnames';

export type SearchFilterOption = {
  value: string;
  label: string;
};

export type SearchAdvancedField = {
  name: string;
  label: string;
  placeholder?: string;
  type?: 'select' | 'text';
  options?: SearchFilterOption[];
};

export function SearchUnified({
  placeholder,
  initialValues,
  advancedFields,
}: {
  placeholder: string;
  initialValues: Record<string, string>;
  advancedFields: SearchAdvancedField[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const [expanded, setExpanded] = useState(() => advancedFields.some((field) => Boolean(initialValues[field.name])));

  const hasAdvancedValues = useMemo(
    () => advancedFields.some((field) => Boolean(values[field.name])),
    [advancedFields, values],
  );

  const submit = () => {
    const params = new URLSearchParams();
    Object.entries(values).forEach(([key, value]) => {
      const trimmed = value?.trim?.() ?? value;
      if (trimmed) params.set(key, trimmed);
    });
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-3 rounded-[22px] border border-slate-200 bg-white px-4 py-3 shadow-[0_6px_18px_rgba(15,23,42,0.05)]">
          <Search className="h-5 w-5 text-slate-400" />
          <input
            value={values.q ?? ''}
            onChange={(event) => setValues((current) => ({ ...current, q: event.target.value }))}
            onKeyDown={(event) => {
              if (event.key === 'Enter') submit();
            }}
            placeholder={placeholder}
            className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="flex gap-2 self-end xl:self-auto">
          <Button
            type="button"
            variant="secondary"
            className={cn('rounded-[18px] px-4', hasAdvancedValues && 'border-emerald-200 bg-emerald-50 text-emerald-700')}
            onClick={() => setExpanded((current) => !current)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Expandir
            <ChevronDown className={cn('h-4 w-4 transition-transform', expanded && 'rotate-180')} />
          </Button>
          <Button type="button" className="rounded-[18px] px-5" onClick={submit}>
            Buscar
          </Button>
        </div>
      </div>

      {expanded ? (
        <div className="grid gap-3 rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_6px_18px_rgba(15,23,42,0.05)] md:grid-cols-2 xl:grid-cols-4">
          {advancedFields.map((field) => (
            <label key={field.name} className="space-y-2 text-sm text-slate-600">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{field.label}</span>
              {field.type === 'text' ? (
                <input
                  value={values[field.name] ?? ''}
                  onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}
                  className="h-11 w-full rounded-2xl border border-slate-200 px-3 text-sm text-slate-900 outline-none transition focus:border-emerald-300"
                  placeholder={field.placeholder}
                />
              ) : (
                <select
                  value={values[field.name] ?? ''}
                  onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}
                  className="h-11 w-full rounded-2xl border border-slate-200 px-3 text-sm text-slate-900 outline-none transition focus:border-emerald-300"
                >
                  <option value="">Todos</option>
                  {(field.options ?? []).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
            </label>
          ))}
        </div>
      ) : null}
    </div>
  );
}
