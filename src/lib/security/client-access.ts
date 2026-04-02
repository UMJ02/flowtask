export type EffectiveOrganizationRole = "admin_global" | "manager" | "member" | "viewer" | null;

export interface ClientAccessFlags {
  canView: boolean;
  canEdit: boolean;
  canManageMembers: boolean;
}

export interface ClientAccessSummary {
  role: EffectiveOrganizationRole;
  privileged: boolean;
  byClientId: Map<string, ClientAccessFlags>;
}

type SupabaseLike = {
  from: (table: string) => {
    select: (...args: any[]) => any;
  };
};

export async function getClientAccessSummary(
  supabase: SupabaseLike,
  userId: string,
  organizationId?: string | null,
): Promise<ClientAccessSummary> {
  if (!organizationId) {
    return { role: null, privileged: false, byClientId: new Map() };
  }

  const [{ data: memberships }, { data: permissions }] = await Promise.all([
    supabase
      .from("organization_members")
      .select("role")
      .eq("organization_id", organizationId)
      .eq("user_id", userId)
      .order("is_default", { ascending: false })
      .limit(1),
    supabase
      .from("client_permissions")
      .select("client_id, can_view, can_edit, can_manage_members")
      .eq("organization_id", organizationId)
      .eq("user_id", userId),
  ]);

  const role = ((memberships ?? [])[0]?.role as EffectiveOrganizationRole | undefined) ?? null;
  const privileged = role === "admin_global" || role === "manager";
  const byClientId = new Map<string, ClientAccessFlags>();

  for (const row of permissions ?? []) {
    const clientId = row.client_id as string | null | undefined;
    if (!clientId) continue;
    byClientId.set(clientId, {
      canView: Boolean(row.can_view),
      canEdit: Boolean(row.can_edit),
      canManageMembers: Boolean(row.can_manage_members),
    });
  }

  return { role, privileged, byClientId };
}

export function hasClientAccess(
  summary: ClientAccessSummary,
  clientId?: string | null,
  mode: "view" | "edit" | "manage_members" = "view",
) {
  if (!clientId) return true;
  if (summary.privileged) return true;
  const current = summary.byClientId.get(clientId);
  if (!current) return false;
  if (mode === "edit") return current.canEdit;
  if (mode === "manage_members") return current.canManageMembers;
  return current.canView || current.canEdit || current.canManageMembers;
}

export function filterRowsByClientAccess<T extends { client_id?: string | null }>(
  rows: T[],
  summary: ClientAccessSummary,
  mode: "view" | "edit" | "manage_members" = "view",
) {
  if (summary.privileged) return rows;
  return rows.filter((row) => hasClientAccess(summary, row.client_id ?? null, mode));
}
