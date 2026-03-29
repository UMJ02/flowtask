import Link from "next/link";
import { TaskDeleteButton } from "@/components/tasks/task-delete-button";
import { Card } from "@/components/ui/card";
import { EntityMemoryActions } from "@/components/entities/entity-memory-actions";
import { formatDate } from "@/lib/utils/dates";

export function TaskDetailSummary({ task }: { task: any }) {
  const department = Array.isArray(task.departments) ? task.departments[0] : task.departments;
  const project = Array.isArray(task.projects) ? task.projects[0] : task.projects;

  return (
    <Card>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Tarea</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">{task.title}</h1>
          <p className="mt-3 text-sm text-slate-600">{task.description || "Sin descripción todavía."}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <EntityMemoryActions entity={{ id: task.id, type: 'task', title: task.title, subtitle: task.client_name || "Tarea", href: `/app/tasks/${task.id}`, updatedAt: new Date().toISOString() }} />
          <Link href={`/app/tasks/${task.id}/edit`} className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50">
            Editar tarea
          </Link>
          <TaskDeleteButton taskId={task.id} />
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Estado</p>
          <p className="mt-1 font-medium text-slate-900">{task.status}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Prioridad</p>
          <p className="mt-1 font-medium text-slate-900">{task.priority}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Proyecto</p>
          <p className="mt-1 font-medium text-slate-900">{project?.title || "Tarea independiente"}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Cliente</p>
          <p className="mt-1 font-medium text-slate-900">{task.client_name || "No indicado"}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Departamento</p>
          <p className="mt-1 font-medium text-slate-900">{department?.name || "No indicado"}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Deadline</p>
          <p className="mt-1 font-medium text-slate-900">{task.due_date ? formatDate(task.due_date) : "Sin deadline"}</p>
        </div>
      </div>
    </Card>
  );
}
