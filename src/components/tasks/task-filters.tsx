import Link from 'next/link';
import { Search } from 'lucide-react';
import { DEPARTMENTS } from '@/lib/constants/departments';
import { TASK_STATUSES } from '@/lib/constants/task-status';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface TaskFiltersProps {
  filters: {
    q?: string;
    status?: string;
    department?: string;
    due?: string;
    view?: string;
  };
}

export function TaskFilters({ filters }: TaskFiltersProps) {
  const hasFilters = Boolean(filters.q || filters.status || filters.department || filters.due);

  return (
    <details className="group rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)]" open={hasFilters}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 [&::-webkit-details-marker]:hidden">
        <div className="flex min-w-0 items-center gap-3">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-100">
            <Search className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-base font-semibold text-slate-950">Busca tus tareas</p>
            <p className="text-sm text-slate-500">Abre esta barra para filtrar por estado, área o fecha.</p>
          </div>
        </div>
        <span className="text-sm font-medium text-emerald-700 group-open:text-slate-500">{hasFilters ? 'Filtrado' : 'Abrir'}</span>
      </summary>

      <form className="grid gap-3 border-t border-slate-100 px-5 py-4 md:grid-cols-5" method="get">
        {!!filters.view && <input type="hidden" name="view" value={filters.view} />}
        <Input defaultValue={filters.q ?? ''} name="q" placeholder="Busca por tarea, cliente o detalle" />
        <Select defaultValue={filters.status ?? ''} name="status">
          <option value="">Todos los estados</option>
          {TASK_STATUSES.map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </Select>
        <Select defaultValue={filters.department ?? ''} name="department">
          <option value="">Todas las áreas</option>
          {DEPARTMENTS.map((item) => (
            <option key={item.code} value={item.code}>{item.label}</option>
          ))}
        </Select>
        <Select defaultValue={filters.due ?? ''} name="due">
          <option value="">Todas las fechas</option>
          <option value="overdue">Vencidas</option>
          <option value="today">Para hoy</option>
          <option value="soon">Próximas</option>
          <option value="none">Sin fecha</option>
        </Select>
        <div className="flex gap-2 md:justify-end">
          <Link href="/app/tasks" className="w-full md:w-auto">
            <Button className="w-full md:w-auto" type="button" variant="secondary">Limpiar</Button>
          </Link>
          <Button className="w-full md:w-auto" type="submit">Aplicar</Button>
        </div>
      </form>
    </details>
  );
}
