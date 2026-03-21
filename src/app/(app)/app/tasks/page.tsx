import Link from "next/link";
import { TaskFilters } from "@/components/tasks/task-filters";
import { TaskKanbanBoard } from "@/components/tasks/task-kanban-board";
import { TaskList } from "@/components/tasks/task-list";
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
      <TaskKanbanBoard tasks={tasks} />
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-900">Listado</h2>
        <TaskList tasks={tasks} />
      </div>
    </div>
  );
}
