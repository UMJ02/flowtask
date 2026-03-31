import Link from 'next/link';
import { TaskFilters } from '@/components/tasks/task-filters';
import { TaskWorkspace } from '@/components/tasks/task-workspace';
import { Card } from '@/components/ui/card';
import { taskNewRoute } from '@/lib/navigation/routes';
import { getTasks } from '@/lib/queries/tasks';
import { safeServerCall } from '@/lib/runtime/safe-server';

export default async function TasksPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const params = (await searchParams) ?? {};
  const filters = {
    q: typeof params.q === 'string' ? params.q : '',
    status: typeof params.status === 'string' ? params.status : '',
    department: typeof params.department === 'string' ? params.department : '',
    due: typeof params.due === 'string' ? params.due : '',
    view: typeof params.view === 'string' ? params.view : '',
  };
  const tasks = await safeServerCall('getTasks', () => getTasks(filters), []);

  return (
    <div className="space-y-4">
      <Card className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Tareas</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Workspace de tareas</h1>
          <p className="mt-2 text-sm text-slate-500">Filtra, abre detalle y mueve tu trabajo sin salir del módulo.</p>
        </div>
        <Link href={taskNewRoute()} className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-4 text-sm font-semibold text-white">
          Nueva tarea
        </Link>
      </Card>
      <TaskFilters filters={filters} />
      <TaskWorkspace tasks={tasks.map((task) => ({
        id: task.id,
        title: task.title,
        status: task.status,
        priority: task.priority,
        client_name: task.client_name,
        due_date: task.due_date,
      }))} filters={filters} currentView={filters.view} />
    </div>
  );
}
