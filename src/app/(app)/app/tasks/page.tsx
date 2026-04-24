export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { CheckCircle2, ClipboardList, Clock3, Flag, Hourglass, PlayCircle, Plus } from 'lucide-react';
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
    <Card className="rounded-[20px] border border-[#E5EAF1] bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)] md:p-5">
      <div className="flex items-center gap-4">
        <span className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-1 ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-[#64748B]">{label}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-[#0F172A]">{value}</p>
          <p className="mt-1 text-xs font-medium text-[#64748B]">{helper}</p>
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
      <Card className="rounded-[24px] border border-[#E5EAF1] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)] md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">Tareas</h1>
            <p className="mt-1 text-sm font-medium text-[#64748B]">Gestiona y organiza todas tus tareas en un solo lugar.</p>
          </div>
          <Link
            href={taskNewRoute(queryString)}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-[14px] bg-[#050B18] px-5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(5,11,24,0.16)] transition hover:-translate-y-0.5 hover:bg-slate-900"
          >
            <Plus className="h-4 w-4" />
            Nueva tarea
          </Link>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard label="Total visibles" value={stats.total} helper="Resultado actual" tone="violet" icon={ClipboardList} />
          <StatCard label="En progreso" value={stats.inProgress} helper="Trabajo activo" tone="sky" icon={PlayCircle} />
          <StatCard label="En espera" value={stats.waiting} helper="Requieren seguimiento" tone="amber" icon={Hourglass} />
          <StatCard label="Concluidas" value={stats.done} helper="Historial reciente" tone="emerald" icon={CheckCircle2} />
          <StatCard label="Prioridad alta" value={stats.highPriority} helper="Foco inmediato" tone="rose" icon={Flag} />
        </div>
      </Card>

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

      <Card className="rounded-[20px] border border-emerald-200/80 bg-emerald-50/80 p-4 shadow-none">
        <div className="flex items-center gap-3 text-sm font-medium text-emerald-900">
          <Clock3 className="h-4 w-4 shrink-0" />
          Consejo: usa los filtros y vistas rápidas para encontrar tus tareas más importantes y mantener el foco.
        </div>
      </Card>
    </div>
  );
}
