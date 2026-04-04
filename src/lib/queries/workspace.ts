import { createClient } from "@/lib/supabase/server";
import { cache } from "react";
import { getActiveMembership } from "@/lib/security/organization-access";

export interface WorkspaceContext {
  supabase: Awaited<ReturnType<typeof createClient>>;
  user: { id: string; email?: string | null } | null;
  activeOrganizationId: string | null;
  accountMode: "individual" | "team_owner" | "team_member" | null;
}

export const getWorkspaceContext = cache(async (): Promise<WorkspaceContext> => {
  const { supabase, user, membership } = await getActiveMembership();

  let accountMode: WorkspaceContext["accountMode"] = null;
  if (user) {
    const { data } = await supabase
      .from("user_account_modes")
      .select("account_mode")
      .eq("user_id", user.id)
      .maybeSingle();

    accountMode = (data?.account_mode as WorkspaceContext["accountMode"] | undefined) ?? null;
  }

  return {
    supabase,
    user,
    activeOrganizationId: membership?.organizationId ?? null,
    accountMode,
  };
});

export function applyWorkspaceScope<T extends { eq: (column: string, value: unknown) => T; or?: (filters: string) => T }>(query: T, userId: string, organizationId?: string | null) {
  if (organizationId) {
    if (typeof query.or === "function") {
      return query.or(`organization_id.eq.${organizationId},owner_id.eq.${userId}`);
    }
    return query.eq("organization_id", organizationId);
  }

  return query.eq("owner_id", userId);
}
