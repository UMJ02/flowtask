import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { TaskFilters } from '@/components/tasks/task-filters';
import { TaskWorkspace } from '@/components/tasks/task-workspace';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getTasks } from '@/lib/queries/tasks';

export default async function TasksPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; status?: string; department?: string; due?: string; view?: string }>;
}) {
  const filters = (await searchParams) ?? {};
  const tasks = await getTasks(filters);

  return (
    <div className="space-y-4">
      <Card className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
            <Sparkles className="h-4 w-4" />
            Seguimiento simple
          </div>
          <h1 className="mt-3 text-2xl font-bold text-slate-900">Tareas</h1>
          <p className="mt-1 text-sm text-slate-500">Busca, filtra y actualiza pendientes sin perder tiempo. Puedes usar vista lista o tablero.</p>
        </div>
        <Link href="/app/tasks/new">
          <Button>Nueva tarea</Button>
        </Link>
      </Card>
      <TaskFilters filters={filters} />
      <TaskWorkspace tasks={tasks} filters={filters} />
    </div>
  );
}
