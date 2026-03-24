import Link from 'next/link';
import { FolderGit2, FolderKanban, Layers3, Users } from 'lucide-react';
import { CoreMetricStrip } from '@/components/core/core-metric-strip';
import { ProjectFilters } from '@/components/projects/project-filters';
import { ProjectSidebar } from '@/components/projects/project-sidebar';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { SectionHeader } from '@/components/ui/section-header';
import { FilterPresets } from '@/components/ui/filter-presets';
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
  const today = new Date().toISOString().slice(0, 10);

  type ProjectItem = Awaited<ReturnType<typeof getProjects>>[number];

  const activeCount = projects.filter((project: ProjectItem) => (project.status ?? "").toLowerCase() !== "completado").length;
  const dueSoonCount = projects.filter((project: ProjectItem) => Boolean(project.due_date) && String(project.due_date).slice(0, 10) <= today && (project.status ?? "").toLowerCase() !== "completado").length;
  const collaborativeCount = projects.filter((project: ProjectItem) => Boolean(project.is_collaborative)).length;
  const noClientCount = projects.filter((project: ProjectItem) => !project.client_name?.trim()).length;

  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="Trabajo en equipo"
        title="Proyectos"
        description="Agrupa tareas, responsables y fechas en un espacio claro para todos. Usa filtros rápidos y una navegación más predecible para entrar y salir sin perder contexto."
        badges={[
          { label: 'Portafolio claro', tone: 'stable' },
          { label: 'Filtros rápidos', tone: 'default' },
          { label: 'Fechas visibles', tone: 'attention' },
        ]}
        icon={<FolderKanban className="h-5 w-5" />}
        actions={
          <Link href={projectNewRoute()}>
            <Button>Nuevo proyecto</Button>
          </Link>
        }
      />

      <CoreMetricStrip
        eyebrow="Core hardening"
        title="Lectura rápida del portafolio"
        description="Esta capa deja la vista de proyectos más estable y más legible para tomar decisiones sin abrir cada detalle primero."
        items={[
          {
            label: 'Activos',
            value: activeCount,
            helper: 'Proyectos abiertos en la vista actual.',
            icon: <FolderKanban className="h-5 w-5" />,
            tone: activeCount ? 'stable' : 'default',
          },
          {
            label: 'Con presión',
            value: dueSoonCount,
            helper: 'Elementos con fecha cercana o vencida según este filtro.',
            icon: <Layers3 className="h-5 w-5" />,
            tone: dueSoonCount ? 'attention' : 'default',
          },
          {
            label: 'Colaborativos',
            value: collaborativeCount,
            helper: 'Proyectos compartidos entre varias personas.',
            icon: <Users className="h-5 w-5" />,
            tone: collaborativeCount ? 'stable' : 'default',
          },
          {
            label: 'Sin cliente',
            value: noClientCount,
            helper: 'Conviene limpiarlos para evitar huecos en reportes.',
            icon: <FolderGit2 className="h-5 w-5" />,
            tone: noClientCount ? 'attention' : 'default',
          },
        ]}
      />

      <ProjectFilters filters={filters} />
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
