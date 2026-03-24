import Link from 'next/link';
import { AlertTriangle, ClipboardList, ListTodo, TimerReset, Users } from 'lucide-react';
import { CoreMetricStrip } from '@/components/core/core-metric-strip';
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
  const today = new Date().toISOString().slice(0, 10);

  const openCount = tasks.filter((task) => (task.status ?? '').toLowerCase() !== 'concluido').length;
  const overdueCount = tasks.filter((task) => Boolean(task.due_date) && String(task.due_date).slice(0, 10) < today && (task.status ?? '').toLowerCase() !== 'concluido').length;
  const todayCount = tasks.filter((task) => Boolean(task.due_date) && String(task.due_date).slice(0, 10) === today && (task.status ?? '').toLowerCase() !== 'concluido').length;
  const clientBoundCount = tasks.filter((task) => Boolean(task.client_name?.trim())).length;

  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="Seguimiento simple"
        title="Tareas"
        description="Busca, filtra y actualiza pendientes sin perder tiempo. Puedes usar vista lista o tablero con una interfaz más limpia y legible."
        badges={[
          { label: 'Lista + tablero', tone: 'stable' },
          { label: 'Carga diaria', tone: 'default' },
          { label: 'Atención a vencidas', tone: 'attention' },
        ]}
        icon={<ClipboardList className="h-5 w-5" />}
        actions={
          <Link href={taskNewRoute()}>
            <Button>Nueva tarea</Button>
          </Link>
        }
      />

      <CoreMetricStrip
        eyebrow="Core hardening"
        title="Pulso operativo de la carga"
        description="La vista de tareas ahora arranca con señales más claras para decidir si conviene ejecutar, reagendar o limpiar backlog."
        items={[
          {
            label: 'Abiertas',
            value: openCount,
            helper: 'Tareas activas dentro del filtro actual.',
            icon: <ListTodo className="h-5 w-5" />,
            tone: openCount ? 'stable' : 'default',
          },
          {
            label: 'Vencidas',
            value: overdueCount,
            helper: 'Pendientes fuera de fecha que necesitan atención.',
            icon: <AlertTriangle className="h-5 w-5" />,
            tone: overdueCount ? 'critical' : 'default',
          },
          {
            label: 'Para hoy',
            value: todayCount,
            helper: 'Carga que debería resolverse hoy.',
            icon: <TimerReset className="h-5 w-5" />,
            tone: todayCount ? 'attention' : 'default',
          },
          {
            label: 'Con cliente',
            value: clientBoundCount,
            helper: 'Tareas vinculadas a un contexto comercial.',
            icon: <Users className="h-5 w-5" />,
            tone: clientBoundCount ? 'stable' : 'default',
          },
        ]}
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
