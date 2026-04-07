import { cache } from "react";
import { getWorkspaceContext, applyWorkspaceScope } from "@/lib/queries/workspace";
import { filterRowsByClientAccess, getClientAccessSummary, hasClientAccess } from "@/lib/security/client-access";
import type { ProjectSummary } from "@/types/project";

export interface ProjectFiltersInput {
  q?: string;
  status?: string;
  department?: string;
  mode?: string;
  client?: string;
}


const getDepartmentIdByCodeCached = cache(async (departmentCode: string) => {
  const normalized = departmentCode.trim();
  if (!normalized) return null;
  const { supabase } = await getWorkspaceContext();
  const { data } = await supabase.from("departments").select("id").eq("code", normalized).maybeSingle();
  return (data?.id as number | null | undefined) ?? null;
});

const getClientAccessSummaryCached = cache(async (userId: string, organizationId?: string | null) => {
  const { supabase } = await getWorkspaceContext();
  return getClientAccessSummary(supabase as any, userId, organizationId);
});
function normalizeProjectRow(row: any): ProjectSummary {
  const department = Array.isArray(row.departments) ? row.departments[0] : row.departments;
  return {
    id: String(row.id),
    title: String(row.title ?? "Proyecto"),
    status: (row.status as ProjectSummary["status"]) ?? "activo",
    created_at: (row.created_at as string | null | undefined) ?? null,
    updated_at: (row.updated_at as string | null | undefined) ?? null,
    clientName: (row.client_name as string | null | undefined) ?? null,
    client_name: (row.client_name as string | null | undefined) ?? null,
    dueDate: (row.due_date as string | null | undefined) ?? null,
    due_date: (row.due_date as string | null | undefined) ?? null,
    isCollaborative: Boolean(row.is_collaborative),
    is_collaborative: Boolean(row.is_collaborative),
    departmentCode: (department?.code as string | null | undefined) ?? null,
    departmentName: (department?.name as string | null | undefined) ?? null,
    departments: row.departments ?? null,
    country: (row.country as string | null | undefined) ?? null,
  };
}

export async function getProjects(filters: ProjectFiltersInput = {}): Promise<ProjectSummary[]> {
  const { supabase, user, activeOrganizationId } = await getWorkspaceContext();

  if (!user) return [];

  let query = applyWorkspaceScope(
    supabase
      .from("projects")
      .select(
        `
          id,
          title,
          status,
          client_name,
          due_date,
          country,
          is_collaborative,
          client_id,
          country,
          created_at,
          updated_at,
          departments ( code, name )
        `,
      )
      .order("created_at", { ascending: false }),
    user.id,
    activeOrganizationId,
  );

  if (filters.q) query = query.ilike("title", `%${filters.q}%`);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.mode === "solo") query = query.eq("is_collaborative", false);
  if (filters.mode === "collaborative") query = query.eq("is_collaborative", true);
  if (filters.client) query = query.ilike("client_name", `%${filters.client}%`);
  if (filters.department) {
    const departmentId = await getDepartmentIdByCodeCached(filters.department);
    if (departmentId) query = query.eq("department_id", departmentId);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[getProjects]", error.message);
    return [];
  }

  const access = await getClientAccessSummaryCached(user.id, activeOrganizationId);
  return filterRowsByClientAccess((data ?? []) as any[], access, "view").map(normalizeProjectRow);
}

export async function getProjectClientMetrics(projectId: string) {
  const { supabase, user, activeOrganizationId } = await getWorkspaceContext();
  if (!user) return [];
  const access = await getClientAccessSummaryCached(user.id, activeOrganizationId);
  const { data, error } = await supabase
    .from("tasks")
    .select("client_name,status,client_id")
    .eq("project_id", projectId);

  if (error) {
    console.error("[getProjectClientMetrics]", error.message);
    return [];
  }

  const totals = new Map<string, { name: string; total: number; completed: number; active: number }>();
  for (const row of filterRowsByClientAccess((data ?? []) as any[], access, "view")) {
    const name = row.client_name?.trim() || "Sin cliente";
    const current = totals.get(name) ?? { name, total: 0, completed: 0, active: 0 };
    current.total += 1;
    if (row.status === "concluido") current.completed += 1;
    else current.active += 1;
    totals.set(name, current);
  }

  return Array.from(totals.values()).sort((a, b) => b.total - a.total);
}

export async function getProjectById(projectId: string) {
  const { supabase, user, activeOrganizationId } = await getWorkspaceContext();
  if (!user) return null;

  const query = applyWorkspaceScope(
    supabase
      .from("projects")
      .select(
        `
          id,
          owner_id,
          title,
          description,
          status,
          client_name,
          due_date,
          country,
          is_collaborative,
          client_id,
          share_enabled,
          share_token,
          created_at,
          updated_at,
          completed_at,
          departments ( id, code, name )
        `,
      )
      .eq("id", projectId),
    user.id,
    activeOrganizationId,
  );

  const { data, error } = await query.single();

  if (error) return null;
  const access = await getClientAccessSummaryCached(user.id, activeOrganizationId);
  return hasClientAccess(access, (data as any)?.client_id ?? null, "view") ? data : null;
}

export async function getProjectTasks(projectId: string) {
  const { supabase, user, activeOrganizationId } = await getWorkspaceContext();
  if (!user) return [];
  const access = await getClientAccessSummaryCached(user.id, activeOrganizationId);
  const { data, error } = await supabase
    .from("tasks")
    .select("id,title,status,client_name,due_date,priority,completed_at,client_id")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getProjectTasks]", error.message);
    return [];
  }

  return filterRowsByClientAccess((data ?? []) as any[], access, "view");
}

export async function getProjectComments(projectId: string) {
  const { supabase } = await getWorkspaceContext();
  const { data, error } = await supabase
    .from("comments")
    .select(
      `
        id,
        content,
        created_at,
        author_id,
        profiles ( full_name, email )
      `,
    )
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getProjectComments]", error.message);
    return [];
  }

  return data ?? [];
}

export async function getProjectMembers(projectId: string) {
  const { supabase } = await getWorkspaceContext();
  const { data, error } = await supabase
    .from("project_members")
    .select(
      `
        id,
        role,
        created_at,
        user_id,
        profiles ( id, full_name, email )
      `,
    )
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[getProjectMembers]", error.message);
    return [];
  }

  return data ?? [];
}
