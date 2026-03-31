import { notFound } from 'next/navigation';
import { TaskForm } from '@/components/tasks/task-form';
import { Card } from '@/components/ui/card';
import { taskDetailRoute } from '@/lib/navigation/routes';
import { getTaskById } from '@/lib/queries/tasks';
import { safeServerCall } from '@/lib/runtime/safe-server';

export default async function EditTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const task = await safeServerCall('getTaskById', () => getTaskById(id), null);
  if (!task) notFound();
  const department = Array.isArray(task.departments) ? task.departments[0] : task.departments;

  return (
    <div className="space-y-4">
      <Card>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Editar tarea</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">{task.title}</h1>
      </Card>
      <TaskForm
        taskId={id}
        redirectTo={taskDetailRoute(id)}
        initialData={{
          title: task.title,
          description: task.description ?? '',
          status: task.status,
          department: department?.code ?? '',
          clientName: task.client_name ?? '',
          dueDate: task.due_date ?? '',
          priority: task.priority ?? 'media',
          projectId: task.project_id ?? '',
        }}
      />
    </div>
  );
}
