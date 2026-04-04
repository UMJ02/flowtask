import { createClient } from "@/lib/supabase/client";
import { filterRowsByClientAccess, getClientAccessSummary, hasClientAccess } from "@/lib/security/client-access";


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

export async function findWorkspaceClientId(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  organizationId: string | null,
  clientName?: string | null,
) {
  const normalized = clientName?.trim();
  if (!normalized) return null;

  let query = supabase.from("clients").select("id").ilike("name", normalized).limit(1);

  if (organizationId) {
    query = query.eq("organization_id", organizationId);
  } else {
    query = query.eq("account_owner_id", userId);
  }

  const { data } = await query.maybeSingle();
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

  const scopedRows = !organizationId ? ((data ?? []) as any[]) : filterRowsByClientAccess((data ?? []) as any[], access, mode);

  return scopedRows.map((item: any) => ({
    id: String(item.id),
    title: String(item.title ?? "Proyecto"),
    status: String(item.status ?? "activo"),
  }));
}
