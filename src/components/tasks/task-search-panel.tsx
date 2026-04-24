'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Filter, Search, SlidersHorizontal, X } from 'lucide-react';
import { DEPARTMENTS } from '@/lib/constants/departments';
import { TASK_STATUSES } from '@/lib/constants/task-status';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

interface TaskSearchPanelProps {
  filters: {
    q?: string;
    status?: string;
    priority?: string;
    department?: string;
    due?: string;
    view?: string;
  };
}

const priorityLabels: Record<string, string> = {
  alta: 'Alta',
  media: 'Media',
  baja: 'Baja',
};

const dueLabels: Record<string, string> = {
  overdue: 'Vencidas',
  today: 'Vencen hoy',
  soon: 'Próximas',
  none: 'Sin fecha',
};

function getStatusLabel(value?: string) {
  return TASK_STATUSES.find((item) => item.value === value)?.label ?? value;
}

function getDepartmentLabel(value?: string) {
  return DEPARTMENTS.find((item) => item.code === value)?.label ?? value;
}

export function TaskSearchPanel({ filters }: TaskSearchPanelProps) {
  const activeChips = useMemo(() => {
    const chips: Array<{ key: string; label: string }> = [];
    if (filters.status) chips.push({ key: 'status', label: `Estado: ${getStatusLabel(filters.status)}` });
    if (filters.priority) chips.push({ key: 'priority', label: `Prioridad: ${priorityLabels[filters.priority] ?? filters.priority}` });
    if (filters.department) chips.push({ key: 'department', label: `Área: ${getDepartmentLabel(filters.department)}` });
    if (filters.due) chips.push({ key: 'due', label: `Fecha: ${dueLabels[filters.due] ?? filters.due}` });
    return chips;
  }, [filters.department, filters.due, filters.priority, filters.status]);

  return (
    <form method="get" className="space-y-4 rounded-[24px] border border-[#E5EAF1] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
      {!!filters.view && <input type="hidden" name="view" value={filters.view} />}

      <div className="grid gap-3 xl:grid-cols-[minmax(260px,1.4fr)_auto_auto_auto_auto_auto] xl:items-center">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            className="h-12 rounded-[16px] border-[#E5EAF1] bg-white pl-11 text-sm shadow-none placeholder:text-slate-400"
            defaultValue={filters.q ?? ''}
            name="q"
            placeholder="Buscar tarea, cliente o palabra clave..."
          />
        </label>

        <Button className="h-12 rounded-[16px] border-[#E5EAF1] bg-white px-4 text-[#0F172A]" type="submit" variant="secondary">
          <Filter className="h-4 w-4" />
          Filtros
          {activeChips.length ? <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#050B18] px-1.5 text-xs text-white">{activeChips.length}</span> : null}
        </Button>

        <Select className="h-12 min-w-[130px] rounded-[16px] border-[#E5EAF1] text-sm font-semibold text-slate-700" defaultValue={filters.status ?? ''} name="status" aria-label="Estado">
          <option value="">Estado</option>
          {TASK_STATUSES.map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </Select>

        <Select className="h-12 min-w-[130px] rounded-[16px] border-[#E5EAF1] text-sm font-semibold text-slate-700" defaultValue={filters.priority ?? ''} name="priority" aria-label="Prioridad">
          <option value="">Prioridad</option>
          <option value="alta">Alta</option>
          <option value="media">Media</option>
          <option value="baja">Baja</option>
        </Select>

        <Select className="h-12 min-w-[130px] rounded-[16px] border-[#E5EAF1] text-sm font-semibold text-slate-700" defaultValue={filters.department ?? ''} name="department" aria-label="Área">
          <option value="">Proyecto</option>
          {DEPARTMENTS.map((item) => (
            <option key={item.code} value={item.code}>{item.label}</option>
          ))}
        </Select>

        <Select className="h-12 min-w-[130px] rounded-[16px] border-[#E5EAF1] text-sm font-semibold text-slate-700" defaultValue={filters.due ?? ''} name="due" aria-label="Fecha">
          <option value="">Más filtros</option>
          <option value="overdue">Vencidas</option>
          <option value="today">Vencen hoy</option>
          <option value="soon">Próximas</option>
          <option value="none">Sin fecha</option>
        </Select>
      </div>

      {activeChips.length ? (
        <div className="flex flex-col gap-3 border-t border-[#E5EAF1] pt-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {activeChips.map((chip) => (
              <span key={chip.key} className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">
                {chip.label}
                <X className="h-3 w-3" />
              </span>
            ))}
          </div>
          <Link href="/app/tasks" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900">
            <SlidersHorizontal className="h-4 w-4" />
            Limpiar filtros
          </Link>
        </div>
      ) : null}
    </form>
  );
}
