import type { SupabaseClient } from "@supabase/supabase-js";

type ActivityPayload = {
  entityType: string;
  entityId: string;
  action: string;
  metadata?: Record<string, unknown>;
};

export async function logActivity(supabase: SupabaseClient, payload: ActivityPayload) {
  const authClient = supabase.auth as any;
  const userResult = authClient.getUser ? await authClient.getUser() : await authClient.getSession?.();
  const user = userResult?.data?.user ?? userResult?.data?.session?.user ?? null;
  if (!user) return;

  await supabase.from("activity_logs").insert({
    user_id: user.id,
    entity_type: payload.entityType,
    entity_id: payload.entityId,
    action: payload.action,
    metadata: payload.metadata ?? {},
  });
}
