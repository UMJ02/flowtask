export const dynamic = 'force-dynamic';

import { TaskForm } from '@/components/tasks/task-form';

export default async function TaskNewPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const search = (await searchParams) ?? {};
  const queryString = new URLSearchParams(
    Object.entries(search).flatMap(([key, value]) => {
      if (key === 'projectId') return [];
      return typeof value === 'string' && value ? [[key, value]] : [];
    })
  ).toString();

  return (
    <div>
      <TaskForm
        initialData={{}}
        submitLabel={undefined}
        redirectTo={queryString ? `/app/tasks?${queryString}` as any : '/app/tasks'}
      />
    </div>
  );
}
