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

export function applyWorkspaceScope<T extends { eq: (column: string, value: unknown) => T }>(query: T, _userId: string, organizationId?: string | null) {
  if (organizationId) {
    return query.eq("organization_id", organizationId);
  }

  return query;
}
