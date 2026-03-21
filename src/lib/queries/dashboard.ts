import { addDays, endOfDay } from "date-fns";
import { createClient } from "@/lib/supabase/server";

export async function getDashboardData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const today = new Date();
  const in3Days = addDays(today, 3);
  const in7Days = addDays(today, 7);

  const [
    { count: activeTasks },
    { count: activeProjects },
    { count: completedTasks },
    { count: waitingTasks },
    { count: overdueTasks },
    { count: dueSoonTasks },
    { count: completedProjects },
    { count: collaborativeProjects },
    { data: recentTasks },
    { data: recentProjects },
    { data: notes },
    { data: departmentRows },
    { data: clientRows },
    { data: urgentProjects },
  ] = await Promise.all([
    supabase.from("tasks").select("id", { count: "exact", head: true }).eq("owner_id", user.id).neq("status", "concluido"),
    supabase.from("projects").select("id", { count: "exact", head: true }).eq("owner_id", user.id).neq("status", "completado"),
    supabase.from("tasks").select("id", { count: "exact", head: true }).eq("owner_id", user.id).eq("status", "concluido"),
    supabase.from("tasks").select("id", { count: "exact", head: true }).eq("owner_id", user.id).eq("status", "en_espera"),
    supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", user.id)
      .neq("status", "concluido")
      .lt("due_date", today.toISOString().slice(0, 10)),
    supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", user.id)
      .neq("status", "concluido")
      .gte("due_date", today.toISOString().slice(0, 10))
      .lte("due_date", in3Days.toISOString().slice(0, 10)),
    supabase.from("projects").select("id", { count: "exact", head: true }).eq("owner_id", user.id).eq("status", "completado"),
    supabase.from("projects").select("id", { count: "exact", head: true }).eq("owner_id", user.id).eq("is_collaborative", true),
    supabase
      .from("tasks")
      .select("id,title,status,due_date,client_name")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("projects")
      .select("id,title,status,due_date,client_name")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("reminders")
      .select("id, remind_at, task_id, project_id")
      .eq("user_id", user.id)
      .is("sent_at", null)
      .lte("remind_at", endOfDay(in7Days).toISOString())
      .order("remind_at", { ascending: true })
      .limit(6),
    supabase
      .from("tasks")
      .select("department_id, departments ( code, name )")
      .eq("owner_id", user.id)
      .neq("status", "concluido"),
    supabase
      .from("tasks")
      .select("client_name")
      .eq("owner_id", user.id)
      .neq("status", "concluido")
      .not("client_name", "is", null),
    supabase
      .from("projects")
      .select("id,title,status,due_date,client_name")
      .eq("owner_id", user.id)
      .neq("status", "completado")
      .not("due_date", "is", null)
      .lte("due_date", in7Days.toISOString().slice(0, 10))
      .order("due_date", { ascending: true })
      .limit(5),
  ]);

  const departmentTotals = new Map<string, { code: string; name: string; total: number }>();
  const clientTotals = new Map<string, { name: string; total: number }>();
  for (const row of departmentRows ?? []) {
    const dept = Array.isArray(row.departments) ? row.departments[0] : row.departments;
    if (!dept?.code) continue;
    const current = departmentTotals.get(dept.code) ?? { code: dept.code, name: dept.name, total: 0 };
    current.total += 1;
    departmentTotals.set(dept.code, current);
  }

  for (const row of clientRows ?? []) {
    if (!row.client_name) continue;
    const current = clientTotals.get(row.client_name) ?? { name: row.client_name, total: 0 };
    current.total += 1;
    clientTotals.set(row.client_name, current);
  }

  return {
    activeTasks: activeTasks ?? 0,
    activeProjects: activeProjects ?? 0,
    completedTasks: completedTasks ?? 0,
    waitingTasks: waitingTasks ?? 0,
    overdueTasks: overdueTasks ?? 0,
    dueSoonTasks: dueSoonTasks ?? 0,
    completedProjects: completedProjects ?? 0,
    collaborativeProjects: collaborativeProjects ?? 0,
    departmentMetrics: Array.from(departmentTotals.values()).sort((a, b) => b.total - a.total),
    clientMetrics: Array.from(clientTotals.values()).sort((a, b) => b.total - a.total).slice(0, 5),
    urgentProjects: urgentProjects ?? [],
    recentTasks: recentTasks ?? [],
    recentProjects: recentProjects ?? [],
    reminders: notes ?? [],
  };
}
