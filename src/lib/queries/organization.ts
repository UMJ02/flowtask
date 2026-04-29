import { cookies } from "next/headers";
import { format } from "date-fns";
import { getAuthenticatedServerContext, getServerClientCached } from "@/lib/performance/server-cache";
import { deriveOrganizationAccess } from "@/lib/security/organization-access";
import { ACTIVE_WORKSPACE_COOKIE, PERSONAL_WORKSPACE_VALUE, normalizeWorkspacePreference } from "@/lib/workspace/active-workspace";

export async function getOrganizationContext() {
  const { supabase, user } = await getAuthenticatedServerContext();

  if (!user) return null;

  const { data: memberships } = await supabase
    .from("organization_members")
    .select("id, role, is_default, organizations!inner ( id, name, slug, owner_id, deleted_at, purge_scheduled_at )")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })
    .limit(20);

  const normalized = (memberships ?? []).map((row: any) => {
    const organization = Array.isArray(row.organizations) ? row.organizations[0] : row.organizations;
    return {
      id: organization?.id as string,
      name: organization?.name as string,
      slug: organization?.slug as string,
      role: row.role as "admin_global" | "manager" | "member" | "viewer",
      isDefault: row.is_default ?? false,
      ownerId: (organization?.owner_id as string | null | undefined) ?? null,
      deletedAt: (organization?.deleted_at as string | null | undefined) ?? null,
      purgeScheduledAt: (organization?.purge_scheduled_at as string | null | undefined) ?? null,
    };
  }).filter((item: any) => item.id && item.name);

  const organizations = normalized.filter((item: any) => !item.deletedAt);
  const deletedOrganizations = normalized.filter((item: any) => !!item.deletedAt);

  const cookieStore = await cookies();
  const preference = normalizeWorkspacePreference(cookieStore.get(ACTIVE_WORKSPACE_COOKIE)?.value ?? null);
  const defaultOrganization = organizations[0] ?? null;
  const activeOrganization = preference === PERSONAL_WORKSPACE_VALUE
    ? null
    : (organizations.find((item: { id: string }) => item.id === preference) ?? defaultOrganization);
  const access = deriveOrganizationAccess(activeOrganization?.role ?? null);

  const { data: clientPermissions } = activeOrganization
    ? await supabase
        .from("client_permissions")
        .select("can_view, can_edit, can_manage_members, clients!inner ( name )")
        .eq("organization_id", activeOrganization.id)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(8)
    : { data: [] as any[] };

  const permissionRows = (clientPermissions ?? []).map((row: any) => {
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
    organizations,
    deletedOrganizations,
    clientPermissions: permissionRows,
    access,
  };
}


export async function getOrganizationInvites(organizationId?: string | null, canManageInvites = false) {
  if (!organizationId || !canManageInvites) return [];
  const supabase = await getServerClientCached();
  const { data } = await supabase
    .from("organization_invites")
    .select("id,email,role,status,created_at")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(8);

  return (data ?? []).map((row: any) => ({
    id: row.id as string,
    email: row.email as string,
    role: row.role as any,
    status: row.status as string,
    createdAtLabel: row.created_at ? format(new Date(row.created_at), "dd/MM/yyyy") : "-",
  }));
}

export async function getOrganizationMetrics(organizationId?: string | null) {
  if (!organizationId) return null;
  const supabase = await getServerClientCached();
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
  const editableClients = permissionRows.filter((row: any) => row.can_edit).length;
  const memberManagedClients = permissionRows.filter((row: any) => row.can_manage_members).length;
  const readOnlyClients = permissionRows.filter((row: any) => !row.can_edit).length;

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


export async function getOrganizationRolesAndPermissions(organizationId?: string | null, canManageRoles = false) {
  if (!organizationId || !canManageRoles) {
    return {
      roleTemplates: [],
      permissionDefinitions: [],
      membersByRole: [],
    };
  }

  const supabase = await getServerClientCached();
  const [roleTemplatesRes, rolePermissionsRes, permissionDefsRes, membersRes] = await Promise.all([
    supabase
      .from("organization_role_templates")
      .select("id,name,description,is_system")
      .eq("organization_id", organizationId)
      .order("is_system", { ascending: false })
      .order("name", { ascending: true }),
    supabase
      .from("organization_role_permissions")
      .select("role_template_id, permission_key")
      .eq("organization_id", organizationId),
    supabase
      .from("organization_permission_definitions")
      .select("key,label,description,category")
      .order("category", { ascending: true })
      .order("label", { ascending: true }),
    supabase
      .from("organization_members")
      .select("role")
      .eq("organization_id", organizationId),
  ]);

  const counts = new Map<string, number>();
  for (const row of membersRes.data ?? []) {
    counts.set(row.role as string, (counts.get(row.role as string) ?? 0) + 1);
  }

  const permissionsByRole = new Map<string, string[]>();
  for (const row of rolePermissionsRes.data ?? []) {
    const key = row.role_template_id as string;
    const arr = permissionsByRole.get(key) ?? [];
    arr.push(row.permission_key as string);
    permissionsByRole.set(key, arr);
  }

  const roleTemplates = (roleTemplatesRes.data ?? []).map((row: any) => ({
    id: row.id as string,
    name: row.name as string,
    description: (row.description as string | null) ?? "",
    isSystem: !!row.is_system,
    memberCount: counts.get(row.name as string) ?? 0,
    permissions: (permissionsByRole.get(row.id as string) ?? []).sort(),
  }));

  return {
    roleTemplates,
    permissionDefinitions: (permissionDefsRes.data ?? []).map((row: any) => ({
      key: row.key as string,
      label: row.label as string,
      description: (row.description as string | null) ?? "",
      category: row.category as "tasks" | "projects" | "clients" | "team" | "reports",
    })),
    membersByRole: Array.from(counts.entries()).map(([role, count]) => ({ role, count })),
  };
}


export async function getPendingOrganizationInvitesForCurrentUser() {
  const supabase = await getServerClientCached();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const email = user?.email?.trim().toLowerCase();
  if (!email) return [];

  const { data } = await supabase
    .from("organization_invites")
    .select("id,email,role,status,created_at,organization_id,organizations!inner(id,name,slug)")
    .eq("status", "pending")
    .eq("email", email)
    .order("created_at", { ascending: false })
    .limit(8);

  return (data ?? []).map((row: any) => {
    const organization = Array.isArray(row.organizations) ? row.organizations[0] : row.organizations;
    return {
      id: row.id as string,
      email: row.email as string,
      role: row.role as any,
      organizationId: row.organization_id as string,
      organizationName: (organization?.name as string | null | undefined) ?? "Organización",
      organizationSlug: (organization?.slug as string | null | undefined) ?? "workspace",
      createdAtLabel: row.created_at ? format(new Date(row.created_at as string), "dd/MM/yyyy") : "-",
    };
  });
}
