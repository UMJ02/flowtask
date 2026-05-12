export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { Archive, CheckCircle2, ClipboardList, Clock3, Flag, Hourglass, PlayCircle, Plus } from 'lucide-react';
import type { ComponentType } from 'react';
import { TaskSearchPanel } from '@/components/tasks/task-search-panel';
import { TaskWorkspace } from '@/components/tasks/task-workspace';
import { Card } from '@/components/ui/card';
import { taskNewRoute } from '@/lib/navigation/routes';
import { getTasks } from '@/lib/queries/tasks';
import { safeServerCall } from '@/lib/runtime/safe-server';

function StatCard({
  label,
  value,
  helper,
  tone,
  icon: Icon,
}: {
  label: string;
  value: number;
  helper: string;
  tone: 'violet' | 'sky' | 'amber' | 'emerald' | 'rose';
  icon: ComponentType<{ className?: string }>;
}) {
  const tones = {
    violet: 'bg-violet-50 text-violet-700 ring-violet-100',
    sky: 'bg-sky-50 text-sky-700 ring-sky-100',
    amber: 'bg-amber-50 text-amber-700 ring-amber-100',
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    rose: 'bg-rose-50 text-rose-700 ring-rose-100',
  } as const;

  return (
    <Card className="ft-apple-card p-4 md:p-5">
      <div className="flex items-center gap-4">
        <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ring-1 ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold ft-text-muted">{label}</p>
          <p className="mt-1 text-xl font-bold tracking-tight ft-text-main">{value}</p>
          <p className="mt-1 text-xs font-medium ft-text-muted">{helper}</p>
        </div>
      </div>
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
    view: typeof params.view === 'string' ? params.view : 'list',
    includeCompleted: typeof params.includeCompleted === 'string' ? params.includeCompleted : '',
  };
  const tasks = await safeServerCall('getTasks', () => getTasks(filters), []);
  const concludedTasks = await safeServerCall('getConcludedTasks', () => getTasks({ status: 'concluido' }), []);
  const queryString = new URLSearchParams(
    Object.entries(filters).flatMap(([key, value]) => (value ? [[key, value]] : [])),
  ).toString();

  const stats = {
    total: tasks.length,
    inProgress: tasks.filter((task) => task.status === 'en_proceso').length,
    waiting: tasks.filter((task) => task.status === 'en_espera').length,
    hiddenDone: concludedTasks.length,
    done: tasks.filter((task) => task.status === 'concluido').length,
    highPriority: tasks.filter((task) => task.priority === 'alta').length,
  };

  return (
    <div className="ft-governed-screen ft-app-bg rounded-3xl p-1">
      <Card className="ft-apple-panel p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="ft-page-title">Tareas</h1>
            <p className="ft-page-subtitle">Gestiona todas las tareas del workspace. Las concluidas se ocultan por defecto para no ensuciar la operación diaria.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/app/tasks/trash"
              className="ft-apple-button ft-apple-button-secondary"
            >
              <Archive className="h-4 w-4" />
              Papelera
            </Link>
            <Link
              href={taskNewRoute(queryString)}
              className="ft-apple-button ft-apple-button-primary"
            >
              <Plus className="h-4 w-4" />
              Nueva tarea
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard label="Tareas visibles" value={stats.total} helper="Sin concluidas por defecto" tone="violet" icon={ClipboardList} />
          <StatCard label="En progreso" value={stats.inProgress} helper="Trabajo activo" tone="sky" icon={PlayCircle} />
          <StatCard label="En espera" value={stats.waiting} helper="Standby sin vencimiento" tone="amber" icon={Hourglass} />
          <StatCard label="Concluidas ocultas" value={stats.hiddenDone} helper="No impactan atraso" tone="emerald" icon={CheckCircle2} />
          <StatCard label="Prioridad alta" value={stats.highPriority} helper="Foco inmediato" tone="rose" icon={Flag} />
        </div>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Link href="/app/tasks?status=concluido" className="inline-flex h-10 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-4 text-sm font-bold text-emerald-800 transition hover:bg-emerald-100">Ver concluidas / reactivar</Link>
        {filters.status === 'concluido' ? <Link href="/app/tasks" className="inline-flex h-10 items-center justify-center rounded-xl border ft-border bg-white px-4 text-sm font-bold text-[#334155] transition hover:bg-slate-50">Volver a operativas</Link> : null}
      </div>

      <TaskWorkspace searchPanel={<TaskSearchPanel filters={filters} />} tasks={tasks.map((task) => ({
        id: task.id,
        title: task.title,
        status: task.status,
        priority: task.priority,
        client_name: task.client_name,
        due_date: task.due_date,
        project_id: task.project_id,
        updated_at: task.updated_at,
        created_at: task.created_at,
      }))} filters={filters} currentView={filters.view} currentQuery={queryString} />

      <Card className="ft-mini-card border-emerald-200 bg-emerald-50/80 shadow-none">
        <div className="flex items-center gap-3 text-sm font-medium text-emerald-900">
          <Clock3 className="h-4 w-4 shrink-0" />
          Consejo: esta vista muestra todas las tareas del workspace y oculta concluidas por defecto. Usa el botón de concluidas si necesitás revisar o reactivar historial.
        </div>
      </Card>
    </div>
  );
}
