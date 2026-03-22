import Link from "next/link";
import { ProjectDeleteButton } from "@/components/projects/project-delete-button";
import { Card } from "@/components/ui/card";
import { EntityMemoryActions } from "@/components/entities/entity-memory-actions";
import { projectDetailRoute, projectEditRoute, projectListRoute } from "@/lib/navigation/routes";
import { formatDate } from "@/lib/utils/dates";

export function ProjectDetailSummary({ project, currentQuery = "" }: { project: any; currentQuery?: string }) {
  const department = Array.isArray(project.departments) ? project.departments[0] : project.departments;

  return (
    <Card>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <Link href={projectListRoute(currentQuery)} className="text-sm font-semibold text-slate-500 transition hover:text-slate-900">
            ← Volver al listado
          </Link>
          <p className="mt-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Proyecto</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">{project.title}</h1>
          <p className="mt-3 text-sm text-slate-600">{project.description || "Sin descripción todavía."}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <EntityMemoryActions entity={{ id: project.id, type: 'project', title: project.title, subtitle: project.client_name || "Proyecto", href: projectDetailRoute(project.id), updatedAt: new Date().toISOString() }} />
          <Link href={projectEditRoute(project.id, currentQuery)} className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50">
            Editar proyecto
          </Link>
          <ProjectDeleteButton projectId={project.id} />
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Estado</p>
          <p className="mt-1 font-medium text-slate-900">{project.status}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Cliente</p>
          <p className="mt-1 font-medium text-slate-900">{project.client_name || "No indicado"}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Departamento</p>
          <p className="mt-1 font-medium text-slate-900">{department?.name || "No indicado"}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Deadline</p>
          <p className="mt-1 font-medium text-slate-900">{project.due_date ? formatDate(project.due_date) : "Sin deadline"}</p>
        </div>
      </div>
    </Card>
  );
}
