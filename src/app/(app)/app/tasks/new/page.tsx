export const dynamic = 'force-dynamic';

import { TaskForm } from '@/components/tasks/task-form';

export default async function TaskNewPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const search = (await searchParams) ?? {};
  const queryString = new URLSearchParams(
    Object.entries(search).flatMap(([key, value]) => typeof value === 'string' && value ? [[key, value]] : [])
  ).toString();

  const projectId = typeof search.projectId === 'string' ? search.projectId : '';
  const clientName = typeof search.clientName === 'string' ? search.clientName : '';

  return (
    <div>
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
