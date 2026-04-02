import { getAuthenticatedServerContext } from "@/lib/performance/server-cache";

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

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id, role, is_default")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })
    .limit(1)
    .maybeSingle();

  return {
    supabase,
    user,
    membership: membership
      ? {
          organizationId: membership.organization_id as string,
          role: membership.role as OrganizationRole,
          isDefault: !!membership.is_default,
        }
      : null,
  };
}
