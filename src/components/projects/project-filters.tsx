import Link from "next/link";
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
  return (
    <form className="grid gap-3 rounded-[24px] bg-white p-4 shadow-soft md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-[minmax(160px,1fr)_minmax(170px,1fr)_minmax(190px,1fr)_minmax(140px,0.8fr)_minmax(170px,1fr)_auto]" method="get">
      <Input defaultValue={filters.q ?? ""} name="q" placeholder="Buscar proyecto" />
      <Select defaultValue={filters.status ?? ""} name="status">
        <option value="">Todos los estados</option>
        {PROJECT_STATUSES.map((item) => (
          <option key={item.value} value={item.value}>{item.label}</option>
        ))}
      </Select>
      <Select defaultValue={filters.department ?? ""} name="department">
        <option value="">Todos los departamentos</option>
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
        <Button className="min-w-[120px] flex-1 2xl:flex-none" type="submit">Filtrar</Button>
        <Link href="/app/projects" className="flex-1 2xl:flex-none">
          <Button className="min-w-[120px] w-full" type="button" variant="secondary">Limpiar</Button>
        </Link>
      </div>
    </form>
  );
}
