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
  layoutConfig: Record<string, unknown>;
  workspaceKey: string;
}

export type WorkspaceClientOption = { id: string; name: string };
export type WorkspaceDepartmentOption = { id: string; code: string; name: string; phone?: string | null; isSystem?: boolean };
export type WorkspaceCountryOption = { id: string; code: string; name: string; isSystem?: boolean };

type CatalogRow = {
  id: string | number;
  code?: string | null;
  name?: string | null;
  phone?: string | null;
  organization_id?: string | null;
  account_owner_id?: string | null;
};

type RankedCatalogRow = CatalogRow & { __rank: number; __isSystem: boolean };

export function getWorkspaceScopeKey(userId?: string | null, organizationId?: string | null) {
  return organizationId ? `organization:${organizationId}` : `personal:${userId ?? "guest"}`;
}

function normalizeCatalogName(value: string) {
  return value.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function scopeRank(row: CatalogRow, userId: string, organizationId?: string | null) {
  if (organizationId && row.organization_id === organizationId) return 0;
  if (!organizationId && !row.organization_id && row.account_owner_id === userId) return 0;
  if (!row.organization_id && !row.account_owner_id) return 1;
  return 9;
}

function isSystemCatalogRow(row: CatalogRow) {
  return !row.organization_id && !row.account_owner_id;
}

function dedupeWorkspaceCatalog<T extends RankedCatalogRow>(rows: T[]) {
  const byName = new Map<string, T>();
  for (const row of rows) {
    const key = normalizeCatalogName(String(row.name ?? row.code ?? row.id));
    const current = byName.get(key);
    if (!current || row.__rank < current.__rank) byName.set(key, row);
  }
  return Array.from(byName.values()).sort((a, b) => String(a.name ?? "").localeCompare(String(b.name ?? ""), "es"));
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
    return { supabase, user: null, activeOrganizationId: null, boardId: null, layoutConfig: {}, workspaceKey: getWorkspaceScopeKey(null, null) };
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
        isDefault: Boolean(item.is_default),
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
    layoutConfig: (boardRes.data?.layout_config as Record<string, unknown> | null | undefined) ?? {},
    workspaceKey: getWorkspaceScopeKey(user.id, activeOrganizationId),
  };
}

export function applyClientWorkspaceScope<T extends { eq: (...args: any[]) => T; is: (...args: any[]) => T }>(query: T, userId: string, organizationId?: string | null): T {
  return organizationId ? query.eq("organization_id", organizationId) : query.eq("owner_id", userId).is("organization_id", null);
}

export async function findWorkspaceClientId(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  organizationId: string | null,
  clientName?: string | null,
) {
  const normalized = clientName?.trim();
  if (!normalized) return null;
  let query = supabase.from("clients").select("id,name,organization_id,account_owner_id").limit(120);
  query = organizationId ? query.eq("organization_id", organizationId) : query.eq("account_owner_id", userId).is("organization_id", null);
  const { data } = await query;
  const target = normalizeCatalogName(normalized);
  const match = ((data ?? []) as Array<{ id: string; name?: string | null }>).find((row) => normalizeCatalogName(String(row.name ?? "")) === target);
  return match?.id ?? null;
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
  return scopedRows.map((item: any) => ({ id: String(item.id), title: String(item.title ?? "Proyecto"), status: String(item.status ?? "activo") }));
}

export async function fetchWorkspaceClientsDirectory(supabase: ReturnType<typeof createClient>, userId: string, organizationId?: string | null) {
  let query = supabase.from("clients").select("id,name").order("name", { ascending: true }).limit(200);
  query = organizationId ? query.eq("organization_id", organizationId) : query.eq("account_owner_id", userId).is("organization_id", null);
  const { data, error } = await query;
  if (error) return [] as WorkspaceClientOption[];
  const byName = new Map<string, WorkspaceClientOption>();
  for (const item of data ?? []) {
    const name = String(item.name ?? "").trim();
    if (name) byName.set(normalizeCatalogName(name), { id: String(item.id), name });
  }
  return Array.from(byName.values()).sort((a, b) => a.name.localeCompare(b.name, "es"));
}

export async function fetchWorkspaceDepartments(supabase: ReturnType<typeof createClient>, userId: string, organizationId?: string | null) {
  try {
    const { data, error } = await supabase
      .from("departments")
      .select("id,code,name,phone,organization_id,account_owner_id")
      .order("name", { ascending: true });
    if (error) throw error;
    const rows = ((data ?? []) as CatalogRow[])
      .map<RankedCatalogRow>((item) => ({ ...item, __rank: scopeRank(item, userId, organizationId), __isSystem: isSystemCatalogRow(item) }))
      .filter((item) => item.__rank < 2);
    return dedupeWorkspaceCatalog(rows).map((item) => ({
      id: String(item.id),
      code: String(item.code ?? item.id),
      name: String(item.name ?? item.code ?? "Departamento"),
      phone: item.phone ?? null,
      isSystem: item.__isSystem,
    })) satisfies WorkspaceDepartmentOption[];
  } catch {
    return DEPARTMENTS.map((item) => ({ id: item.code, code: item.code, name: item.label, phone: null, isSystem: true }));
  }
}

export async function fetchWorkspaceCountries(supabase: ReturnType<typeof createClient>, userId: string, organizationId?: string | null) {
  try {
    const { data, error } = await supabase
      .from("countries")
      .select("id,code,name,organization_id,account_owner_id")
      .order("name", { ascending: true });
    if (error) throw error;
    const rows = ((data ?? []) as CatalogRow[])
      .map<RankedCatalogRow>((item) => ({ ...item, __rank: scopeRank(item, userId, organizationId), __isSystem: isSystemCatalogRow(item) }))
      .filter((item) => item.__rank < 2);
    return dedupeWorkspaceCatalog(rows).map((item) => ({
      id: String(item.id),
      code: String(item.code ?? item.id),
      name: String(item.name ?? item.code ?? "País"),
      isSystem: item.__isSystem,
    })) satisfies WorkspaceCountryOption[];
  } catch {
    return COUNTRIES.map((item) => ({ id: item.code, code: item.code, name: item.label, isSystem: true }));
  }
}
