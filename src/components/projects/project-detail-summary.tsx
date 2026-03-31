import Link from "next/link";
import { BriefcaseBusiness, Sparkles } from "lucide-react";
import { ProjectDeleteButton } from "@/components/projects/project-delete-button";
import { Card } from "@/components/ui/card";
import { EntityMemoryActions } from "@/components/entities/entity-memory-actions";
import { projectDetailRoute, projectEditRoute, projectListRoute } from "@/lib/navigation/routes";
import { formatDate } from "@/lib/utils/dates";

export function ProjectDetailSummary({ project, currentQuery = "" }: { project: any; currentQuery?: string }) {
  const department = Array.isArray(project.departments) ? project.departments[0] : project.departments;

  return (
    <Card className="rounded-[30px] border border-slate-200/85 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)] md:p-6">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          <Link href={projectListRoute(currentQuery)} className="text-sm font-semibold text-slate-500 transition hover:text-slate-900">
            ← Volver al listado
          </Link>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
            <Sparkles className="h-3.5 w-3.5" />
            Resumen de proyecto
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">{project.title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{project.description || "Sin descripción todavía."}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{project.status}</span>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{project.client_name || "Sin cliente"}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:max-w-[320px] md:justify-end">
          <EntityMemoryActions entity={{ id: project.id, type: 'project', title: project.title, subtitle: project.client_name || "Proyecto", href: projectDetailRoute(project.id, currentQuery), updatedAt: project.updated_at || project.created_at || project.due_date || '1970-01-01T00:00:00.000Z' }} />
          <Link href={projectEditRoute(project.id, currentQuery)} className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:bg-slate-50">
            Editar proyecto
          </Link>
          <ProjectDeleteButton projectId={project.id} />
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[22px] bg-slate-50 px-4 py-4 text-sm text-slate-700">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Estado</p>
          <p className="mt-2 font-medium text-slate-900">{project.status}</p>
        </div>
        <div className="rounded-[22px] bg-slate-50 px-4 py-4 text-sm text-slate-700">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Cliente</p>
          <p className="mt-2 font-medium text-slate-900">{project.client_name || "No indicado"}</p>
        </div>
        <div className="rounded-[22px] bg-slate-50 px-4 py-4 text-sm text-slate-700">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Departamento</p>
          <p className="mt-2 font-medium text-slate-900">{department?.name || "No indicado"}</p>
        </div>
        <div className="rounded-[22px] bg-slate-50 px-4 py-4 text-sm text-slate-700">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Deadline</p>
          <p className="mt-2 inline-flex items-center gap-2 font-medium text-slate-900">
            <BriefcaseBusiness className="h-4 w-4 text-slate-400" />
            {project.due_date ? formatDate(project.due_date) : "Sin deadline"}
          </p>
        </div>
      </div>
    </Card>
  );
}
