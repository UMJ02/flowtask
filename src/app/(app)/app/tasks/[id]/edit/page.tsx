
export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { Card } from '@/components/ui/card';
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
    <div className="space-y-4">
      <Card className="rounded-[28px] border border-slate-200/90 bg-white/[0.92] p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Editar tarea</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">{task.title}</h1>
        <p className="mt-2 text-sm text-slate-500">Actualiza estado, deadline, relación con cliente o detalles operativos.</p>
      </Card>
      <TaskForm
        taskId={task.id}
        redirectTo={queryString ? `/app/tasks/${task.id}?${queryString}` as any : `/app/tasks/${task.id}` as any}
        initialData={{
          title: task.title ?? '',
          description: task.description ?? '',
          status: task.status ?? 'en_proceso',
          priority: task.priority ?? 'media',
          department: department?.code ?? '',
          clientName: task.client_name ?? '',
          dueDate: task.due_date ?? '',
          projectId: task.project_id ?? '',
          country: (task as any).country ?? '',
        }}
      />
    </div>
  );
}
