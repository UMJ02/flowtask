import { getWorkspaceContext, applyWorkspaceScope } from "@/lib/queries/workspace";
import { filterRowsByClientAccess, getClientAccessSummary, hasClientAccess } from "@/lib/security/client-access";
import type { TaskSummary } from "@/types/task";

export interface TaskFiltersInput {
  q?: string;
  status?: string;
  priority?: string;
  department?: string;
  due?: string;
}

function normalizeTaskRow(row: any): TaskSummary {
  const department = Array.isArray(row.departments) ? row.departments[0] : row.departments;
  const dueDate = (row.due_date as string | null | undefined) ?? null;
  const today = new Date().toISOString().slice(0, 10);
  return {
    id: String(row.id),
    title: String(row.title ?? "Tarea"),
    status: (row.status as TaskSummary["status"]) ?? "en_proceso",
    created_at: (row.created_at as string | null | undefined) ?? null,
    updated_at: (row.updated_at as string | null | undefined) ?? null,
    clientName: (row.client_name as string | null | undefined) ?? null,
    client_name: (row.client_name as string | null | undefined) ?? null,
    priority: (row.priority as string | null | undefined) ?? "media",
    project_id: (row.project_id as string | null | undefined) ?? null,
    dueDate,
    due_date: dueDate,
    departmentCode: (department?.code as string | null | undefined) ?? null,
    departmentName: (department?.name as string | null | undefined) ?? null,
    departments: row.departments ?? null,
    isOverdue: Boolean(dueDate && dueDate < today && row.status !== "concluido"),
    isDueToday: Boolean(dueDate && dueDate === today && row.status !== "concluido"),
  };
}

export async function getTasks(filters: TaskFiltersInput = {}): Promise<TaskSummary[]> {
  const { supabase, user, activeOrganizationId } = await getWorkspaceContext();

  if (!user) return [];

  let query = applyWorkspaceScope(
    supabase
      .from("tasks")
      .select(
        `
          id,
          title,
          status,
          priority,
          project_id,
          client_id,
          client_name,
          due_date,
          created_at,
          updated_at,
          departments ( code, name )
        `,
      )
      .order("created_at", { ascending: false }),
    user.id,
    activeOrganizationId,
  );

  if (filters.q) query = query.or(`title.ilike.%${filters.q}%,client_name.ilike.%${filters.q}%`);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.priority) query = query.eq("priority", filters.priority);
  if (filters.department) {
    const { data: dept } = await supabase.from("departments").select("id").eq("code", filters.department).maybeSingle();
    if (dept?.id) query = query.eq("department_id", dept.id);
  }

  const today = new Date().toISOString().slice(0, 10);
  if (filters.due === "overdue") query = query.lt("due_date", today).neq("status", "concluido");
  if (filters.due === "today") query = query.eq("due_date", today).neq("status", "concluido");
  if (filters.due === "soon") query = query.gte("due_date", today).neq("status", "concluido");
  if (filters.due === "none") query = query.is("due_date", null);

  const { data, error } = await query;
  if (error) {
    console.error("[getTasks]", error.message);
    return [];
  }

  const access = await getClientAccessSummary(supabase as any, user.id, activeOrganizationId);
  return filterRowsByClientAccess((data ?? []) as any[], access, "view").map(normalizeTaskRow);
}

export async function getTaskById(taskId: string) {
  const { supabase, user, activeOrganizationId } = await getWorkspaceContext();
  if (!user) return null;

  let query = applyWorkspaceScope(
    supabase
      .from("tasks")
      .select(
        `
          id,
          owner_id,
          project_id,
          title,
          description,
          status,
          client_id,
          client_name,
          due_date,
          priority,
          share_enabled,
          share_token,
          created_at,
          updated_at,
          completed_at,
          departments ( id, code, name ),
          projects ( id, title )
        `,
      )
      .eq("id", taskId),
    user.id,
    activeOrganizationId,
  );

  const { data, error } = await query.single();

  if (error) return null;
  const access = await getClientAccessSummary(supabase as any, user.id, activeOrganizationId);
  return hasClientAccess(access, (data as any)?.client_id ?? null, "view") ? data : null;
}

export async function getTaskComments(taskId: string) {
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
    .eq("task_id", taskId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getTaskComments]", error.message);
    return [];
  }

  return data ?? [];
}

export async function getAssignableUsers(taskId: string) {
  const { supabase } = await getWorkspaceContext();
  const task = await getTaskById(taskId);
  if (!task) return [];

  if (!task.project_id) {
    const { data: owner } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("id", task.owner_id)
      .single();
    return owner ? [owner] : [];
  }

  const { data, error } = await supabase
    .from("project_members")
    .select(
      `
        user_id,
        profiles ( id, full_name, email )
      `,
    )
    .eq("project_id", task.project_id);

  if (error) {
    console.error("[getAssignableUsers]", error.message);
    return [];
  }

  return (data ?? [])
    .map((item: any) => Array.isArray(item.profiles) ? item.profiles[0] : item.profiles)
    .filter(Boolean);
}

export async function getTaskAssignees(taskId: string) {
  const { supabase } = await getWorkspaceContext();
  const { data, error } = await supabase
    .from("task_assignees")
    .select(
      `
        id,
        assigned_at,
        user_id,
        profiles ( id, full_name, email )
      `,
    )
    .eq("task_id", taskId)
    .order("assigned_at", { ascending: false });

  if (error) {
    console.error("[getTaskAssignees]", error.message);
    return [];
  }

  return data ?? [];
}
