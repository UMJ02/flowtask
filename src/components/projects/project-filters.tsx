import Link from "next/link";
import { Search } from 'lucide-react';
import { DEPARTMENTS } from "@/lib/constants/departments";
import { PROJECT_STATUSES } from "@/lib/constants/project-status";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

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
  const hasFilters = Boolean(filters.q || filters.status || filters.department || filters.mode || filters.client);

  return (
    <details className="group rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)]" open={hasFilters}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 [&::-webkit-details-marker]:hidden">
        <div className="flex min-w-0 items-center gap-3">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-100">
            <Search className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-base font-semibold text-slate-950">Busca tus proyectos</p>
            <p className="text-sm text-slate-500">Abre esta barra para encontrar por cliente, estado, área o tipo.</p>
          </div>
        </div>
        <span className="text-sm font-medium text-emerald-700 group-open:text-slate-500">{hasFilters ? 'Filtrado' : 'Abrir'}</span>
      </summary>

      <form className="grid gap-3 border-t border-slate-100 px-5 py-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-[minmax(180px,1fr)_minmax(180px,1fr)_minmax(180px,1fr)_minmax(150px,0.9fr)_minmax(180px,1fr)_auto]" method="get">
        <Input defaultValue={filters.q ?? ""} name="q" placeholder="Busca por nombre o detalle" />
        <Select defaultValue={filters.status ?? ""} name="status">
          <option value="">Todos los estados</option>
          {PROJECT_STATUSES.map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </Select>
        <Select defaultValue={filters.department ?? ""} name="department">
          <option value="">Todas las áreas</option>
          {DEPARTMENTS.map((item) => (
            <option key={item.code} value={item.code}>{item.label}</option>
          ))}
        </Select>
        <Input defaultValue={filters.client ?? ""} name="client" placeholder="Cliente" />
        <Select defaultValue={filters.mode ?? ""} name="mode">
          <option value="">Todos los tipos</option>
          <option value="solo">Solo personales</option>
          <option value="collaborative">Colaborativos</option>
        </Select>
        <div className="flex flex-wrap gap-2 md:col-span-2 xl:col-span-3 2xl:col-span-1 2xl:flex-nowrap">
          <Button className="min-w-[120px] flex-1 2xl:flex-none" type="submit">Aplicar</Button>
          <Link href="/app/projects" className="flex-1 2xl:flex-none">
            <Button className="w-full min-w-[120px]" type="button" variant="secondary">Limpiar</Button>
          </Link>
        </div>
      </form>
    </details>
  );
}
