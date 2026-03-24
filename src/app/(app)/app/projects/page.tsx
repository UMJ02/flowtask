import Link from 'next/link';
import { FolderKanban } from 'lucide-react';
import { ProjectFilters } from '@/components/projects/project-filters';
import { ProjectSidebar } from '@/components/projects/project-sidebar';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { SectionHeader } from '@/components/ui/section-header';
import { FilterPresets } from '@/components/ui/filter-presets';
import { ExpandableBar } from '@/components/ui/expandable-bar';
import { projectNewRoute } from '@/lib/navigation/routes';
import { getProjects } from '@/lib/queries/projects';
import { safeServerCall } from '@/lib/runtime/safe-server';
import { normalizeProjectFilters, toQueryString, type SearchParamsRecord } from '@/lib/runtime/search-params';

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParamsRecord>;
}) {
  const filters = normalizeProjectFilters((await searchParams) ?? {});
  const currentQuery = toQueryString(filters);
  const projects = await safeServerCall('getProjects', () => getProjects(filters), null as Awaited<ReturnType<typeof getProjects>> | null);

  if (projects === null) {
    return (
      <ErrorState
        title="No pudimos abrir proyectos"
        description="La consulta falló en esta carga. Puedes volver a intentar o ir directo al workspace mientras estabilizamos la conexión."
        action={
          <Link href="/app/dashboard">
            <Button>Ir al dashboard</Button>
          </Link>
        }
      />
    );
  }

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
      <ExpandableBar
        eyebrow="Buscar y filtrar"
        title="Refina la vista de proyectos"
        description="Abre esta barra para buscar por cliente, estado, área o tipo."
      >
        <ProjectFilters filters={filters} />
      </ExpandableBar>
      <FilterPresets
        storageKey="flowtask:filters:projects"
        basePath="/app/projects"
        currentQuery={currentQuery}
        title="Vistas rápidas de proyectos"
        emptyLabel="Reutiliza filtros por cliente, tipo y estado sin rehacer la consulta cada vez."
      />
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
