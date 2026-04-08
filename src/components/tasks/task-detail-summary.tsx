"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ChevronDown, ChevronUp, Layers3 } from "lucide-react";
import { TaskDeleteButton } from "@/components/tasks/task-delete-button";
import { Card } from "@/components/ui/card";
import { EntityMemoryActions } from "@/components/entities/entity-memory-actions";
import { formatDate } from "@/lib/utils/dates";
import { taskDetailRoute, taskEditRoute, taskListRoute } from "@/lib/navigation/routes";

function priorityLabel(priority?: string | null) {
  if (priority === "alta") return "Prioridad alta";
  if (priority === "baja") return "Prioridad baja";
  return "Prioridad media";
}

export function TaskDetailSummary({ task, currentQuery = "" }: { task: any; currentQuery?: string }) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const department = Array.isArray(task.departments) ? task.departments[0] : task.departments;
  const project = Array.isArray(task.projects) ? task.projects[0] : task.projects;

  return (
    <Card className="rounded-[32px] border border-slate-200/85 bg-white/[0.97] p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)] md:p-6">
      <div className="space-y-5">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0 flex-1">
            <Link
              href={taskListRoute(currentQuery)}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
              aria-label="Volver al listado"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al listado
            </Link>

            <h1 className="mt-5 text-[2rem] font-bold tracking-tight text-slate-950 md:text-[2.6rem]">{task.title}</h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">{task.description || "Sin descripción todavía."}</p>
          </div>

          <div className="flex w-full flex-col gap-3 xl:w-auto xl:min-w-[470px] xl:items-end">
            <div className="flex flex-wrap items-center gap-2 xl:justify-end">
              <EntityMemoryActions
                entity={{
                  id: task.id,
                  type: 'task',
                  title: task.title,
                  subtitle: task.client_name || "Tarea",
                  href: taskDetailRoute(task.id, currentQuery),
                  updatedAt: task.updated_at ?? task.created_at ?? task.due_date ?? '1970-01-01T00:00:00.000Z'
                }}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 xl:justify-end">
              <TaskDeleteButton taskId={task.id} compact />
              <Link
                href={taskEditRoute(task.id, currentQuery)}
                className="inline-flex h-12 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Editar tarea
              </Link>
              <button
                type="button"
                onClick={() => setDetailsOpen((value) => !value)}
                className="inline-flex h-12 items-center gap-2 rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                {detailsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                {detailsOpen ? "Ocultar detalles" : "Ver detalles"}
              </button>
            </div>
          </div>
        </div>

        {detailsOpen ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-[22px] bg-slate-50 px-4 py-4 text-sm text-slate-700">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Estado</p>
              <p className="mt-2 font-medium text-slate-900">{task.status?.replaceAll('_', ' ') || 'Sin estado'}</p>
            </div>
            <div className="rounded-[22px] bg-slate-50 px-4 py-4 text-sm text-slate-700">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Prioridad</p>
              <p className="mt-2 font-medium text-slate-900">{priorityLabel(task.priority)}</p>
            </div>
            <div className="rounded-[22px] bg-slate-50 px-4 py-4 text-sm text-slate-700">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Proyecto</p>
              <p className="mt-2 font-medium text-slate-900">{project?.title || "Tarea independiente"}</p>
            </div>
            <div className="rounded-[22px] bg-slate-50 px-4 py-4 text-sm text-slate-700">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Cliente</p>
              <p className="mt-2 font-medium text-slate-900">{task.client_name || "No indicado"}</p>
            </div>
            <div className="rounded-[22px] bg-slate-50 px-4 py-4 text-sm text-slate-700">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Departamento</p>
              <p className="mt-2 font-medium text-slate-900">{department?.name || "No indicado"}</p>
            </div>
            <div className="rounded-[22px] bg-slate-50 px-4 py-4 text-sm text-slate-700">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Deadline</p>
              <p className="mt-2 inline-flex items-center gap-2 font-medium text-slate-900">
                <Layers3 className="h-4 w-4 text-slate-400" />
                {task.due_date ? formatDate(task.due_date) : "Sin deadline"}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
