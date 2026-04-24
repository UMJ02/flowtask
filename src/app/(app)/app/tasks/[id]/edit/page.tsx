
export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { TaskForm } from '@/components/tasks/task-form';
import { getTaskById } from '@/lib/queries/tasks';
import { safeServerCall } from '@/lib/runtime/safe-server';

export default async function TaskEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const search = (await searchParams) ?? {};
  const queryString = new URLSearchParams(
    Object.entries(search).flatMap(([key, value]) => typeof value === 'string' && value ? [[key, value]] : [])
  ).toString();
  const task = await safeServerCall('getTaskById', () => getTaskById(id), null);
  if (!task) notFound();

  const department = Array.isArray(task.departments) ? task.departments[0] : task.departments;
  return (
    <div>
      <TaskForm
        taskId={task.id}
        redirectTo={queryString ? `/app/tasks/${task.id}?${queryString}` as any : `/app/tasks/${task.id}` as any}
        initialData={{
          title: task.title ?? '',
          description: task.description ?? '',
          status: task.status ?? 'en_proceso',
          priority: task.priority ?? 'media',
          department: department?.code ?? department?.name ?? '',
          clientName: task.client_name ?? '',
          dueDate: task.due_date ?? '',
          projectId: task.project_id ?? '',
          country: (task as any).country ?? '',
        }}
      />
    </div>
  );
}
