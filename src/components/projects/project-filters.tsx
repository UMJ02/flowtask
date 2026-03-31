import { DEPARTMENTS } from '@/lib/constants/departments';
import { PROJECT_STATUSES } from '@/lib/constants/project-status';
import { ExpandableSearchShell } from '@/components/filters/expandable-search-shell';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

interface ProjectFiltersProps {
  filters: {
    q?: string;
    status?: string;
    department?: string;
    mode?: string;
    client?: string;
  };
}

export function ProjectFilters({ filters }: ProjectFiltersProps) {
  const hasAdvancedFilters = Boolean(filters.status || filters.department || filters.mode || filters.client);

  return (
    <ExpandableSearchShell
      actionHref="/app/projects"
      placeholder="Escribe el nombre de un proyecto"
      queryValue={filters.q ?? ''}
      hasAdvancedFilters={hasAdvancedFilters}
      advancedFilters={
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Estado</span>
            <Select defaultValue={filters.status ?? ''} name="status" className="h-12 rounded-[18px] bg-white">
              <option value="">Todos los estados</option>
              {PROJECT_STATUSES.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </Select>
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Área</span>
            <Select defaultValue={filters.department ?? ''} name="department" className="h-12 rounded-[18px] bg-white">
              <option value="">Todos los departamentos</option>
              {DEPARTMENTS.map((item) => (
                <option key={item.code} value={item.code}>{item.label}</option>
              ))}
            </Select>
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Cliente</span>
            <Input defaultValue={filters.client ?? ''} name="client" placeholder="Nombre del cliente" className="h-12 rounded-[18px] bg-white" />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Tipo</span>
            <Select defaultValue={filters.mode ?? ''} name="mode" className="h-12 rounded-[18px] bg-white">
              <option value="">Todos los tipos</option>
              <option value="solo">Solo personales</option>
              <option value="collaborative">Colaborativos</option>
            </Select>
          </label>
        </div>
      }
    />
  );
}
