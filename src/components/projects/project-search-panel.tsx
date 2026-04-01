'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Filter, Search, SlidersHorizontal } from 'lucide-react';
import { DEPARTMENTS } from '@/lib/constants/departments';
import { PROJECT_STATUSES } from '@/lib/constants/project-status';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { cn } from '@/lib/utils/classnames';

interface ProjectSearchPanelProps {
  filters: {
    q?: string;
    status?: string;
    department?: string;
    mode?: string;
    client?: string;
  };
}

export function ProjectSearchPanel({ filters }: ProjectSearchPanelProps) {
  const activeFilterCount = useMemo(
    () => Object.entries(filters).filter(([key, value]) => key !== 'q' && Boolean(value)).length,
    [filters]
  );
  const [advancedOpen, setAdvancedOpen] = useState(activeFilterCount > 0);

  return (
    <form method="get" className="rounded-[24px] border border-slate-200/90 bg-white/[0.92] p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Búsqueda inteligente</p>
              <h2 className="mt-1 text-lg font-semibold text-slate-900">Encuentra un proyecto y abre filtros solo cuando hagan falta</h2>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              <Filter className="h-3.5 w-3.5" />
              {activeFilterCount > 0 ? `${activeFilterCount} filtro(s) activos` : 'Sin filtros activos'}
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row">
            <label className="relative block min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="h-14 rounded-[20px] pl-11 text-base"
                defaultValue={filters.q ?? ''}
                name="q"
                placeholder="Buscar proyecto o palabra clave"
              />
            </label>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setAdvancedOpen((value) => !value)}
                className={cn(
                  'inline-flex h-14 items-center gap-2 rounded-[20px] border px-4 text-sm font-semibold transition',
                  advancedOpen
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                )}
              >
                <SlidersHorizontal className="h-4 w-4" />
                {advancedOpen ? 'Ocultar filtros' : 'Búsqueda avanzada'}
              </button>

              <Button className="h-14 rounded-[20px] px-6" type="submit">Buscar</Button>

              <Link href="/app/projects" className="inline-flex">
                <Button className="h-14 rounded-[20px] px-6" type="button" variant="secondary">Limpiar</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div
        className={cn(
          'grid overflow-hidden transition-all duration-300',
          advancedOpen ? 'mt-5 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        )}
      >
        <div className="min-h-0">
          <div className="rounded-[22px] border border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.95),rgba(255,255,255,0.98))] p-4">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Estado</span>
                <Select className="h-12 rounded-[16px]" defaultValue={filters.status ?? ''} name="status">
                  <option value="">Todos los estados</option>
                  {PROJECT_STATUSES.map((item) => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </Select>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Departamento</span>
                <Select className="h-12 rounded-[16px]" defaultValue={filters.department ?? ''} name="department">
                  <option value="">Todos los departamentos</option>
                  {DEPARTMENTS.map((item) => (
                    <option key={item.code} value={item.code}>{item.label}</option>
                  ))}
                </Select>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Tipo</span>
                <Select className="h-12 rounded-[16px]" defaultValue={filters.mode ?? ''} name="mode">
                  <option value="">Todos los tipos</option>
                  <option value="solo">Solo personales</option>
                  <option value="collaborative">Colaborativos</option>
                </Select>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Cliente</span>
                <Input className="h-12 rounded-[16px]" defaultValue={filters.client ?? ''} name="client" placeholder="Nombre del cliente" />
              </label>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
