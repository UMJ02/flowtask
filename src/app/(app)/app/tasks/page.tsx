import Link from 'next/link';
import { ClipboardList } from 'lucide-react';
import { TaskFilters } from '@/components/tasks/task-filters';
import { TaskWorkspace } from '@/components/tasks/task-workspace';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { SectionHeader } from '@/components/ui/section-header';
import { FilterPresets } from '@/components/ui/filter-presets';
import { taskNewRoute } from '@/lib/navigation/routes';
import { getTasks } from '@/lib/queries/tasks';
import { normalizeTaskFilters, toQueryString, type SearchParamsRecord } from '@/lib/runtime/search-params';

export default async function TasksPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParamsRecord>;
}) {
  const filters = normalizeTaskFilters((await searchParams) ?? {});
  const tasks = await getTasks(filters);
  const currentQuery = toQueryString(filters);

  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="Seguimiento simple"
        title="Tareas"
        description="Busca, filtra y actualiza pendientes sin perder tiempo. Puedes usar vista lista o tablero con una interfaz más limpia y legible."
        icon={<ClipboardList className="h-5 w-5" />}
        actions={
          <Link href={taskNewRoute()}>
            <Button>Nueva tarea</Button>
          </Link>
        }
      />
      <TaskFilters filters={filters} />
      <FilterPresets
        storageKey="flowtask:filters:tasks"
        basePath="/app/tasks"
        currentQuery={currentQuery}
        title="Vistas rápidas de tareas"
        emptyLabel="Guarda combinaciones de tablero, estado y fechas para volver sin reconstruir filtros."
      />
      {tasks.length ? (
        <TaskWorkspace tasks={tasks} filters={filters} />
      ) : (
        <EmptyState
          icon={<ClipboardList className="h-6 w-6" />}
          title="No hay tareas con estos filtros"
          description="Ajusta la búsqueda, cambia los filtros o crea una tarea nueva para empezar a trabajar desde esta vista."
          action={
            <Link href={taskNewRoute()}>
              <Button>Crear tarea</Button>
            </Link>
          }
        />
      )}
    </div>
  );
}
