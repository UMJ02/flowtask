export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { BriefcaseBusiness, FolderOpenDot, Plus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ProjectSearchPanel } from '@/components/projects/project-search-panel';
import { projectDetailRoute, projectNewRoute } from '@/lib/navigation/routes';
import { getProjects } from '@/lib/queries/projects';
import { safeServerCall } from '@/lib/runtime/safe-server';
import { formatDate } from '@/lib/utils/dates';

function metricCard(label: string, value: number, helper: string) {
  return (
    <Card className="rounded-[22px] border border-slate-200 bg-white px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{helper}</p>
    </Card>
  );
}

export default async function ProjectsPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const params = (await searchParams) ?? {};
  const filters = {
    q: typeof params.q === 'string' ? params.q : '',
    status: typeof params.status === 'string' ? params.status : '',
    department: typeof params.department === 'string' ? params.department : '',
    mode: typeof params.mode === 'string' ? params.mode : '',
    client: typeof params.client === 'string' ? params.client : '',
  };
  const projects = await safeServerCall('getProjects', () => getProjects(filters), []);
  const queryString = new URLSearchParams(
    Object.entries(filters).flatMap(([key, value]) => (value ? [[key, value]] : [])),
  ).toString();

  const stats = {
    total: projects.length,
    active: projects.filter((project) => project.status === 'activo').length,
    paused: projects.filter((project) => project.status === 'en_pausa').length,
    collaborative: projects.filter((project) => project.is_collaborative).length,
  };

  return (
    <div className="space-y-4">
      <Card className="flex flex-col gap-4 rounded-[28px] md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Proyectos</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Frentes activos del workspace</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">Consulta estado, cliente, deadline y abre el detalle completo de cada frente sin perder el contexto de búsqueda.</p>
        </div>
        <Link href={projectNewRoute(queryString)} className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 text-sm font-semibold text-white">
          <Plus className="h-4 w-4" />
          Nuevo proyecto
        </Link>
      </Card>
      <ProjectSearchPanel filters={filters} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metricCard('Total visible', stats.total, 'resultado actual')}
        {metricCard('Activos', stats.active, 'frentes en marcha')}
        {metricCard('En pausa', stats.paused, 'requieren reactivación')}
        {metricCard('Colaborativos', stats.collaborative, 'trabajo compartido')}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {projects.length ? projects.map((project) => (
          <Link key={project.id} href={projectDetailRoute(project.id, queryString)} className="rounded-[24px] border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Proyecto</p>
                <h2 className="mt-2 text-xl font-bold text-slate-900">{project.title}</h2>
                <p className="mt-2 text-sm text-slate-500">{project.client_name || 'Sin cliente'} · {project.status}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{project.is_collaborative ? 'Colaborativo' : 'Solo owner'}</span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Deadline</p>
                <p className="mt-1 font-semibold text-slate-900">{project.due_date ? formatDate(project.due_date) : 'Sin fecha'}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Departamento</p>
                <p className="mt-1 font-semibold text-slate-900">{project.departmentName || 'No indicado'}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-slate-600"><BriefcaseBusiness className="h-3.5 w-3.5" /> Estado visible</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-slate-600"><Users className="h-3.5 w-3.5" /> {project.is_collaborative ? 'Equipo' : 'Individual'}</span>
            </div>
          </Link>
        )) : (
          <EmptyState
            icon={<FolderOpenDot className="h-6 w-6" />}
            title="No encontramos proyectos con este filtro"
            description="Puedes limpiar filtros para volver a ver todos los frentes o crear un proyecto nuevo para arrancar desde aquí."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Link href="/app/projects"><Button variant="secondary">Limpiar filtros</Button></Link>
                <Link href={projectNewRoute(queryString)}><Button>Nuevo proyecto</Button></Link>
              </div>
            }
          />
        )}
      </div>
    </div>
  );
}
