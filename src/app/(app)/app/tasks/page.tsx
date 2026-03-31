export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { Filter, FolderClock, ListChecks, Plus } from 'lucide-react';
import { TaskFilters } from '@/components/tasks/task-filters';
import { TaskWorkspace } from '@/components/tasks/task-workspace';
import { Card } from '@/components/ui/card';
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

  const activeFilterCount = Object.values(filters).filter(Boolean).length - (filters.view ? 1 : 0);

  return (
    <div className="space-y-4">
      <Card className="flex flex-col gap-4 rounded-[28px] md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Tareas</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Workspace de tareas</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">Filtra por estado, prioridad, fecha o área. Mantén el foco y entra al detalle sin perder contexto.</p>
        </div>
        <Link href={taskNewRoute(queryString)} className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 text-sm font-semibold text-white">
          <Plus className="h-4 w-4" />
          Nueva tarea
        </Link>
      </Card>

      <Card className="rounded-[24px] border border-slate-200/90 bg-white/90 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Centro de filtros</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">Encuentra lo que sigue</h2>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            <Filter className="h-3.5 w-3.5" />
            {activeFilterCount > 0 ? `${activeFilterCount} filtro(s) activos` : 'Sin filtros activos'}
          </div>
        </div>
        <TaskFilters filters={filters} />
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {metricCard('Total visible', stats.total, 'resultado actual')}
        {metricCard('En progreso', stats.inProgress, 'trabajo activo')}
        {metricCard('En espera', stats.waiting, 'requieren seguimiento')}
        {metricCard('Concluidas', stats.done, 'historial reciente')}
        {metricCard('Prioridad alta', stats.highPriority, 'foco inmediato')}
      </div>

      {tasks.length ? null : (
        <Card className="rounded-[24px] border border-amber-200 bg-amber-50/70 px-4 py-4 text-sm text-amber-900">
          <div className="flex flex-wrap items-center gap-3">
            <FolderClock className="h-4 w-4" />
            No encontramos tareas para esta combinación. Prueba limpiando filtros o creando una nueva tarea.
          </div>
        </Card>
      )}

      <TaskWorkspace tasks={tasks.map((task) => ({
        id: task.id,
        title: task.title,
        status: task.status,
        priority: task.priority,
        client_name: task.client_name,
        due_date: task.due_date,
        project_id: task.project_id,
      }))} filters={filters} currentView={filters.view} currentQuery={queryString} />

      <Card className="rounded-[22px] border border-slate-200/90 bg-white/90 p-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-600">
            <ListChecks className="h-4 w-4 text-emerald-700" />
            Consejo: usa la vista lista para revisar rápido y la pizarra cuando necesites mover tareas visualmente.
          </div>
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">FlowTask · Client polish</span>
        </div>
      </Card>
    </div>
  );
}
