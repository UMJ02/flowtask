import { format } from "date-fns";
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


export async function getOrganizationInvites(organizationId?: string | null) {
  if (!organizationId) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("organization_invites")
    .select("id,email,role,status,created_at")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(8);

  return (data ?? []).map((row) => ({
    id: row.id as string,
    email: row.email as string,
    role: row.role as any,
    status: row.status as string,
    createdAtLabel: row.created_at ? format(new Date(row.created_at), "dd/MM/yyyy") : "-",
  }));
}

export async function getOrganizationMetrics(organizationId?: string | null) {
  if (!organizationId) return null;
  const supabase = await createClient();
  const [members, clients, activeProjects, openTasks, permissions] = await Promise.all([
    supabase.from("organization_members").select("role", { count: "exact" }).eq("organization_id", organizationId),
    supabase.from("clients").select("id", { count: "exact", head: true }).eq("organization_id", organizationId),
    supabase.from("projects").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).neq("status", "completado"),
    supabase.from("tasks").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).neq("status", "concluido"),
    supabase.from("client_permissions").select("can_edit, can_manage_members")
      .eq("organization_id", organizationId),
  ]);

  const roleBreakdown = { admin_global: 0, manager: 0, member: 0, viewer: 0 };
  for (const row of members.data ?? []) {
    const role = row.role as keyof typeof roleBreakdown;
    if (role in roleBreakdown) roleBreakdown[role] += 1;
  }

  const permissionRows = permissions.data ?? [];
  const editableClients = permissionRows.filter((row) => row.can_edit).length;
  const memberManagedClients = permissionRows.filter((row) => row.can_manage_members).length;
  const readOnlyClients = permissionRows.filter((row) => !row.can_edit).length;

  return {
    members: members.count ?? 0,
    clients: clients.count ?? 0,
    activeProjects: activeProjects.count ?? 0,
    openTasks: openTasks.count ?? 0,
    editableClients,
    memberManagedClients,
    readOnlyClients,
    roleBreakdown,
  };
}
