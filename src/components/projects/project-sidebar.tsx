import Link from 'next/link';
import { ArrowUpRight, FolderKanban } from 'lucide-react';
import { EntityMemoryActions } from '@/components/entities/entity-memory-actions';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/ui/status-badge';
import { asRoute, projectDetailRoute } from '@/lib/navigation/routes';

export function ProjectSidebar({
  projects,
  currentQuery = '',
}: {
  projects: Array<{ id: string; title: string; status?: string | null; client_name?: string | null; due_date?: string | null; updated_at?: string | null; created_at?: string | null }>;
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
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge value={project.status ?? 'activo'} />
                    <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-500">{project.client_name || 'Sin cliente'}</span>
                  </div>
                  <Link className="mt-3 block" href={asRoute(`${projectDetailRoute(project.id)}${suffix}`)}>
                    <p className="line-clamp-2 text-base font-semibold text-slate-800 transition hover:text-emerald-700">{project.title}</p>
                  </Link>
                </div>
                <EntityMemoryActions
                  entity={{
                    id: project.id,
                    type: 'project',
                    title: project.title,
                    subtitle: project.client_name || 'Proyecto',
                    href: projectDetailRoute(project.id),
                    updatedAt: project.updated_at || project.created_at || project.due_date || '1970-01-01T00:00:00.000Z',
                  }}
                  compact
                />
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-500">
                <span>{project.due_date || 'Sin fecha definida'}</span>
                <Link href={asRoute(`${projectDetailRoute(project.id)}${suffix}`)} className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                  Ver detalle
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))
        ) : (
          <EmptyState
            icon={<FolderKanban className="h-6 w-6" />}
            title="Aún no hay proyectos en esta vista"
            description="Prueba con otros filtros o crea un proyecto nuevo para empezar."
          />
        )}
      </div>
    </aside>
  );
}
