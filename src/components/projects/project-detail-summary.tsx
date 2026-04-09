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
    <Card className="rounded-[34px] border border-slate-200/85 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)] md:p-6">
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-3">
          <Link href={projectListRoute(currentQuery)} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900" aria-label="Volver al listado">
            <span aria-hidden>←</span>
          </Link>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <EntityMemoryActions entity={{ id: project.id, type: 'project', title: project.title, subtitle: project.client_name || "Proyecto", href: projectDetailRoute(project.id, currentQuery), updatedAt: project.updated_at ?? project.created_at ?? project.due_date ?? '1970-01-01T00:00:00.000Z' }} compact />
            <button type="button" onClick={() => setDetailsOpen((value) => !value)} className="inline-flex h-12 items-center gap-2 rounded-[22px] border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              {detailsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              Ver detalles
            </button>
            <Link href={projectEditRoute(project.id, currentQuery)} className="inline-flex h-12 items-center justify-center rounded-[22px] border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-900 transition hover:bg-slate-50">Editar proyecto</Link>
            <ProjectDeleteButton projectId={project.id} compact />
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">{project.title}</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">{project.description || "Sin descripción todavía."}</p>
        </div>

        {detailsOpen ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[22px] bg-slate-50 px-4 py-4 text-sm text-slate-700">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Estado</p>
              <p className="mt-2 font-medium text-slate-900">{project.status?.replaceAll('_', ' ') || 'Sin estado'}</p>
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
              <p className="mt-2 inline-flex items-center gap-2 font-medium text-slate-900"><BriefcaseBusiness className="h-4 w-4 text-slate-400" />{project.due_date ? formatDate(project.due_date) : "Sin deadline"}</p>
            </div>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
