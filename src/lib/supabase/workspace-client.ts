import { createClient } from "@/lib/supabase/client";
import { filterRowsByClientAccess, getClientAccessSummary, hasClientAccess } from "@/lib/security/client-access";


export interface ClientWorkspaceContext {
  supabase: ReturnType<typeof createClient>;
  user: { id: string; email?: string | null } | null;
  activeOrganizationId: string | null;
  accountMode: "individual" | "team_owner" | "team_member" | null;
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
      accountMode: null,
      boardId: null,
      layoutConfig: {},
    };
  }

  const [membershipRes, boardRes, accountModeRes] = await Promise.all([
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
    supabase
      .from("user_account_modes")
      .select("account_mode")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  return {
    supabase,
    user,
    activeOrganizationId: (membershipRes.data?.organization_id as string | null | undefined) ?? null,
    accountMode: (accountModeRes.data?.account_mode as ClientWorkspaceContext["accountMode"] | undefined) ?? null,
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


export async function fetchWorkspaceProjects(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  organizationId?: string | null,
  mode: "view" | "edit" = "view",
) {
  const access = await getClientAccessSummary(supabase as any, userId, organizationId);

  let query = applyClientWorkspaceScope(
    supabase
      .from("projects")
      .select("id,title,status,client_id")
      .neq("status", "completado")
      .order("title", { ascending: true }),
    userId,
    organizationId,
  );

  const { data, error } = await query;
  if (error) return [] as Array<{ id: string; title: string; status: string }>;

  return filterRowsByClientAccess((data ?? []) as any[], access, mode).map((item: any) => ({
    id: String(item.id),
    title: String(item.title ?? "Proyecto"),
    status: String(item.status ?? "activo"),
  }));
}
