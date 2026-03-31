import Link from 'next/link';
import { TaskEditableList } from '@/components/tasks/task-editable-list';
import { TaskFilters } from '@/components/tasks/task-filters';
import { Card } from '@/components/ui/card';
import { taskNewRoute } from '@/lib/navigation/routes';
import { getTasks } from '@/lib/queries/tasks';
import { getProjects } from '@/lib/queries/projects';
import { safeServerCall } from '@/lib/runtime/safe-server';

export default async function TasksPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const params = (await searchParams) ?? {};
  const filters = {
    q: typeof params.q === 'string' ? params.q : '',
    status: typeof params.status === 'string' ? params.status : '',
    department: typeof params.department === 'string' ? params.department : '',
    due: typeof params.due === 'string' ? params.due : '',
  };

  const [tasks, projectOptions] = await Promise.all([
    safeServerCall('getTasks', () => getTasks(filters), []),
    safeServerCall('getProjects', () => getProjects(), []),
  ]);

  return (
    <div className="space-y-4">
      <Card className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Tareas</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Centro editable de tareas</h1>
          <p className="mt-2 text-sm text-slate-500">Busca rápido, expande filtros solo cuando los necesites y edita cada fila en línea.</p>
        </div>
        <Link href={taskNewRoute()} className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-4 text-sm font-semibold text-white">
          Nueva tarea
        </Link>
      </Card>

      <TaskFilters filters={filters} />

      <TaskEditableList
        tasks={tasks.map((task) => ({
          id: task.id,
          title: task.title,
          status: task.status,
          priority: task.priority,
          client_name: task.client_name,
          due_date: task.due_date,
          departmentCode: task.departmentCode ?? null,
          project_id: task.project_id ?? null,
        }))}
        projectOptions={projectOptions.map((project) => ({ id: project.id, title: project.title }))}
      />
    </div>
  );
}
