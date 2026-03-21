import Link from "next/link";
import { DEPARTMENTS } from "@/lib/constants/departments";
import { TASK_STATUSES } from "@/lib/constants/task-status";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface TaskFiltersProps {
  filters: {
    q?: string;
    status?: string;
    department?: string;
    due?: string;
  };
}

export function TaskFilters({ filters }: TaskFiltersProps) {
  return (
    <form className="grid gap-3 rounded-[24px] bg-white p-4 shadow-soft md:grid-cols-5" method="get">
      <Input defaultValue={filters.q ?? ""} name="q" placeholder="Buscar tarea" />
      <Select defaultValue={filters.status ?? ""} name="status">
        <option value="">Todos los estados</option>
        {TASK_STATUSES.map((item) => (
          <option key={item.value} value={item.value}>{item.label}</option>
        ))}
      </Select>
      <Select defaultValue={filters.department ?? ""} name="department">
        <option value="">Todos los departamentos</option>
        {DEPARTMENTS.map((item) => (
          <option key={item.code} value={item.code}>{item.label}</option>
        ))}
      </Select>
      <Select defaultValue={filters.due ?? ""} name="due">
        <option value="">Todos los vencimientos</option>
        <option value="overdue">Vencidas</option>
        <option value="soon">Próximas</option>
        <option value="none">Sin deadline</option>
      </Select>
      <div className="flex gap-2">
        <Button className="w-full" type="submit">Filtrar</Button>
        <Link href="/app/tasks" className="w-full">
          <Button className="w-full" type="button" variant="secondary">Limpiar</Button>
        </Link>
      </div>
    </form>
  );
}
