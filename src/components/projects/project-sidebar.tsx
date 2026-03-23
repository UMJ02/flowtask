import Link from 'next/link';
import { ArrowUpRight, FolderKanban } from 'lucide-react';
import { EntityMemoryActions } from '@/components/entities/entity-memory-actions';

export function ProjectSidebar({
  projects,
  currentQuery = '',
}: {
  projects: Array<{ id: string; title: string; status?: string | null; client_name?: string | null; due_date?: string | null }>;
  currentQuery?: string;
}) {
  const suffix = currentQuery ? `?${currentQuery}` : '';

  return (
    <aside className="rounded-[24px] bg-white p-5 shadow-soft">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600">
          <FolderKanban className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Proyectos</h2>
          <p className="text-sm text-slate-500">Abre los más importantes y guárdalos para volver rápido.</p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {projects.length ? (
          projects.map((project) => (
            <div key={project.id} className="rounded-3xl border border-slate-100 bg-slate-50 px-4 py-4 transition hover:border-emerald-200 hover:bg-emerald-50/50">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <Link className="block" href={`/app/projects/${project.id}${suffix}`}>
                    <p className="line-clamp-2 text-sm font-semibold text-slate-800 transition hover:text-emerald-700">{project.title}</p>
                  </Link>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                    <span className="rounded-full bg-white px-3 py-1">{project.status || 'activo'}</span>
                    <span className="rounded-full bg-white px-3 py-1">{project.client_name || 'Sin cliente'}</span>
                  </div>
                </div>
                <EntityMemoryActions
                  entity={{
                    id: project.id,
                    type: 'project',
                    title: project.title,
                    subtitle: project.client_name || 'Proyecto',
                    href: `/app/projects/${project.id}`,
                    updatedAt: new Date().toISOString(),
                  }}
                  compact
                />
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-500">
                <span>{project.due_date || 'Sin fecha definida'}</span>
                <Link href={`/app/projects/${project.id}${suffix}`} className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                  Ver
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 px-5 py-10 text-center">
            <h3 className="text-base font-semibold text-slate-900">Aún no hay proyectos en esta vista</h3>
            <p className="mt-2 text-sm text-slate-500">Prueba con otros filtros o crea un proyecto nuevo para empezar.</p>
          </div>
        )}
      </div>
    </aside>
  );
}
