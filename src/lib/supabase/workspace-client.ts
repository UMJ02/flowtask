import { createClient } from "@/lib/supabase/client";

export interface ClientWorkspaceContext {
  supabase: ReturnType<typeof createClient>;
  user: { id: string; email?: string | null } | null;
  activeOrganizationId: string | null;
  boardId: string | null;
  layoutConfig: Record<string, any>;
}

export async function getClientWorkspaceContext(): Promise<ClientWorkspaceContext> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      supabase,
      user: null,
      activeOrganizationId: null,
      boardId: null,
      layoutConfig: {},
    };
  }

  const [membershipRes, boardRes] = await Promise.all([
    supabase
      .from("organization_members")
      .select("organization_id, is_default")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("boards")
      .select("id, layout_config")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  return {
    supabase,
    user,
    activeOrganizationId: (membershipRes.data?.organization_id as string | null | undefined) ?? null,
    boardId: (boardRes.data?.id as string | null | undefined) ?? null,
    layoutConfig: (boardRes.data?.layout_config as Record<string, any> | null | undefined) ?? {},
  };
}

export function applyClientWorkspaceScope<T extends { eq: (...args: any[]) => T; or: (...args: any[]) => T }>(query: T, userId: string, organizationId?: string | null): T {
  if (organizationId) {
    return query.or(`organization_id.eq.${organizationId},owner_id.eq.${userId}`);
  }

  return query.eq("owner_id", userId);
}

export async function findOrganizationClientId(
  supabase: ReturnType<typeof createClient>,
  organizationId: string | null,
  clientName?: string | null,
) {
  const normalized = clientName?.trim();
  if (!organizationId || !normalized) return null;

  const { data } = await supabase
    .from("clients")
    .select("id")
    .eq("organization_id", organizationId)
    .ilike("name", normalized)
    .limit(1)
    .maybeSingle();

  return (data?.id as string | null | undefined) ?? null;
}
