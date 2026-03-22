import Link from 'next/link';
import { FolderKanban } from 'lucide-react';
import { ProjectFilters } from '@/components/projects/project-filters';
import { ProjectSidebar } from '@/components/projects/project-sidebar';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { SectionHeader } from '@/components/ui/section-header';
import { projectNewRoute } from '@/lib/navigation/routes';
import { getProjects } from '@/lib/queries/projects';
import { normalizeProjectFilters, toQueryString, type SearchParamsRecord } from '@/lib/runtime/search-params';

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParamsRecord>;
}) {
  const filters = normalizeProjectFilters((await searchParams) ?? {});
  const projects = await getProjects(filters);
  const currentQuery = toQueryString(filters);

  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="Trabajo en equipo"
        title="Proyectos"
        description="Agrupa tareas, responsables y fechas en un espacio claro para todos. Usa filtros rápidos y una navegación más predecible para entrar y salir sin perder contexto."
        icon={<FolderKanban className="h-5 w-5" />}
        actions={
          <Link href={projectNewRoute()}>
            <Button>Nuevo proyecto</Button>
          </Link>
        }
      />
      <ProjectFilters filters={filters} />
      {projects.length ? (
        <ProjectSidebar currentQuery={currentQuery} projects={projects} />
      ) : (
        <EmptyState
          icon={<FolderKanban className="h-6 w-6" />}
          title="No hay proyectos en esta vista"
          description="Prueba con otros filtros o crea un proyecto nuevo para empezar a organizar entregables, responsables y fechas."
          action={
            <Link href={projectNewRoute()}>
              <Button>Crear proyecto</Button>
            </Link>
          }
        />
      )}
    </div>
  );
}
