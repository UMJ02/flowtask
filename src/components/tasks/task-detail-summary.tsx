"use client";

import Link from "next/link";
import { MoreHorizontal, PencilLine } from "lucide-react";
import { EntityMemoryActions } from "@/components/entities/entity-memory-actions";
import { taskDetailRoute, taskEditRoute, taskListRoute } from "@/lib/navigation/routes";

function statusLabel(status?: string | null) {
  if (status === "concluido") return "Concluido";
  if (status === "en_espera") return "En espera";
  if (status === "pendiente") return "Pendiente";
  return "En progreso";
}

function statusTone(status?: string | null) {
  if (status === "concluido") return "border-emerald-100 bg-emerald-50 text-emerald-700";
  if (status === "en_espera") return "border-amber-100 bg-amber-50 text-amber-700";
  if (status === "pendiente") return "border-violet-100 bg-violet-50 text-violet-700";
  return "border-emerald-100 bg-emerald-50 text-emerald-700";
}

export function TaskDetailSummary({ task, currentQuery = "" }: { task: any; currentQuery?: string }) {
  const department = Array.isArray(task.departments) ? task.departments[0] : task.departments;
  const project = Array.isArray(task.projects) ? task.projects[0] : task.projects;

  return (
    <section className="rounded-[20px] border border-[#E5EAF1] bg-white px-5 py-5 sm:px-8 sm:py-7">
      <div className="flex flex-col gap-5">
        <Link href={taskListRoute(currentQuery)} className="inline-flex w-fit items-center gap-2 text-sm font-bold text-[#64748B] transition hover:text-[#0F172A]" aria-label="Volver al listado">
          <span aria-hidden>←</span> Volver al listado
        </Link>

        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="max-w-[980px] text-[28px] font-bold leading-[1.08] tracking-[-0.03em] text-[#0F172A] sm:text-[28px]">
                {task.title}
              </h1>
              <span className={`inline-flex h-7 shrink-0 items-center rounded-full border px-3 text-xs font-semibold ${statusTone(task.status)}`}>
                {statusLabel(task.status)}
              </span>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[#E5EAF1] bg-[#F8FAFC] px-3 py-1.5 text-xs font-bold text-[#64748B]">{project?.title || "Tarea independiente"}</span>
              <span className="rounded-full border border-[#E5EAF1] bg-[#F8FAFC] px-3 py-1.5 text-xs font-bold text-[#64748B]">{department?.name || "Sin departamento"}</span>
              {task.client_name ? <span className="rounded-full border border-[#E5EAF1] bg-[#F8FAFC] px-3 py-1.5 text-xs font-bold text-[#64748B]">{task.client_name}</span> : null}
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2 xl:justify-end">
            <EntityMemoryActions entity={{ id: task.id, type: 'task', title: task.title, subtitle: task.client_name || "Tarea", href: taskDetailRoute(task.id, currentQuery), updatedAt: task.updated_at ?? task.created_at ?? task.due_date ?? '1970-01-01T00:00:00.000Z' }} />
            <button type="button" aria-label="Más acciones" className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] border border-[#E5EAF1] bg-white text-[#0F172A] transition hover:bg-[#F8FAFC]"><MoreHorizontal className="h-4 w-4" /></button>
            <Link href={taskEditRoute(task.id, currentQuery)} className="inline-flex h-10 items-center justify-center gap-2 rounded-[16px] bg-[#050B18] px-4 text-[13px] font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#111827]">
              <PencilLine className="h-4 w-4" /> Editar tarea
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
