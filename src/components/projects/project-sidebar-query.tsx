"use client";

import { ProjectSidebar } from "@/components/projects/project-sidebar";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjectsQuery, type ProjectQueryFilters } from "@/hooks/use-projects-query";

export function ProjectSidebarQuery({ filters, currentQuery }: { filters: ProjectQueryFilters; currentQuery: string }) {
  const { data = [], isLoading, isFetching, error } = useProjectsQuery(filters);

  if (isLoading) {
    return (
      <Card>
        <div className="space-y-3">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </Card>
    );
  }

  if (error) {
    return <Card><p className="text-sm text-rose-600">No se pudieron cargar los proyectos.</p></Card>;
  }

  return (
    <div className="space-y-3">
      {isFetching ? <p className="text-xs font-medium text-slate-500">Actualizando proyectos…</p> : null}
      <ProjectSidebar currentQuery={currentQuery} projects={data} />
    </div>
  );
}
