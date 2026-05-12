import { getWorkspaceContext } from "@/lib/queries/workspace";
import { getClientAccessSummary, hasClientAccess } from "@/lib/security/client-access";
import { deriveOrganizationAccess } from "@/lib/security/organization-access";
import type { OrganizationWorkspaceAccessCardSummary, ProjectAccessSummary, TaskAccessSummary } from "@/types/access";

async function getMembershipRole(supabase: any, userId: string, organizationId?: string | null) {
  if (!organizationId) return null;
  const { data } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", organizationId)
    .eq("user_id", userId)
    .order("is_default", { ascending: false })
    .limit(1);

  return ((data ?? [])[0]?.role as ProjectAccessSummary["role"] | undefined) ?? null;
}

export async function getOrganizationWorkspaceAccessSummary(): Promise<OrganizationWorkspaceAccessCardSummary> {
  const { supabase, user, activeOrganizationId } = await getWorkspaceContext();
  if (!user || !activeOrganizationId) {
    return {
      role: null,
      canManageInvites: false,
      canManageRoles: false,
      canManageClientPermissions: false,
      canViewSensitiveOrganizationData: false,
    };
  }

  const role = await getMembershipRole(supabase, user.id, activeOrganizationId);
  return deriveOrganizationAccess(role);
}

export async function getProjectAccessSummary(projectId: string): Promise<ProjectAccessSummary> {
  const { supabase, user, activeOrganizationId } = await getWorkspaceContext();
  if (!user) {
    return {
      role: null,
      projectMemberRole: null,
      canEdit: false,
      canManageMembers: false,
      canComment: false,
      canUploadAttachments: false,
      canShare: false,
      canCreateTask: false,
      canViewActivity: false,
    };
  }

  const [{ data: project }, role, access, { data: projectMemberships }] = await Promise.all([
    supabase.from("projects").select("id,owner_id,client_id,organization_id").eq("id", projectId).maybeSingle(),
    getMembershipRole(supabase, user.id, activeOrganizationId),
    getClientAccessSummary(supabase as any, user.id, activeOrganizationId),
    supabase.from("project_members").select("role").eq("project_id", projectId).eq("user_id", user.id).limit(1),
  ]);

  const projectMemberRole = ((projectMemberships ?? [])[0]?.role as ProjectAccessSummary["projectMemberRole"] | undefined) ?? null;
  const isOwner = (project as any)?.owner_id === user.id;
  const clientId = (project as any)?.client_id ?? null;
  const canView = hasClientAccess(access, clientId, "view");
  const canEditByOrg = hasClientAccess(access, clientId, "edit");
  const canManageMembersByOrg = hasClientAccess(access, clientId, "manage_members");
  const canEdit = Boolean(isOwner || projectMemberRole === "owner" || projectMemberRole === "editor" || canEditByOrg);
  const canManageMembers = Boolean(isOwner || projectMemberRole === "owner" || canManageMembersByOrg);
  const canComment = Boolean(canView);

  return {
    role,
    projectMemberRole,
    canEdit,
    canManageMembers,
    canComment,
    canUploadAttachments: canEdit,
    canShare: canEdit,
    canCreateTask: canEdit,
    canViewActivity: canView,
  };
}

export async function getTaskAccessSummary(taskId: string): Promise<TaskAccessSummary> {
  const { supabase, user, activeOrganizationId } = await getWorkspaceContext();
  if (!user) {
    return {
      role: null,
      projectMemberRole: null,
      isAssignee: false,
      canEdit: false,
      canManageAssignees: false,
      canComment: false,
      canUploadAttachments: false,
      canShare: false,
      canViewActivity: false,
    };
  }

  const [{ data: task }, role, access, { data: assignments }] = await Promise.all([
    supabase.from("tasks").select("id,owner_id,project_id,client_id,organization_id").eq("id", taskId).maybeSingle(),
    getMembershipRole(supabase, user.id, activeOrganizationId),
    getClientAccessSummary(supabase as any, user.id, activeOrganizationId),
    supabase.from("task_assignees").select("id").eq("task_id", taskId).eq("user_id", user.id).limit(1),
  ]);

  const projectId = (task as any)?.project_id ?? null;
  const projectMemberships = projectId
    ? await supabase.from("project_members").select("role").eq("project_id", projectId).eq("user_id", user.id).limit(1)
    : { data: [] as any[] };
  const projectMemberRole = ((projectMemberships.data ?? [])[0]?.role as TaskAccessSummary["projectMemberRole"] | undefined) ?? null;
  const isOwner = (task as any)?.owner_id === user.id;
  const isAssignee = (assignments?.length ?? 0) > 0;
  const clientId = (task as any)?.client_id ?? null;
  const canView = hasClientAccess(access, clientId, "view");
  const canEditByOrg = hasClientAccess(access, clientId, "edit");
  const canEdit = Boolean(isOwner || isAssignee || projectMemberRole === "owner" || projectMemberRole === "editor" || canEditByOrg);
  const canManageAssignees = Boolean(isOwner || projectMemberRole === "owner" || projectMemberRole === "editor" || canEditByOrg);
  const canComment = Boolean(canView);

  return {
    role,
    projectMemberRole,
    isAssignee,
    canEdit,
    canManageAssignees,
    canComment,
    canUploadAttachments: canEdit,
    canShare: canEdit,
    canViewActivity: canView,
  };
}
