import { applyWorkspaceScope, getWorkspaceContext } from "@/lib/queries/workspace";
import type { WorkspaceBoardSummary } from "@/lib/workspace-system/view-state";

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
