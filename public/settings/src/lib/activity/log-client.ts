import type { SupabaseClient } from "@supabase/supabase-js";

type ActivityPayload = {
  entityType: string;
  entityId: string;
  action: string;
  metadata?: Record<string, unknown>;
};

function buildRelationalContext(payload: ActivityPayload) {
  const metadata = { ...(payload.metadata ?? {}) };
  const context: Record<string, string> = {};

  if (payload.entityType === "task") {
    metadata.task_id = metadata.task_id ?? payload.entityId;
    context.task_id = payload.entityId;
  }

  if (payload.entityType === "project") {
    metadata.project_id = metadata.project_id ?? payload.entityId;
    context.project_id = payload.entityId;
  }

  if (payload.entityType === "client") {
    metadata.client_id = metadata.client_id ?? payload.entityId;
    context.client_id = payload.entityId;
  }

  if (payload.entityType === "organization") {
    metadata.organization_id = metadata.organization_id ?? payload.entityId;
    context.organization_id = payload.entityId;
  }

  return { metadata, context };
}

export async function logActivity(supabase: SupabaseClient, payload: ActivityPayload) {
  const authClient = supabase.auth as any;
  const userResult = authClient.getUser ? await authClient.getUser() : await authClient.getSession?.();
  const user = userResult?.data?.user ?? userResult?.data?.session?.user ?? null;
  if (!user) return;

  const { metadata, context } = buildRelationalContext(payload);

  await supabase.from("activity_logs").insert({
    user_id: user.id,
    entity_type: payload.entityType,
    entity_id: payload.entityId,
    action: payload.action,
    metadata,
    ...context,
  });
}
