import { DEPARTMENTS } from '@/lib/constants/departments';
import { TASK_STATUSES } from '@/lib/constants/task-status';
import { ExpandableSearchShell } from '@/components/filters/expandable-search-shell';
import { Select } from '@/components/ui/select';

interface TaskFiltersProps {
  filters: {
    q?: string;
    status?: string;
    department?: string;
    due?: string;
  };
}

export function TaskFilters({ filters }: TaskFiltersProps) {
  const hasAdvancedFilters = Boolean(filters.status || filters.department || filters.due);

  return (
    <ExpandableSearchShell
      actionHref="/app/tasks"
      placeholder="Escribe una tarea, cliente o palabra clave"
      queryValue={filters.q ?? ''}
      hasAdvancedFilters={hasAdvancedFilters}
      advancedFilters={
        <div className="grid gap-3 md:grid-cols-3">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Estado</span>
            <Select defaultValue={filters.status ?? ''} name="status" className="h-12 rounded-[18px] bg-white">
              <option value="">Todos</option>
              {TASK_STATUSES.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </Select>
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Área</span>
            <Select defaultValue={filters.department ?? ''} name="department" className="h-12 rounded-[18px] bg-white">
              <option value="">Todas</option>
              {DEPARTMENTS.map((item) => (
                <option key={item.code} value={item.code}>{item.label}</option>
              ))}
            </Select>
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Fecha</span>
            <Select defaultValue={filters.due ?? ''} name="due" className="h-12 rounded-[18px] bg-white">
              <option value="">Todas</option>
              <option value="overdue">Vencidas</option>
              <option value="today">Vencen hoy</option>
              <option value="soon">Próximas</option>
              <option value="none">Sin fecha</option>
            </Select>
          </label>
        </div>
      }
    />
  );
}
