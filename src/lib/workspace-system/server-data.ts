import { applyWorkspaceScope, getWorkspaceContext } from "@/lib/queries/workspace";
import { WORKSPACE_QUERY_LIMITS } from "@/lib/workspace-system/performance";
import type { WorkspaceBoardSummary, WorkspaceMemberSummary, WorkspacePermissionSummary, WorkspacePersistenceGuardStatus, WorkspaceProjectSpaceAssignment, WorkspaceProjectViewPreference, WorkspaceSpaceSummary } from "@/lib/workspace-system/view-state";

export async function getWorkspaceIdentity() {
  const { supabase, user, activeOrganizationId } = await getWorkspaceContext();

  if (!user) {
    return {
      userId: null,
      organizationId: null,
      mode: "personal" as const,
      workspaceId: "guest-workspace",
      workspaceName: "FlowTask Workspace",
    };
  }

  if (!activeOrganizationId) {
    return {
      userId: user.id,
      organizationId: null,
      mode: "personal" as const,
      workspaceId: `personal:${user.id}`,
      workspaceName: "Mi workspace",
    };
  }

  const { data } = await supabase
    .from("organizations")
    .select("id,name,slug")
    .eq("id", activeOrganizationId)
    .is("deleted_at", null)
    .maybeSingle();

  return {
    userId: user.id,
    organizationId: activeOrganizationId,
    mode: "organization" as const,
    workspaceId: `organization:${activeOrganizationId}`,
    workspaceName: data?.name ?? "Organización activa",
  };
}


function isMissingPersistenceRelation(error: { code?: string; message?: string } | null | undefined) {
  if (!error) return false;
  const message = String(error.message ?? "").toLowerCase();
  return error.code === "42P01" || error.code === "PGRST205" || message.includes("could not find the table") || message.includes("relation") && message.includes("does not exist");
}

function isBlockedPersistenceRelation(error: { code?: string; message?: string } | null | undefined) {
  if (!error) return false;
  return error.code === "42501" || String(error.message ?? "").toLowerCase().includes("permission denied");
}

export async function getWorkspacePersistenceGuardStatus(): Promise<WorkspacePersistenceGuardStatus> {
  const { supabase, user } = await getWorkspaceContext();
  if (!user) {
    return {
      enabled: false,
      status: "unknown",
      workspaceSpacesReady: false,
      projectViewsReady: false,
      message: "Workspace persistence is disabled until the user session is available.",
      checkedAt: new Date().toISOString(),
      details: ["No authenticated user in workspace context."],
    };
  }

  const [spacesProbe, viewsProbe, spaceProjectsProbe] = await Promise.all([
    supabase.from("workspace_spaces").select("id", { count: "exact", head: true }).limit(1),
    supabase.from("project_views").select("id", { count: "exact", head: true }).limit(1),
    supabase.from("workspace_space_projects").select("id", { count: "exact", head: true }).limit(1),
  ]);

  const spacesMissing = isMissingPersistenceRelation(spacesProbe.error);
  const viewsMissing = isMissingPersistenceRelation(viewsProbe.error);
  const spaceProjectsMissing = isMissingPersistenceRelation(spaceProjectsProbe.error);
  const spacesBlocked = isBlockedPersistenceRelation(spacesProbe.error);
  const viewsBlocked = isBlockedPersistenceRelation(viewsProbe.error);
  const spaceProjectsBlocked = isBlockedPersistenceRelation(spaceProjectsProbe.error);
  const workspaceSpacesReady = !spacesProbe.error;
  const projectViewsReady = !viewsProbe.error;
  const projectSpaceLinksReady = !spaceProjectsProbe.error;
  const details = [
    workspaceSpacesReady ? "workspace_spaces: ready" : `workspace_spaces: ${spacesProbe.error?.code ?? "error"} ${spacesProbe.error?.message ?? "unavailable"}`,
    projectViewsReady ? "project_views: ready" : `project_views: ${viewsProbe.error?.code ?? "error"} ${viewsProbe.error?.message ?? "unavailable"}`,
    projectSpaceLinksReady ? "workspace_space_projects: ready" : `workspace_space_projects: ${spaceProjectsProbe.error?.code ?? "error"} ${spaceProjectsProbe.error?.message ?? "unavailable"}`,
  ];

  if (workspaceSpacesReady && projectViewsReady && projectSpaceLinksReady) {
    return {
      enabled: true,
      status: "ready",
      workspaceSpacesReady,
      projectViewsReady,
      projectSpaceLinksReady,
      message: "Workspace persistence tables are available. Saved spaces, project organization, and saved views can be used safely.",
      checkedAt: new Date().toISOString(),
      details,
    };
  }

  if (spacesBlocked || viewsBlocked || spaceProjectsBlocked) {
    return {
      enabled: false,
      status: "blocked",
      workspaceSpacesReady,
      projectViewsReady,
      projectSpaceLinksReady,
      message: "Workspace persistence tables exist but access is blocked by RLS or permissions. The workspace keeps generated fallbacks active.",
      checkedAt: new Date().toISOString(),
      details,
    };
  }

  if (spacesMissing && viewsMissing && spaceProjectsMissing) {
    return {
      enabled: false,
      status: "missing_tables",
      workspaceSpacesReady: false,
      projectViewsReady: false,
      projectSpaceLinksReady: false,
      message: "Migrations 0056/0057 have not been applied yet. FlowTask keeps generated spaces and disables project organization writes instead of breaking /app/workspace.",
      checkedAt: new Date().toISOString(),
      details,
    };
  }

  return {
    enabled: false,
    status: "partial",
    workspaceSpacesReady,
    projectViewsReady,
    projectSpaceLinksReady,
    message: "Workspace persistence is partially available. Apply or repair migrations 0056 and 0057 before relying on saved spaces/project organization.",
    checkedAt: new Date().toISOString(),
    details,
  };
}


export async function getWorkspaceBoards(projectId?: string | null): Promise<WorkspaceBoardSummary[]> {
  const { supabase, user, activeOrganizationId } = await getWorkspaceContext();

  if (!user) return [];

  let query = applyWorkspaceScope(
    supabase
      .from("visual_boards")
      .select("id,title,description,project_id,visibility,thumbnail_url,created_at,updated_at")
      .is("deleted_at", null)
      .order("updated_at", { ascending: false })
      .limit(WORKSPACE_QUERY_LIMITS.boards),
    user.id,
    activeOrganizationId,
  );

  if (projectId) query = query.eq("project_id", projectId);

  const { data, error } = await query;
  if (error) return [];

  const rows = (data ?? []) as Array<{
    id: string;
    title?: string | null;
    description?: string | null;
    project_id?: string | null;
    visibility?: string | null;
    thumbnail_url?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
  }>;

  const projectIds = [...new Set(rows.map((row) => row.project_id).filter((id): id is string => Boolean(id)))];
  const projectTitleById = new Map<string, string>();

  if (projectIds.length) {
    const { data: projects } = await supabase.from("projects").select("id,title").in("id", projectIds);
    for (const project of projects ?? []) {
      projectTitleById.set(String(project.id), String(project.title ?? "Proyecto"));
    }
  }

  return rows.map((row) => ({
    id: row.id,
    title: row.title ?? "Pizarra sin título",
    description: row.description ?? null,
    projectId: row.project_id ?? null,
    projectTitle: row.project_id ? projectTitleById.get(row.project_id) ?? null : null,
    visibility: row.visibility ?? null,
    thumbnailUrl: row.thumbnail_url ?? null,
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
  }));
}

import type { WorkspaceActivityItem, WorkspaceFileSummary, WorkspaceNotificationSummary } from "@/lib/workspace-system/view-state";

function formatWorkspaceAction(action?: string | null) {
  const labels: Record<string, string> = {
    task_created: "Tarea creada",
    task_updated: "Tarea actualizada",
    task_status_changed: "Estado actualizado",
    project_created: "Proyecto creado",
    project_updated: "Proyecto actualizado",
    project_status_changed: "Estado de proyecto actualizado",
    attachment_uploaded: "Archivo subido",
    attachment_deleted: "Archivo eliminado",
    comment_added: "Comentario agregado",
  };
  return labels[action ?? ""] ?? (action ?? "Actividad").replace(/_/g, " ");
}

function extractActivityTitle(row: { action?: string | null; metadata?: Record<string, unknown> | null }) {
  const metadata = row.metadata ?? {};
  const title = typeof metadata.title === "string" ? metadata.title : typeof metadata.name === "string" ? metadata.name : typeof metadata.file_name === "string" ? metadata.file_name : null;
  return title ?? formatWorkspaceAction(row.action);
}

export async function getWorkspaceActivity(projectId?: string | null): Promise<WorkspaceActivityItem[]> {
  const { supabase, user, activeOrganizationId } = await getWorkspaceContext();
  if (!user) return [];

  let query = supabase
    .from("activity_logs")
    .select("id,entity_type,entity_id,action,metadata,created_at,project_id,task_id,organization_id,user_id")
    .order("created_at", { ascending: false })
    .limit(WORKSPACE_QUERY_LIMITS.activity);

  if (projectId) query = query.or(`project_id.eq.${projectId},and(entity_type.eq.project,entity_id.eq.${projectId})`);
  else if (activeOrganizationId) query = query.eq("organization_id", activeOrganizationId);
  else query = query.eq("user_id", user.id);

  const { data, error } = await query;
  if (error) return [];

  return ((data ?? []) as any[]).map((row) => ({
    id: String(row.id),
    action: String(row.action ?? "activity"),
    entityType: row.entity_type ?? null,
    entityId: row.entity_id ?? null,
    title: extractActivityTitle(row),
    description: formatWorkspaceAction(row.action),
    projectId: row.project_id ?? (row.entity_type === "project" ? row.entity_id : null),
    taskId: row.task_id ?? (row.entity_type === "task" ? row.entity_id : null),
    createdAt: row.created_at,
  }));
}

export async function getWorkspaceFiles(options: { projectId?: string | null; projectIds?: string[]; taskIds?: string[] } = {}): Promise<WorkspaceFileSummary[]> {
  const { supabase, user } = await getWorkspaceContext();
  if (!user) return [];

  const projectIds = options.projectId ? [options.projectId] : (options.projectIds ?? []).slice(0, 80);
  const taskIds = options.taskIds ?? [];

  let query = supabase
    .from("attachments")
    .select("id,file_name,mime_type,file_size,public_url,storage_path,project_id,task_id,created_at")
    .order("created_at", { ascending: false })
    .limit(WORKSPACE_QUERY_LIMITS.files);

  if (projectIds.length && taskIds.length) query = query.or(`project_id.in.(${projectIds.join(",")}),task_id.in.(${taskIds.slice(0, 80).join(",")})`);
  else if (projectIds.length) query = query.in("project_id", projectIds);
  else if (taskIds.length) query = query.in("task_id", taskIds.slice(0, 80));
  else query = query.eq("owner_id", user.id);

  const { data, error } = await query;
  if (error) return [];

  const rows = (data ?? []) as Array<{
    id: string;
    file_name?: string | null;
    mime_type?: string | null;
    file_size?: number | null;
    public_url?: string | null;
    storage_path?: string | null;
    project_id?: string | null;
    task_id?: string | null;
    created_at?: string | null;
  }>;

  const relatedProjectIds = [...new Set(rows.map((row) => row.project_id).filter((id): id is string => Boolean(id)))];
  const relatedTaskIds = [...new Set(rows.map((row) => row.task_id).filter((id): id is string => Boolean(id)))];
  const projectTitleById = new Map<string, string>();
  const taskTitleById = new Map<string, { title: string; projectId?: string | null }>();

  if (relatedProjectIds.length) {
    const { data: projects } = await supabase.from("projects").select("id,title").in("id", relatedProjectIds);
    for (const project of projects ?? []) projectTitleById.set(String(project.id), String(project.title ?? "Proyecto"));
  }

  if (relatedTaskIds.length) {
    const { data: tasks } = await supabase.from("tasks").select("id,title,project_id").in("id", relatedTaskIds);
    for (const task of tasks ?? []) taskTitleById.set(String(task.id), { title: String(task.title ?? "Tarea"), projectId: task.project_id ?? null });
  }

  return rows.map((row) => {
    const task = row.task_id ? taskTitleById.get(row.task_id) : null;
    const projectId = row.project_id ?? task?.projectId ?? null;
    return {
      id: row.id,
      fileName: row.file_name ?? "Archivo sin nombre",
      mimeType: row.mime_type ?? null,
      fileSize: row.file_size ?? null,
      publicUrl: row.public_url ?? null,
      storagePath: row.storage_path ?? null,
      projectId,
      projectTitle: projectId ? projectTitleById.get(projectId) ?? null : null,
      taskId: row.task_id ?? null,
      taskTitle: task?.title ?? null,
      createdAt: row.created_at ?? null,
    };
  });
}


export async function getWorkspaceNotificationDigest(projectId?: string | null): Promise<WorkspaceNotificationSummary> {
  const { supabase, user } = await getWorkspaceContext();
  const empty: WorkspaceNotificationSummary = { unread: 0, total: 0, task: 0, project: 0, reminder: 0, comment: 0, latest: [] };
  if (!user) return empty;

  let query = supabase
    .from("notifications")
    .select("id,title,body,entity_type,entity_id,is_read,created_at")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(WORKSPACE_QUERY_LIMITS.notifications);

  if (projectId) query = query.or(`entity_id.eq.${projectId},entity_type.eq.project`);

  const { data, error } = await query;
  if (error) return empty;

  const rows = (data ?? []) as Array<{
    id: string;
    title?: string | null;
    body?: string | null;
    entity_type?: string | null;
    entity_id?: string | null;
    is_read?: boolean | null;
    created_at?: string | null;
  }>;

  return {
    unread: rows.filter((row) => !row.is_read).length,
    total: rows.length,
    task: rows.filter((row) => row.entity_type === "task").length,
    project: rows.filter((row) => row.entity_type === "project").length,
    reminder: rows.filter((row) => row.entity_type === "reminder").length,
    comment: rows.filter((row) => row.entity_type === "comment").length,
    latest: rows.slice(0, 5).map((row) => ({
      id: String(row.id),
      title: row.title ?? "Notificación",
      body: row.body ?? null,
      entityType: row.entity_type ?? null,
      entityId: row.entity_id ?? null,
      isRead: Boolean(row.is_read),
      createdAt: row.created_at ?? null,
    })),
  };
}


export async function getWorkspacePersistedSpaces(): Promise<WorkspaceSpaceSummary[]> {
  const { supabase, user, activeOrganizationId } = await getWorkspaceContext();
  if (!user) return [];

  let query = supabase
    .from("workspace_spaces")
    .select("id,name,slug,color,icon,sort_order,organization_id,user_id,is_archived")
    .eq("is_archived", false)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true })
    .limit(24);

  if (activeOrganizationId) query = query.eq("organization_id", activeOrganizationId);
  else query = query.eq("user_id", user.id).is("organization_id", null);

  const { data, error } = await query;
  if (error) return [];

  return ((data ?? []) as any[]).map((space) => ({
    id: String(space.id),
    name: String(space.name ?? "Espacio"),
    slug: String(space.slug ?? space.id),
    source: "persisted" as const,
    taskCount: 0,
    projectCount: 0,
    color: space.color ?? null,
    icon: space.icon ?? null,
    isPersisted: true,
  }));
}

export async function getWorkspaceProjectViews(projectId?: string | null): Promise<WorkspaceProjectViewPreference[]> {
  const { supabase, user } = await getWorkspaceContext();
  if (!user || !projectId) return [];

  const { data, error } = await supabase
    .from("project_views")
    .select("id,project_id,view_type,title,config,is_default,sort_order")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) return [];

  return ((data ?? []) as any[]).map((view) => ({
    id: String(view.id),
    projectId: String(view.project_id),
    viewType: String(view.view_type) as WorkspaceProjectViewPreference["viewType"],
    title: String(view.title ?? view.view_type ?? "Vista"),
    config: (view.config && typeof view.config === "object" ? view.config : {}) as Record<string, unknown>,
    isDefault: Boolean(view.is_default),
    sortOrder: Number(view.sort_order ?? 0),
  }));
}


export async function getWorkspaceProjectSpaceAssignments(): Promise<WorkspaceProjectSpaceAssignment[]> {
  const { supabase, user } = await getWorkspaceContext();
  if (!user) return [];

  const { data, error } = await supabase
    .from("workspace_space_projects")
    .select("id,space_id,project_id,sort_order")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true })
    .limit(WORKSPACE_QUERY_LIMITS.projectSpaceAssignments);

  if (error) return [];

  return ((data ?? []) as any[]).map((row) => ({
    id: String(row.id),
    spaceId: String(row.space_id),
    projectId: String(row.project_id),
    sortOrder: Number(row.sort_order ?? 0),
  }));
}


const MANAGER_ROLES = new Set(["owner", "admin", "admin_global", "manager"]);
const EDITOR_ROLES = new Set(["owner", "editor"]);

function normalizeProfile(row: any) {
  const profile = Array.isArray(row?.profiles) ? row.profiles[0] : row?.profiles;
  return {
    name: String(profile?.full_name || profile?.email || "Usuario"),
    email: profile?.email ?? null,
  };
}

export async function getWorkspaceProjectMembers(projectId?: string | null): Promise<WorkspaceMemberSummary[]> {
  const { supabase, user, activeOrganizationId } = await getWorkspaceContext();
  if (!user) return [];

  if (projectId) {
    const { data, error } = await supabase
      .from("project_members")
      .select("id,user_id,role,created_at,profiles(id,full_name,email)")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true })
      .limit(12);

    if (error) return [];

    return ((data ?? []) as any[]).map((row) => {
      const profile = normalizeProfile(row);
      return {
        id: String(row.id),
        userId: String(row.user_id),
        name: profile.name,
        email: profile.email,
        role: String(row.role ?? "viewer"),
        source: "project" as const,
        canManage: String(row.role ?? "") === "owner",
      };
    });
  }

  if (activeOrganizationId) {
    const { data, error } = await supabase
      .from("organization_members")
      .select("id,user_id,role,created_at,profiles(id,full_name,email)")
      .eq("organization_id", activeOrganizationId)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(12);

    if (error) return [];

    return ((data ?? []) as any[]).map((row) => {
      const profile = normalizeProfile(row);
      return {
        id: String(row.id),
        userId: String(row.user_id),
        name: profile.name,
        email: profile.email,
        role: String(row.role ?? "member"),
        source: "organization" as const,
        canManage: MANAGER_ROLES.has(String(row.role ?? "").toLowerCase()),
      };
    });
  }

  return [{
    id: user.id,
    userId: user.id,
    name: user.email ?? "Usuario actual",
    email: user.email ?? null,
    role: "owner",
    source: "owner",
    canManage: true,
  }];
}

export async function getWorkspacePermissionSummary(projectId?: string | null): Promise<WorkspacePermissionSummary> {
  const { supabase, user, activeOrganizationId } = await getWorkspaceContext();
  if (!user) {
    return {
      role: null,
      projectMemberRole: null,
      organizationRole: null,
      isProjectOwner: false,
      isOrgManager: false,
      canEdit: false,
      canManageMembers: false,
      canCreateTask: false,
      canUploadFiles: false,
      canSaveViews: false,
      canManageSpaces: false,
      canAssignProjectsToSpaces: false,
      canEditTasks: false,
      canShare: false,
      canViewActivity: false,
      isReadOnly: true,
      message: "Inicia sesión para editar este workspace.",
    };
  }

  let organizationRole: string | null = null;
  if (activeOrganizationId) {
    const { data } = await supabase
      .from("organization_members")
      .select("role")
      .eq("organization_id", activeOrganizationId)
      .eq("user_id", user.id)
      .order("is_default", { ascending: false })
      .limit(1);
    organizationRole = String((data ?? [])[0]?.role ?? "member");
  }

  const isOrgManager = organizationRole ? MANAGER_ROLES.has(organizationRole.toLowerCase()) : false;
  let projectMemberRole: string | null = null;
  let isProjectOwner = false;

  if (projectId) {
    const [{ data: project }, { data: membership }] = await Promise.all([
      supabase.from("projects").select("id,owner_id,organization_id").eq("id", projectId).maybeSingle(),
      supabase.from("project_members").select("role").eq("project_id", projectId).eq("user_id", user.id).limit(1),
    ]);
    isProjectOwner = (project as any)?.owner_id === user.id;
    projectMemberRole = String((membership ?? [])[0]?.role ?? (isProjectOwner ? "owner" : "viewer"));
  }

  const canEditProject = Boolean(isProjectOwner || isOrgManager || (projectMemberRole && EDITOR_ROLES.has(projectMemberRole.toLowerCase())));
  const canManageWorkspace = activeOrganizationId ? isOrgManager : true;
  const canEdit = projectId ? canEditProject : canManageWorkspace;

  return {
    role: projectMemberRole ?? organizationRole ?? "owner",
    projectMemberRole,
    organizationRole,
    isProjectOwner,
    isOrgManager,
    canEdit,
    canManageMembers: Boolean(isProjectOwner || isOrgManager || projectMemberRole === "owner"),
    canCreateTask: canEdit,
    canUploadFiles: canEdit,
    canSaveViews: canEdit,
    canManageSpaces: canManageWorkspace,
    canAssignProjectsToSpaces: canManageWorkspace,
    canEditTasks: canEdit,
    canShare: canEdit,
    canViewActivity: true,
    isReadOnly: !canEdit,
    message: canEdit ? "Tenés permisos para editar este contexto." : "Acceso de solo lectura: podés revisar el workspace, pero las acciones de escritura están bloqueadas.",
  };
}
