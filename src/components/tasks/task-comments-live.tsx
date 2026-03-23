"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { TaskComments } from "@/components/tasks/task-comments";
import { LiveIndicator } from "@/components/ui/live-indicator";
import { useTaskCommentsRealtime } from "@/hooks/use-task-comments-realtime";

export function TaskCommentsLive({ taskId, comments }: { taskId: string; comments: any[] }) {
  const router = useRouter();
  const handleInvalidate = useCallback(() => {
    router.refresh();
  }, [router]);

  useTaskCommentsRealtime(taskId, handleInvalidate);

  return (
    <div className="space-y-3">
      <LiveIndicator label="Comentarios en vivo" />
      <TaskComments taskId={taskId} comments={comments} />
    </div>
  );
}
