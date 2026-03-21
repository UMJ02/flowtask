"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { createRealtimeChannel, removeRealtimeChannel } from "@/lib/realtime/channel";

export function useProjectCommentsRealtime(projectId: string, onInvalidate?: () => void) {
  useEffect(() => {
    if (!projectId || process.env.NEXT_PUBLIC_ENABLE_REALTIME === "false") return;

    const supabase = createClient();
    const channel = createRealtimeChannel(supabase, `project-comments-${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
          filter: `project_id=eq.${projectId}`,
        },
        () => onInvalidate?.(),
      )
      .subscribe();

    return () => {
      removeRealtimeChannel(supabase, channel);
    };
  }, [projectId, onInvalidate]);
}
