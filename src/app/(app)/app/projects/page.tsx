import Link from 'next/link';
import { FolderKanban } from 'lucide-react';
import { ProjectFilters } from '@/components/projects/project-filters';
import { ProjectSidebar } from '@/components/projects/project-sidebar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getProjects } from '@/lib/queries/projects';

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; status?: string; department?: string; mode?: string; client?: string }>;
}) {
  const filters = (await searchParams) ?? {};
  const projects = await getProjects(filters);
  const currentQuery = new URLSearchParams(Object.entries(filters).filter(([, value]) => typeof value === 'string' && value.length > 0) as [string, string][]).toString();

  return (
    <div className="space-y-4">
      <Card className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
            <FolderKanban className="h-4 w-4" />
            Trabajo en equipo
          </div>
          <h1 className="mt-3 text-2xl font-bold text-slate-900">Proyectos</h1>
          <p className="mt-1 text-sm text-slate-500">Agrupa tareas, responsables y fechas en un espacio claro para todos.</p>
        </div>
        <Link href="/app/projects/new">
          <Button>Nuevo proyecto</Button>
        </Link>
      </Card>
      <ProjectFilters filters={filters} />
      <ProjectSidebar currentQuery={currentQuery} projects={projects} />
    </div>
  );
}
