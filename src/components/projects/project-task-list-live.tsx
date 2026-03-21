"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { ProjectTaskList } from "@/components/projects/project-task-list";
import { LiveIndicator } from "@/components/ui/live-indicator";
import { useProjectTasksRealtime } from "@/hooks/use-project-tasks-realtime";

export function ProjectTaskListLive({ projectId, tasks }: { projectId: string; tasks: any[] }) {
  const router = useRouter();
  const handleInvalidate = useCallback(() => {
    router.refresh();
  }, [router]);

  useProjectTasksRealtime(projectId, handleInvalidate);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <LiveIndicator label="Tareas del proyecto en vivo" />
        <p className="text-xs text-slate-500">Los cambios de estado y nuevas tareas se reflejan sin recargar manualmente.</p>
      </div>
      <ProjectTaskList tasks={tasks} />
    </div>
  );
}
