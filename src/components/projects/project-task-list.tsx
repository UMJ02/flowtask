import Link from "next/link";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils/dates";

export function ProjectTaskList({ tasks }: { tasks: any[] }) {
  return (
    <Card>
      <h3 className="text-lg font-semibold text-slate-900">Tareas vinculadas</h3>
      <p className="mt-1 text-sm text-slate-500">Control de tareas relacionadas con este proyecto.</p>
      <div className="mt-4 space-y-3">
        {tasks.length ? tasks.map((task) => (
          <Link key={task.id} href={`/app/tasks/${task.id}`} className="block rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-100">
            <p className="font-medium text-slate-900">{task.title}</p>
            <p className="mt-1">Estado: {task.status}</p>
            <p>Prioridad: {task.priority}</p>
            <p>Cliente: {task.client_name || "No indicado"}</p>
            <p>Deadline: {task.due_date ? formatDate(task.due_date) : "Sin deadline"}</p>
          </Link>
        )) : <p className="text-sm text-slate-500">Todavía no hay tareas asociadas a este proyecto.</p>}
      </div>
    </Card>
  );
}
