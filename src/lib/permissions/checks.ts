import { createClient } from "@/lib/supabase/server";

export type FlowPermissionKey =
  | "tasks.create"
  | "tasks.edit"
  | "tasks.delete"
  | "projects.manage"
  | "clients.manage"
  | "team.invite"
  | "reports.view";

const roleFallbacks: Record<string, FlowPermissionKey[]> = {
  admin_global: ["tasks.create", "tasks.edit", "tasks.delete", "projects.manage", "clients.manage", "team.invite", "reports.view"],
  manager: ["tasks.create", "tasks.edit", "projects.manage", "clients.manage", "team.invite", "reports.view"],
  member: ["tasks.create", "tasks.edit"],
  viewer: ["reports.view"],
};

export async function canUser(permission: FlowPermissionKey, organizationId?: string | null) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  let membershipQuery = supabase
    .from("organization_members")
    .select("role")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })
    .limit(1);

  if (organizationId) {
    membershipQuery = membershipQuery.eq("organization_id", organizationId);
  }

  const { data: memberships, error: membershipError } = await membershipQuery;
  if (membershipError) return false;

  const membership = memberships?.[0];
  if (!membership?.role) return false;

  const role = membership.role as string;
  const fallback = roleFallbacks[role] ?? [];
  if (fallback.includes(permission)) return true;

  if (!organizationId) return false;
  const { data: templates } = await supabase
    .from("organization_role_templates")
    .select("id,name")
    .eq("organization_id", organizationId)
    .eq("name", role)
    .limit(1);
  const templateId = templates?.[0]?.id as string | undefined;
  if (!templateId) return false;

  const { data: permissionRows } = await supabase
    .from("organization_role_permissions")
    .select("permission_key")
    .eq("organization_id", organizationId)
    .eq("role_template_id", templateId)
    .eq("permission_key", permission)
    .limit(1);

  return (permissionRows?.length ?? 0) > 0;
}
