import { cookies } from "next/headers";
import { getAuthenticatedServerContext } from "@/lib/performance/server-cache";
import { ACTIVE_WORKSPACE_COOKIE, PERSONAL_WORKSPACE_VALUE, normalizeWorkspacePreference } from "@/lib/workspace/active-workspace";

export const MANAGE_ORG_ROLES = ["admin_global", "manager"] as const;
export const ADMIN_ONLY_ROLES = ["admin_global"] as const;
export type OrganizationRole = "admin_global" | "manager" | "member" | "viewer";

export interface ActiveMembershipSummary {
  organizationId: string;
  role: OrganizationRole;
  isDefault: boolean;
}

export interface OrganizationAccessSummary {
  role: OrganizationRole | null;
  canManageInvites: boolean;
  canManageRoles: boolean;
  canManageClientPermissions: boolean;
  canViewSensitiveOrganizationData: boolean;
}

export function deriveOrganizationAccess(role: OrganizationRole | null): OrganizationAccessSummary {
  const canManage = role === "admin_global" || role === "manager";
  const canManageRoles = role === "admin_global";
  return {
    role,
    canManageInvites: canManage,
    canManageRoles,
    canManageClientPermissions: canManage,
    canViewSensitiveOrganizationData: canManage,
  };
}

export async function getActiveMembership() {
  const { supabase, user } = await getAuthenticatedServerContext();

  if (!user) {
    return { supabase, user: null, membership: null };
  }

  const cookieStore = await cookies();
  const preference = normalizeWorkspacePreference(cookieStore.get(ACTIVE_WORKSPACE_COOKIE)?.value ?? null);

  const { data: memberships } = await supabase
    .from("organization_members")
    .select("organization_id, role, is_default, organizations!inner(deleted_at)")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })
    .limit(20);

  const normalizedMemberships = (memberships ?? []).map((membership: any) => {
    const organization = Array.isArray(membership.organizations) ? membership.organizations[0] : membership.organizations;
    return {
      organizationId: membership.organization_id as string,
      role: membership.role as OrganizationRole,
      isDefault: !!membership.is_default,
      deletedAt: (organization?.deleted_at as string | null | undefined) ?? null,
    };
  }).filter((membership: any) => !membership.deletedAt);

  const fallbackMembership = normalizedMemberships[0] ?? null;
  const matchingMembership = preference && preference !== PERSONAL_WORKSPACE_VALUE
    ? normalizedMemberships.find((membership: ActiveMembershipSummary & { deletedAt?: string | null }) => membership.organizationId === preference) ?? null
    : null;

  return {
    supabase,
    user,
    membership: preference === PERSONAL_WORKSPACE_VALUE ? null : (matchingMembership ?? fallbackMembership),
  };
}
