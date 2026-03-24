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
  return (
    <form className="grid gap-3 md:grid-cols-5" method="get">
      {!!filters.view && <input type="hidden" name="view" value={filters.view} />}
      <label className="relative block md:col-span-2">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Busca tus tareas</span>
        <Search className="pointer-events-none absolute left-3 top-[42px] h-4 w-4 text-slate-400" />
        <Input className="pl-9" defaultValue={filters.q ?? ''} name="q" placeholder="Busca tus tareas" />
      </label>
      <label className="block">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Estado</span>
        <Select defaultValue={filters.status ?? ''} name="status">
          <option value="">Todos</option>
          {TASK_STATUSES.map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </Select>
      </label>
      <label className="block">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Área</span>
        <Select defaultValue={filters.department ?? ''} name="department">
          <option value="">Todas</option>
          {DEPARTMENTS.map((item) => (
            <option key={item.code} value={item.code}>{item.label}</option>
          ))}
        </Select>
      </label>
      <label className="block">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Fecha</span>
        <Select defaultValue={filters.due ?? ''} name="due">
          <option value="">Todas</option>
          <option value="overdue">Vencidas</option>
          <option value="today">Vencen hoy</option>
          <option value="soon">Próximas</option>
          <option value="none">Sin fecha</option>
        </Select>
      </label>
      <div className="flex gap-2 md:col-span-5 md:justify-end">
        <Link href="/app/tasks" className="w-full md:w-auto">
          <Button className="w-full md:w-auto" type="button" variant="secondary">Limpiar</Button>
        </Link>
        <Button className="w-full md:w-auto" type="submit">Aplicar</Button>
      </div>
    </form>
  );
}
