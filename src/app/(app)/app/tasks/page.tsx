export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { FolderClock, ListChecks, Plus } from 'lucide-react';
import { TaskSearchPanel } from '@/components/tasks/task-search-panel';
import { TaskWorkspace } from '@/components/tasks/task-workspace';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { PageIntro } from '@/components/ui/page-intro';
import { taskNewRoute } from '@/lib/navigation/routes';
import { getTasks } from '@/lib/queries/tasks';
import { safeServerCall } from '@/lib/runtime/safe-server';

function metricCard(label: string, value: number, helper: string) {
  return (
    <Card className="rounded-[22px] border border-slate-200 bg-white px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{helper}</p>
    </Card>
  );
}

export default async function TasksPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const params = (await searchParams) ?? {};
  const filters = {
    q: typeof params.q === 'string' ? params.q : '',
    status: typeof params.status === 'string' ? params.status : '',
    priority: typeof params.priority === 'string' ? params.priority : '',
    department: typeof params.department === 'string' ? params.department : '',
    due: typeof params.due === 'string' ? params.due : '',
    view: typeof params.view === 'string' ? params.view : '',
  };
  const tasks = await safeServerCall('getTasks', () => getTasks(filters), []);
  const queryString = new URLSearchParams(
    Object.entries(filters).flatMap(([key, value]) => (value ? [[key, value]] : [])),
  ).toString();

  const stats = {
    total: tasks.length,
    inProgress: tasks.filter((task) => task.status === 'en_proceso').length,
    waiting: tasks.filter((task) => task.status === 'en_espera').length,
    done: tasks.filter((task) => task.status === 'concluido').length,
    highPriority: tasks.filter((task) => task.priority === 'alta').length,
  };

  return (
    <div className="space-y-4">
      <PageIntro
        eyebrow="Tareas"
        title="Workspace de tareas"
        description="Filtra por estado, prioridad, fecha o área. Mantén el foco y entra al detalle sin perder contexto. Esta capa de V56 deja la vista más clara para usuarios finales y para demos con cliente."
        actions={
          <Link href={taskNewRoute(queryString)}>
            <Button>
              <Plus className="h-4 w-4" />
              Nueva tarea
            </Button>
          </Link>
        }
        aside={
          <div className="rounded-[22px] border border-sky-200 bg-sky-50/80 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-700">Lectura rápida</p>
            <p className="mt-2 text-sm leading-6 text-sky-900">Las métricas resumen y el estado vacío ahora quedan alineados con el flujo de trabajo real del usuario.</p>
          </div>
        }
      />

      <TaskSearchPanel filters={filters} />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {metricCard('Total visible', stats.total, 'resultado actual')}
        {metricCard('En progreso', stats.inProgress, 'trabajo activo')}
        {metricCard('En espera', stats.waiting, 'requieren seguimiento')}
        {metricCard('Concluidas', stats.done, 'historial reciente')}
        {metricCard('Prioridad alta', stats.highPriority, 'foco inmediato')}
      </div>

      {!tasks.length ? (
        <EmptyState
          icon={<FolderClock className="h-6 w-6" />}
          title="No encontramos tareas para esta combinación"
          description="Prueba limpiando filtros o crea una nueva tarea para empezar a mover el flujo de trabajo desde esta vista."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Link href="/app/tasks"><Button variant="secondary">Limpiar filtros</Button></Link>
              <Link href={taskNewRoute(queryString)}><Button>Nueva tarea</Button></Link>
            </div>
          }
        />
      ) : (
        <TaskWorkspace tasks={tasks.map((task) => ({
          id: task.id,
          title: task.title,
          status: task.status,
          priority: task.priority,
          client_name: task.client_name,
          due_date: task.due_date,
          project_id: task.project_id,
        }))} filters={filters} currentView={filters.view} currentQuery={queryString} />
      )}

      <Card className="rounded-[22px] border border-slate-200/90 bg-white/[0.90] p-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-600">
            <ListChecks className="h-4 w-4 text-emerald-700" />
            Consejo: usa la vista lista para revisar rápido y la pizarra cuando necesites mover tareas visualmente.
          </div>
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">FlowTask · UX final</span>
        </div>
      </Card>
    </div>
  );
}
