import Link from "next/link";
import { ProjectFilters } from "@/components/projects/project-filters";
import { ProjectSidebar } from "@/components/projects/project-sidebar";
import { Button } from "@/components/ui/button";
import { getProjects } from "@/lib/queries/projects";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; status?: string; department?: string; mode?: string }>;
}) {
  const filters = (await searchParams) ?? {};
  const projects = await getProjects(filters);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-[24px] bg-white p-5 shadow-soft">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Proyectos</h1>
          <p className="text-sm text-slate-500">Visualiza los proyectos personales y colaborativos.</p>
        </div>
        <Link href="/app/projects/new">
          <Button>Nuevo proyecto</Button>
        </Link>
      </div>
      <ProjectFilters filters={filters} />
      <ProjectSidebar projects={projects} />
    </div>
  );
}
