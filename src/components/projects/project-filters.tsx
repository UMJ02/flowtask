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
  };
}

export function ProjectFilters({ filters }: ProjectFiltersProps) {
  return (
    <form className="grid gap-3 rounded-[24px] bg-white p-4 shadow-soft md:grid-cols-5" method="get">
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
      <Select defaultValue={filters.mode ?? ""} name="mode">
        <option value="">Todos los tipos</option>
        <option value="solo">Solo personales</option>
        <option value="collaborative">Colaborativos</option>
      </Select>
      <div className="flex gap-2">
        <Button className="w-full" type="submit">Filtrar</Button>
        <Link href="/app/projects" className="w-full">
          <Button className="w-full" type="button" variant="secondary">Limpiar</Button>
        </Link>
      </div>
    </form>
  );
}
