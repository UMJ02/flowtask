import { applyWorkspaceScope, getWorkspaceContext } from "@/lib/queries/workspace";
import type { WorkspaceBoardSummary, WorkspaceProjectViewPreference, WorkspaceSpaceSummary } from "@/lib/workspace-system/view-state";

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


export async function getWorkspaceBoards(projectId?: string | null): Promise<WorkspaceBoardSummary[]> {
  const { supabase, user, activeOrganizationId } = await getWorkspaceContext();

  if (!user) return [];

  let query = applyWorkspaceScope(
    supabase
      .from("visual_boards")
      .select("id,title,description,project_id,visibility,thumbnail_url,created_at,updated_at")
      .is("deleted_at", null)
      .order("updated_at", { ascending: false })
      .limit(18),
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

import type { WorkspaceActivityItem, WorkspaceFileSummary } from "@/lib/workspace-system/view-state";

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
    .limit(18);

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
    .limit(24);

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
