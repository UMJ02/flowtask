import Link from 'next/link';
import { ClipboardList } from 'lucide-react';
import { TaskFilters } from '@/components/tasks/task-filters';
import { TaskWorkspace } from '@/components/tasks/task-workspace';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { SectionHeader } from '@/components/ui/section-header';
import { FilterPresets } from '@/components/ui/filter-presets';
import { ExpandableBar } from '@/components/ui/expandable-bar';
import { taskNewRoute } from '@/lib/navigation/routes';
import { getTasks } from '@/lib/queries/tasks';
import { safeServerCall } from '@/lib/runtime/safe-server';
import { normalizeTaskFilters, toQueryString, type SearchParamsRecord } from '@/lib/runtime/search-params';

export default async function TasksPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParamsRecord>;
}) {
  const filters = normalizeTaskFilters((await searchParams) ?? {});
  const currentQuery = toQueryString(filters);
  const tasks = await safeServerCall('getTasks', () => getTasks(filters), null as Awaited<ReturnType<typeof getTasks>> | null);

  if (tasks === null) {
    return (
      <ErrorState
        title="No pudimos abrir tareas"
        description="La vista no pudo cargar la lista en este intento. Vuelve a probar o entra al dashboard para seguir trabajando."
        action={
          <Link href="/app/dashboard">
            <Button>Ir al dashboard</Button>
          </Link>
        }
      />
    );
  }

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
      <ExpandableBar
        eyebrow="Buscar"
        title="Busca tus tareas"
        description="Abre esta barra para encontrar tareas por estado, área o fecha."
      >
        <TaskFilters filters={filters} />
      </ExpandableBar>
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
