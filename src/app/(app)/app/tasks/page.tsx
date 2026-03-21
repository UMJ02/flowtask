import Link from "next/link";
import { TaskFilters } from "@/components/tasks/task-filters";
import { TaskWorkspace } from "@/components/tasks/task-workspace";
import { Button } from "@/components/ui/button";
import { getTasks } from "@/lib/queries/tasks";

export default async function TasksPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; status?: string; department?: string; due?: string }>;
}) {
  const filters = (await searchParams) ?? {};
  const tasks = await getTasks(filters);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-[24px] bg-white p-5 shadow-soft">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tareas</h1>
          <p className="text-sm text-slate-500">Gestiona tus pendientes, seguimiento y flujo Kanban.</p>
        </div>
        <Link href="/app/tasks/new">
          <Button>Nueva tarea</Button>
        </Link>
      </div>
      <TaskFilters filters={filters} />
      <TaskWorkspace tasks={tasks} />
    </div>
  );
}
