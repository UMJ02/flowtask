export const dynamic = 'force-dynamic';

import { Card } from '@/components/ui/card';
import { TaskForm } from '@/components/tasks/task-form';

export default async function TaskNewPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const search = (await searchParams) ?? {};
  const queryString = new URLSearchParams(
    Object.entries(search).flatMap(([key, value]) => typeof value === 'string' && value ? [[key, value]] : [])
  ).toString();

  const projectId = typeof search.projectId === 'string' ? search.projectId : '';
  const clientName = typeof search.clientName === 'string' ? search.clientName : '';

  return (
    <div className="space-y-4">
      <Card className="rounded-[28px] border border-slate-200/90 bg-white/[0.92] p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Nueva tarea</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Crear tarea</h1>
        <p className="mt-2 text-sm text-slate-500">Completa los datos básicos para dejar la tarea lista en el workspace.</p>
      </Card>
      <TaskForm
        initialData={{
          projectId,
          clientName,
        }}
        redirectTo={queryString ? `/app/tasks?${queryString}` as any : '/app/tasks'}
      />
    </div>
  );
}
