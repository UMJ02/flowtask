import Link from "next/link";
import { TaskCard } from "@/components/tasks/task-card";

export function TaskList({ tasks }: { tasks: Array<{ id: string; title: string; status: string; client_name?: string | null; due_date?: string | null }> }) {
  if (!tasks.length) {
    return <div className="rounded-[24px] bg-white p-5 text-sm text-slate-500 shadow-soft">Aún no hay tareas registradas.</div>;
  }

  return (
    <div className="grid gap-4">
      {tasks.map((task) => (
        <Link key={task.id} href={`/app/tasks/${task.id}`}>
          <TaskCard title={task.title} status={task.status} clientName={task.client_name} dueDate={task.due_date} />
        </Link>
      ))}
    </div>
  );
}
