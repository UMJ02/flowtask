import { createClient } from "@/lib/supabase/server";

export interface ProjectFiltersInput {
  q?: string;
  status?: string;
  department?: string;
  mode?: string;
  client?: string;
}

export async function getProjects(filters: ProjectFiltersInput = {}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  let query = supabase
    .from("projects")
    .select(
      `
        id,
        title,
        status,
        client_name,
        due_date,
        is_collaborative,
        departments ( code, name )
      `,
    )
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  if (filters.q) query = query.ilike("title", `%${filters.q}%`);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.mode === "solo") query = query.eq("is_collaborative", false);
  if (filters.mode === "collaborative") query = query.eq("is_collaborative", true);
  if (filters.client) query = query.ilike("client_name", `%${filters.client}%`);
  if (filters.department) {
    const { data: dept } = await supabase.from("departments").select("id").eq("code", filters.department).maybeSingle();
    if (dept?.id) query = query.eq("department_id", dept.id);
  }

  const { data } = await query;
  return data ?? [];
}


export async function getProjectClientMetrics(projectId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tasks")
    .select("client_name,status")
    .eq("project_id", projectId);

  const totals = new Map<string, { name: string; total: number; completed: number; active: number }>();
  for (const row of data ?? []) {
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
  const supabase = await createClient();
  const { data, error } = await supabase
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
        is_collaborative,
        share_enabled,
        share_token,
        created_at,
        updated_at,
        completed_at,
        departments ( id, code, name )
      `,
    )
    .eq("id", projectId)
    .single();

  if (error) return null;
  return data;
}

export async function getProjectTasks(projectId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tasks")
    .select("id,title,status,client_name,due_date,priority,completed_at")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getProjectComments(projectId: string) {
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
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getProjectMembers(projectId: string) {
  const supabase = await createClient();
  const { data } = await supabase
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

  return data ?? [];
}
