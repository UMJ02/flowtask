import Link from 'next/link';
import { ProjectEditableList } from '@/components/projects/project-editable-list';
import { ProjectFilters } from '@/components/projects/project-filters';
import { Card } from '@/components/ui/card';
import { projectNewRoute } from '@/lib/navigation/routes';
import { getProjects } from '@/lib/queries/projects';
import { safeServerCall } from '@/lib/runtime/safe-server';

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

  return (
    <div className="space-y-4">
      <Card className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Proyectos</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Centro editable de proyectos</h1>
          <p className="mt-2 text-sm text-slate-500">Revisa el pipeline en una sola tarjeta y ajusta columnas sin cambiar de vista.</p>
        </div>
        <Link href={projectNewRoute()} className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-4 text-sm font-semibold text-white">Nuevo proyecto</Link>
      </Card>

      <ProjectFilters filters={filters} />

      <ProjectEditableList
        projects={projects.map((project) => ({
          id: project.id,
          title: project.title,
          status: project.status,
          client_name: project.client_name,
          due_date: project.due_date,
          departmentCode: project.departmentCode ?? null,
          is_collaborative: project.is_collaborative,
        }))}
      />
    </div>
  );
}
