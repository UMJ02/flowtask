import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export interface WorkspaceContext {
  supabase: Awaited<ReturnType<typeof createClient>>;
  user: User | null;
  activeOrganizationId: string | null;
}

export async function getWorkspaceContext(): Promise<WorkspaceContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null, activeOrganizationId: null };
  }

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })
    .limit(1)
    .maybeSingle();

  return {
    supabase,
    user,
    activeOrganizationId: membership?.organization_id ?? null,
  };
}

export function applyWorkspaceScope<T extends { eq: Function; or: Function }>(query: T, userId: string, organizationId?: string | null) {
  if (organizationId) {
    return query.or(`organization_id.eq.${organizationId},owner_id.eq.${userId}`);
  }

  return query.eq("owner_id", userId);
}
