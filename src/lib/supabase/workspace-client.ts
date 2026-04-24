import { createClient } from "@/lib/supabase/client";
import { filterRowsByClientAccess, getClientAccessSummary } from "@/lib/security/client-access";
import { DEPARTMENTS } from "@/lib/constants/departments";
import { COUNTRIES } from "@/lib/constants/countries";
import { PERSONAL_WORKSPACE_VALUE, parseWorkspaceCookieValue } from "@/lib/workspace/active-workspace";

export interface ClientWorkspaceContext {
  supabase: ReturnType<typeof createClient>;
  user: { id: string; email?: string | null } | null;
  activeOrganizationId: string | null;
  boardId: string | null;
  layoutConfig: Record<string, any>;
  workspaceKey: string;
}

export type WorkspaceClientOption = { id: string; name: string };
export type WorkspaceDepartmentOption = { id: string; code: string; name: string; phone?: string | null };
export type WorkspaceCountryOption = { id: string; code: string; name: string };

type CatalogScopeRow = {
  id: string | number;
  code: string | null;
  name: string | null;
  organization_id?: string | null;
  account_owner_id?: string | null;
  phone?: string | null;
};

type RankedCatalogRow = CatalogScopeRow & { __rank: number };

export function getWorkspaceScopeKey(userId?: string | null, organizationId?: string | null) {
  return organizationId ? `organization:${organizationId}` : `personal:${userId ?? "guest"}`;
}

function normalizeCatalogValue(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getCatalogScopeRank(row: CatalogScopeRow, userId: string, organizationId?: string | null): number {
  if (organizationId && row.organization_id === organizationId) return 0;
  if (!organizationId && !row.organization_id && row.account_owner_id === userId) return 0;
  if (!row.organization_id && !row.account_owner_id) return 1;
  return 9;
}

function dedupeCatalogByName<T extends { id: string; code: string; name: string; __rank: number }>(rows: T[]) {
  const byName = new Map<string, T>();
  for (const row of rows) {
    const key = normalizeCatalogValue(row.name);
    const current = byName.get(key);
    if (!current || row.__rank < current.__rank) byName.set(key, row);
  }
  return Array.from(byName.values())
    .map(({ __rank: _rank, ...row }) => row)
    .sort((a, b) => a.name.localeCompare(b.name, "es"));
}

export function slugifyWorkspaceValue(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
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
      workspaceKey: getWorkspaceScopeKey(null, null),
    };
  }

  const cookiePreference = typeof document !== "undefined" ? parseWorkspaceCookieValue(document.cookie) : null;

  const [membershipsRes, boardRes] = await Promise.all([
    supabase
      .from("organization_members")
      .select("organization_id, is_default, organizations!inner(deleted_at)")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false })
      .limit(20),
    supabase.from("boards").select("id, layout_config").eq("user_id", user.id).maybeSingle(),
  ]);

  const memberships = (membershipsRes.data ?? [])
    .map((item: any) => {
      const organization = Array.isArray(item.organizations) ? item.organizations[0] : item.organizations;
      return {
        organizationId: item.organization_id as string,
        isDefault: !!item.is_default,
        deletedAt: (organization?.deleted_at as string | null | undefined) ?? null,
      };
    })
    .filter((item: { deletedAt: string | null }) => !item.deletedAt);

  const defaultMembership = memberships[0] ?? null;
  const matchingMembership = cookiePreference && cookiePreference !== PERSONAL_WORKSPACE_VALUE
    ? memberships.find((item: { organizationId: string }) => item.organizationId === cookiePreference) ?? null
    : null;
  const activeOrganizationId = cookiePreference === PERSONAL_WORKSPACE_VALUE
    ? null
    : matchingMembership?.organizationId ?? defaultMembership?.organizationId ?? null;

  return {
    supabase,
    user,
    activeOrganizationId,
    boardId: (boardRes.data?.id as string | null | undefined) ?? null,
    layoutConfig: (boardRes.data?.layout_config as Record<string, any> | null | undefined) ?? {},
    workspaceKey: getWorkspaceScopeKey(user.id, activeOrganizationId),
  };
}

export function applyClientWorkspaceScope<T extends { eq: (...args: any[]) => T; is: (...args: any[]) => T }>(query: T, userId: string, organizationId?: string | null): T {
  if (organizationId) return query.eq("organization_id", organizationId);
  return query.eq("owner_id", userId).is("organization_id", null);
}

export async function findWorkspaceClientId(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  organizationId: string | null,
  clientName?: string | null,
) {
  const normalized = clientName?.trim();
  if (!normalized) return null;

  let query = supabase.from("clients").select("id,name,organization_id,account_owner_id").limit(100);
  query = organizationId ? query.eq("organization_id", organizationId) : query.eq("account_owner_id", userId).is("organization_id", null);

  const { data } = await query;
  const target = normalizeCatalogValue(normalized);
  const match = (data ?? []).find((row: any) => normalizeCatalogValue(String(row.name ?? "")) === target);
  return (match?.id as string | null | undefined) ?? null;
}

export async function fetchWorkspaceProjects(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  organizationId?: string | null,
  mode: "view" | "edit" = "view",
) {
  const access = await getClientAccessSummary(supabase as any, userId, organizationId);
  const query = applyClientWorkspaceScope(
    supabase.from("projects").select("id,title,status,client_id").neq("status", "completado").order("title", { ascending: true }),
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
  let query = supabase.from("clients").select("id,name").order("name", { ascending: true }).limit(200);
  query = organizationId ? query.eq("organization_id", organizationId) : query.eq("account_owner_id", userId).is("organization_id", null);
  const { data, error } = await query;
  if (error) return [] as WorkspaceClientOption[];

  const byName = new Map<string, WorkspaceClientOption>();
  for (const item of data ?? []) {
    const name = String(item.name ?? "").trim();
    if (name) byName.set(normalizeCatalogValue(name), { id: String(item.id), name });
  }
  return Array.from(byName.values()).sort((a, b) => a.name.localeCompare(b.name, "es"));
}

export async function fetchWorkspaceDepartments(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  organizationId?: string | null,
) {
  try {
    const { data, error } = await supabase
      .from("departments")
      .select("id,code,name,phone,organization_id,account_owner_id")
      .order("name", { ascending: true })
      .limit(300);
    if (error) throw error;

    const ranked = ((data ?? []) as CatalogScopeRow[])
      .map((item): RankedCatalogRow => ({ ...item, __rank: getCatalogScopeRank(item, userId, organizationId) }))
      .filter((item) => item.__rank < 2)
      .map((item) => ({
        id: String(item.id),
        code: String(item.code ?? ""),
        name: String(item.name ?? ""),
        phone: (item.phone as string | null | undefined) ?? null,
        __rank: item.__rank,
      }))
      .filter((item) => item.code && item.name);

    return dedupeCatalogByName(ranked) as WorkspaceDepartmentOption[];
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
      .from("countries")
      .select("id,code,name,organization_id,account_owner_id")
      .order("name", { ascending: true })
      .limit(300);
    if (error) throw error;

    const ranked = ((data ?? []) as CatalogScopeRow[])
      .map((item): RankedCatalogRow => ({ ...item, __rank: getCatalogScopeRank(item, userId, organizationId) }))
      .filter((item) => item.__rank < 2)
      .map((item) => ({
        id: String(item.id),
        code: String(item.code ?? ""),
        name: String(item.name ?? ""),
        __rank: item.__rank,
      }))
      .filter((item) => item.code && item.name);

    return dedupeCatalogByName(ranked) as WorkspaceCountryOption[];
  } catch {
    return COUNTRIES.map((item) => ({ id: item.code, code: item.code, name: item.label }));
  }
}
