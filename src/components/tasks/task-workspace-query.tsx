"use client";

import { TaskWorkspace } from "@/components/tasks/task-workspace";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTasksQuery, type TaskQueryFilters } from "@/hooks/use-tasks-query";

export function TaskWorkspaceQuery({ filters }: { filters: TaskQueryFilters & { view?: string } }) {
  const { data = [], isLoading, isFetching, error } = useTasksQuery(filters);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card><Skeleton className="h-14 w-full" /></Card>
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return <Card><p className="text-sm text-rose-600">No se pudieron cargar las tareas. Intenta de nuevo.</p></Card>;
  }

  return (
    <div className="space-y-3">
      {isFetching ? <p className="text-xs font-medium text-slate-500">Actualizando vista…</p> : null}
      <TaskWorkspace tasks={data} filters={filters} />
    </div>
  );
}
