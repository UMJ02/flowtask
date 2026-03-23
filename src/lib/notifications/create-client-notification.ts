import type { SupabaseClient } from "@supabase/supabase-js";

type NotificationPayload = {
  userId: string;
  title: string;
  body?: string;
  kind?: "info" | "warning" | "success";
  entityType?: "task" | "project" | "comment" | "reminder";
  entityId?: string;
};

export async function createClientNotification(supabase: SupabaseClient, payload: NotificationPayload) {
  await supabase.from("notifications").insert({
    user_id: payload.userId,
    title: payload.title,
    body: payload.body ?? null,
    kind: payload.kind ?? "info",
    entity_type: payload.entityType ?? null,
    entity_id: payload.entityId ?? null,
  });
}
