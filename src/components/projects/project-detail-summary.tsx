"use client";

import Link from "next/link";
import { useState } from "react";
import { BriefcaseBusiness, ChevronDown, ChevronUp } from "lucide-react";
import { ProjectDeleteButton } from "@/components/projects/project-delete-button";
import { Card } from "@/components/ui/card";
import { EntityMemoryActions } from "@/components/entities/entity-memory-actions";
import { projectDetailRoute, projectEditRoute, projectListRoute } from "@/lib/navigation/routes";
import { formatDate } from "@/lib/utils/dates";

export function ProjectDetailSummary({ project, currentQuery = "" }: { project: any; currentQuery?: string }) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const department = Array.isArray(project.departments) ? project.departments[0] : project.departments;

  return (
    <Card className="ft-project-detail-panel">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <Link href={projectListRoute(currentQuery)} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900" aria-label="Volver al listado">
              <span aria-hidden>←</span> Volver al listado
            </Link>
            <h1 className="ft-heading-page mt-4">{project.title}</h1>
            <p className="ft-copy mt-3 max-w-3xl">{project.description || "Sin descripción todavía."}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:max-w-[520px] lg:justify-end">
            <EntityMemoryActions entity={{ id: project.id, type: 'project', title: project.title, subtitle: project.client_name || "Proyecto", href: projectDetailRoute(project.id, currentQuery), updatedAt: project.updated_at ?? project.created_at ?? project.due_date ?? '1970-01-01T00:00:00.000Z' }} />
            <ProjectDeleteButton projectId={project.id} />
            <Link href={projectEditRoute(project.id, currentQuery)} className="ft-project-action px-7">
              Editar proyecto
            </Link>
            <button
              type="button"
              onClick={() => setDetailsOpen((value) => !value)}
              className="ft-project-action"
            >
              {detailsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {detailsOpen ? "Ocultar detalles" : "Ver detalles"}
            </button>
          </div>
        </div>

        {detailsOpen ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="ft-card-muted px-4 py-4 text-sm text-slate-700">
              <p className="ft-kicker text-slate-500">Estado</p>
              <p className="mt-2 font-medium text-slate-900">{project.status?.replaceAll('_', ' ') || 'Sin estado'}</p>
            </div>
            <div className="ft-card-muted px-4 py-4 text-sm text-slate-700">
              <p className="ft-kicker text-slate-500">Cliente</p>
              <p className="mt-2 font-medium text-slate-900">{project.client_name || "No indicado"}</p>
            </div>
            <div className="ft-card-muted px-4 py-4 text-sm text-slate-700">
              <p className="ft-kicker text-slate-500">Departamento</p>
              <p className="mt-2 font-medium text-slate-900">{department?.name || "No indicado"}</p>
            </div>
            <div className="ft-card-muted px-4 py-4 text-sm text-slate-700">
              <p className="ft-kicker text-slate-500">Deadline</p>
              <p className="mt-2 inline-flex items-center gap-2 font-medium text-slate-900">
                <BriefcaseBusiness className="h-4 w-4 text-slate-400" />
                {project.due_date ? formatDate(project.due_date) : "Sin deadline"}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
