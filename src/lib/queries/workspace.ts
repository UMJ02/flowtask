import { createClient } from "@/lib/supabase/server";
import { getActiveMembership } from "@/lib/security/organization-access";

export interface WorkspaceContext {
  supabase: Awaited<ReturnType<typeof createClient>>;
  user: { id: string; email?: string | null } | null;
  activeOrganizationId: string | null;
}

export async function getWorkspaceContext(): Promise<WorkspaceContext> {
  const { supabase, user, membership } = await getActiveMembership();

  return {
    supabase,
    user,
    activeOrganizationId: membership?.organizationId ?? null,
  };
}

export function applyWorkspaceScope<T extends { eq: Function; or: Function }>(query: T, userId: string, organizationId?: string | null) {
  if (organizationId) {
    return query.or(`organization_id.eq.${organizationId},owner_id.eq.${userId}`);
  }

  return query.eq("owner_id", userId);
}
