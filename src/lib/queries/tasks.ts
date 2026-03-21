import { createClient } from "@/lib/supabase/server";

export interface TaskFiltersInput {
  q?: string;
  status?: string;
  department?: string;
  due?: string;
}

export async function getTasks(filters: TaskFiltersInput = {}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  let query = supabase
    .from("tasks")
    .select(
      `
        id,
        title,
        status,
        client_name,
        due_date,
        departments ( code, name )
      `,
    )
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  if (filters.q) query = query.ilike("title", `%${filters.q}%`);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.department) {
    const { data: dept } = await supabase.from("departments").select("id").eq("code", filters.department).maybeSingle();
    if (dept?.id) query = query.eq("department_id", dept.id);
  }

  const today = new Date().toISOString().slice(0, 10);
  if (filters.due === "overdue") query = query.lt("due_date", today).neq("status", "concluido");
  if (filters.due === "today") query = query.eq("due_date", today).neq("status", "concluido");
  if (filters.due === "soon") query = query.gte("due_date", today).neq("status", "concluido");
  if (filters.due === "none") query = query.is("due_date", null);

  const { data } = await query;
  return data ?? [];
}

export async function getTaskById(taskId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select(
      `
        id,
        owner_id,
        project_id,
        title,
        description,
        status,
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
    .eq("id", taskId)
    .single();

  if (error) return null;
  return data;
}

export async function getTaskComments(taskId: string) {
  const supabase = await createClient();
  const { data } = await supabase
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

  return data ?? [];
}

export async function getAssignableUsers(taskId: string) {
  const supabase = await createClient();
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

  const { data } = await supabase
    .from("project_members")
    .select(
      `
        user_id,
        profiles ( id, full_name, email )
      `,
    )
    .eq("project_id", task.project_id);

  return (data ?? [])
    .map((item) => Array.isArray(item.profiles) ? item.profiles[0] : item.profiles)
    .filter(Boolean);
}

export async function getTaskAssignees(taskId: string) {
  const supabase = await createClient();
  const { data } = await supabase
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

  return data ?? [];
}
