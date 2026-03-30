import type { SupabaseClient } from "@supabase/supabase-js";

type ActivityPayload = {
  entityType: "task" | "project" | "comment" | "reminder";
  entityId: string;
  action: string;
  metadata?: Record<string, unknown>;
};

export async function logActivity(supabase: SupabaseClient, payload: ActivityPayload) {
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return;

  await supabase.from("activity_logs").insert({
    user_id: user.id,
    entity_type: payload.entityType,
    entity_id: payload.entityId,
    action: payload.action,
    metadata: payload.metadata ?? {},
  });
}
