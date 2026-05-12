"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { createRealtimeChannel, removeRealtimeChannel } from "@/lib/realtime/channel";

export function useTaskCommentsRealtime(taskId: string, onInvalidate?: () => void) {
  useEffect(() => {
    if (!taskId || process.env.NEXT_PUBLIC_ENABLE_REALTIME === "false") return;

    const supabase = createClient();
    const channel = createRealtimeChannel(supabase, `task-comments-${taskId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
          filter: `task_id=eq.${taskId}`,
        },
        () => onInvalidate?.(),
      )
      .subscribe();

    return () => {
      removeRealtimeChannel(supabase, channel);
    };
  }, [taskId, onInvalidate]);
}
