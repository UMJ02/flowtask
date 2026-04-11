import { createClient } from "@/lib/supabase/client";
import { filterRowsByClientAccess, getClientAccessSummary, hasClientAccess } from "@/lib/security/client-access";
import { DEPARTMENTS } from "@/lib/constants/departments";
import { COUNTRIES } from "@/lib/constants/countries";

export interface ClientWorkspaceContext {
  supabase: ReturnType<typeof createClient>;
  user: { id: string; email?: string | null } | null;
  activeOrganizationId: string | null;
  boardId: string | null;
  layoutConfig: Record<string, any>;
}

export type WorkspaceClientOption = { id: string; name: string };
export type WorkspaceDepartmentOption = { id: string; code: string; name: string; phone?: string | null };
export type WorkspaceCountryOption = { id: string; code: string; name: string };

export function slugifyWorkspaceValue(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
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

  const query = applyClientWorkspaceScope(
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

export async function fetchWorkspaceClientsDirectory(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  organizationId?: string | null,
) {
  let query = supabase.from('clients').select('id,name').order('name', { ascending: true }).limit(200);
  query = organizationId ? query.eq('organization_id', organizationId) : query.eq('account_owner_id', userId);
  const { data, error } = await query;
  if (error) return [] as WorkspaceClientOption[];
  return (data ?? []).map((item: any) => ({ id: String(item.id), name: String(item.name ?? '') })).filter((item: WorkspaceClientOption) => item.name);
}

export async function fetchWorkspaceDepartments(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  organizationId?: string | null,
) {
  try {
    const { data, error } = await supabase
      .from('departments')
      .select('id,code,name,phone,organization_id,account_owner_id')
      .order('name', { ascending: true });
    if (error) throw error;
    const rows = (data ?? []).filter((item: any) => {
      if (!organizationId) return !item.organization_id ? !item.account_owner_id || item.account_owner_id === userId : false;
      return !item.organization_id || item.organization_id === organizationId;
    });
    return rows.map((item: any) => ({ id: String(item.id), code: String(item.code), name: String(item.name), phone: (item.phone as string | null | undefined) ?? null })) as WorkspaceDepartmentOption[];
  } catch {
    return DEPARTMENTS.map((item) => ({ id: item.code, code: item.code, name: item.label, phone: null }));
  }
}

export async function fetchWorkspaceCountries(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  organizationId?: string | null,
) {
  try {
    const { data, error } = await supabase
      .from('countries')
      .select('id,code,name,organization_id,account_owner_id')
      .order('name', { ascending: true });
    if (error) throw error;
    const rows = (data ?? []).filter((item: any) => {
      if (!organizationId) return !item.organization_id ? !item.account_owner_id || item.account_owner_id === userId : false;
      return !item.organization_id || item.organization_id === organizationId;
    });
    return rows.map((item: any) => ({ id: String(item.id), code: String(item.code), name: String(item.name) })) as WorkspaceCountryOption[];
  } catch {
    return COUNTRIES.map((item) => ({ id: item.code, code: item.code, name: item.label }));
  }
}
