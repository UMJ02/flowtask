import { addDays, endOfDay } from "date-fns";
import { getWorkspaceContext, applyWorkspaceScope } from "@/lib/queries/workspace";

export async function getDashboardData() {
  const { supabase, user, activeOrganizationId } = await getWorkspaceContext();

  if (!user) {
    return null;
  }

  const today = new Date();
  const in3Days = addDays(today, 3);
  const in7Days = addDays(today, 7);

  const [
    activeTasksRes,
    activeProjectsRes,
    completedTasksRes,
    waitingTasksRes,
    overdueTasksRes,
    dueSoonTasksRes,
    completedProjectsRes,
    collaborativeProjectsRes,
    recentTasksRes,
    recentProjectsRes,
    notesRes,
    departmentRowsRes,
    clientRowsRes,
    projectClientRowsRes,
    urgentProjectsRes,
    assignmentRowsRes,
    collaboratorRowsRes,
  ] = await Promise.all([
    applyWorkspaceScope(supabase.from("tasks").select("id", { count: "exact", head: true }).neq("status", "concluido"), user.id, activeOrganizationId),
    applyWorkspaceScope(supabase.from("projects").select("id", { count: "exact", head: true }).neq("status", "completado"), user.id, activeOrganizationId),
    applyWorkspaceScope(supabase.from("tasks").select("id", { count: "exact", head: true }).eq("status", "concluido"), user.id, activeOrganizationId),
    applyWorkspaceScope(supabase.from("tasks").select("id", { count: "exact", head: true }).eq("status", "en_espera"), user.id, activeOrganizationId),
    applyWorkspaceScope(
      supabase.from("tasks").select("id", { count: "exact", head: true }).neq("status", "concluido").lt("due_date", today.toISOString().slice(0, 10)),
      user.id,
      activeOrganizationId,
    ),
    applyWorkspaceScope(
      supabase
        .from("tasks")
        .select("id", { count: "exact", head: true })
        .neq("status", "concluido")
        .gte("due_date", today.toISOString().slice(0, 10))
        .lte("due_date", in3Days.toISOString().slice(0, 10)),
      user.id,
      activeOrganizationId,
    ),
    applyWorkspaceScope(supabase.from("projects").select("id", { count: "exact", head: true }).eq("status", "completado"), user.id, activeOrganizationId),
    applyWorkspaceScope(supabase.from("projects").select("id", { count: "exact", head: true }).eq("is_collaborative", true), user.id, activeOrganizationId),
    applyWorkspaceScope(
      supabase.from("tasks").select("id,title,status,due_date,client_name").order("created_at", { ascending: false }).limit(8),
      user.id,
      activeOrganizationId,
    ),
    applyWorkspaceScope(
      supabase.from("projects").select("id,title,status,due_date,client_name").order("created_at", { ascending: false }).limit(6),
      user.id,
      activeOrganizationId,
    ),
    supabase
      .from("reminders")
      .select("id, remind_at, task_id, project_id")
      .eq("user_id", user.id)
      .is("sent_at", null)
      .lte("remind_at", endOfDay(in7Days).toISOString())
      .order("remind_at", { ascending: true })
      .limit(6),
    applyWorkspaceScope(supabase.from("tasks").select("department_id, departments ( code, name )").neq("status", "concluido"), user.id, activeOrganizationId),
    applyWorkspaceScope(supabase.from("tasks").select("client_name,status").not("client_name", "is", null), user.id, activeOrganizationId),
    applyWorkspaceScope(supabase.from("projects").select("client_name,status").not("client_name", "is", null), user.id, activeOrganizationId),
    applyWorkspaceScope(
      supabase
        .from("projects")
        .select("id,title,status,due_date,client_name")
        .neq("status", "completado")
        .not("due_date", "is", null)
        .gte("due_date", today.toISOString().slice(0, 10))
        .lte("due_date", in7Days.toISOString().slice(0, 10))
        .order("due_date", { ascending: true })
        .limit(5),
      user.id,
      activeOrganizationId,
    ),
    supabase
      .from("task_assignees")
      .select("profiles!task_assignees_user_id_fkey ( full_name ), tasks!inner ( owner_id, status )")
      .eq("tasks.owner_id", user.id)
      .neq("tasks.status", "concluido"),
    supabase
      .from("project_members")
      .select("profiles!project_members_user_id_fkey ( full_name ), projects!inner ( owner_id )")
      .eq("projects.owner_id", user.id),
  ]);

  const departmentTotals = new Map<string, { code: string; name: string; total: number }>();
  const clientTotals = new Map<string, { name: string; total: number; tasks: number; projects: number; completed: number }>();
  const userWorkload = new Map<string, { name: string; total: number }>();
  const collaborationMetrics = new Map<string, { name: string; total: number }>();

  for (const row of departmentRowsRes.data ?? []) {
    const dept = Array.isArray(row.departments) ? row.departments[0] : row.departments;
    if (!dept?.code) continue;
    const current = departmentTotals.get(dept.code) ?? { code: dept.code, name: dept.name, total: 0 };
    current.total += 1;
    departmentTotals.set(dept.code, current);
  }

  for (const row of clientRowsRes.data ?? []) {
    if (!row.client_name) continue;
    const current = clientTotals.get(row.client_name) ?? { name: row.client_name, total: 0, tasks: 0, projects: 0, completed: 0 };
    current.total += 1;
    current.tasks += 1;
    if (row.status === "concluido") current.completed += 1;
    clientTotals.set(row.client_name, current);
  }

  for (const row of projectClientRowsRes.data ?? []) {
    if (!row.client_name) continue;
    const current = clientTotals.get(row.client_name) ?? { name: row.client_name, total: 0, tasks: 0, projects: 0, completed: 0 };
    current.total += 1;
    current.projects += 1;
    if (row.status === "completado") current.completed += 1;
    clientTotals.set(row.client_name, current);
  }

  for (const row of assignmentRowsRes.data ?? []) {
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    const name = profile?.full_name?.trim() || "Sin nombre";
    const current = userWorkload.get(name) ?? { name, total: 0 };
    current.total += 1;
    userWorkload.set(name, current);
  }

  for (const row of collaboratorRowsRes.data ?? []) {
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    const name = profile?.full_name?.trim() || "Sin nombre";
    const current = collaborationMetrics.get(name) ?? { name, total: 0 };
    current.total += 1;
    collaborationMetrics.set(name, current);
  }

  return {
    activeTasks: activeTasksRes.count ?? 0,
    activeProjects: activeProjectsRes.count ?? 0,
    completedTasks: completedTasksRes.count ?? 0,
    waitingTasks: waitingTasksRes.count ?? 0,
    overdueTasks: overdueTasksRes.count ?? 0,
    dueSoonTasks: dueSoonTasksRes.count ?? 0,
    completedProjects: completedProjectsRes.count ?? 0,
    collaborativeProjects: collaborativeProjectsRes.count ?? 0,
    departmentMetrics: Array.from(departmentTotals.values()).sort((a, b) => b.total - a.total),
    clientMetrics: Array.from(clientTotals.values()).sort((a, b) => b.total - a.total).slice(0, 5),
    userWorkload: Array.from(userWorkload.values()).sort((a, b) => b.total - a.total).slice(0, 5),
    collaborationMetrics: Array.from(collaborationMetrics.values()).sort((a, b) => b.total - a.total).slice(0, 5),
    urgentProjects: urgentProjectsRes.data ?? [],
    recentTasks: recentTasksRes.data ?? [],
    recentProjects: recentProjectsRes.data ?? [],
    reminders: notesRes.data ?? [],
  };
}
