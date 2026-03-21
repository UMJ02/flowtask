import { createClient } from "@/lib/supabase/server";

export async function getOrganizationContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: memberships } = await supabase
    .from("organization_members")
    .select("id, role, is_default, organizations!inner ( id, name, slug )")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })
    .limit(20);

  const normalized = (memberships ?? []).map((row) => {
    const organization = Array.isArray(row.organizations) ? row.organizations[0] : row.organizations;
    return {
      id: organization?.id as string,
      name: organization?.name as string,
      slug: organization?.slug as string,
      role: row.role as "admin_global" | "manager" | "member" | "viewer",
      isDefault: row.is_default ?? false,
    };
  }).filter((item) => item.id && item.name);

  const activeOrganization = normalized[0] ?? null;

  const { data: clientPermissions } = activeOrganization
    ? await supabase
        .from("client_permissions")
        .select("can_view, can_edit, can_manage_members, clients!inner ( name )")
        .eq("organization_id", activeOrganization.id)
        .order("created_at", { ascending: false })
        .limit(8)
    : { data: [] as any[] };

  const permissionRows = (clientPermissions ?? []).map((row) => {
    const client = Array.isArray(row.clients) ? row.clients[0] : row.clients;
    return {
      clientName: client?.name ?? "Cliente",
      canView: row.can_view ?? false,
      canEdit: row.can_edit ?? false,
      canManageMembers: row.can_manage_members ?? false,
    };
  });

  return {
    activeOrganization,
    organizations: normalized,
    clientPermissions: permissionRows,
  };
}
