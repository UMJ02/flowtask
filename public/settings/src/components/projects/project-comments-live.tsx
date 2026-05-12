"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { ProjectComments } from "@/components/projects/project-comments";
import { LiveIndicator } from "@/components/ui/live-indicator";
import { useProjectCommentsRealtime } from "@/hooks/use-project-comments-realtime";

export function ProjectCommentsLive({ projectId, comments }: { projectId: string; comments: any[] }) {
  const router = useRouter();
  const handleInvalidate = useCallback(() => {
    router.refresh();
  }, [router]);

  useProjectCommentsRealtime(projectId, handleInvalidate);

  return (
    <div className="space-y-3">
      <LiveIndicator label="Comentarios en vivo" />
      <ProjectComments projectId={projectId} comments={comments} />
    </div>
  );
}
