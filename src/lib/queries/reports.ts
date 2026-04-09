import { endOfWeek, format, isToday, isWithinInterval, parseISO, startOfToday } from "date-fns";
import { getRecentActivitySummary } from "@/lib/queries/activity";
import { getClients } from "@/lib/queries/clients";
import { getProjects } from "@/lib/queries/projects";
import { getTasks } from "@/lib/queries/tasks";
import { isTaskOverdue } from "@/lib/tasks/status-rules";

type TaskRow = Awaited<ReturnType<typeof getTasks>>[number];
type ProjectRow = Awaited<ReturnType<typeof getProjects>>[number];
type ClientRow = Awaited<ReturnType<typeof getClients>>[number];

type DepartmentReference =
  | { code?: string | null; name?: string | null }
  | Array<{ code?: string | null; name?: string | null }>
  | null
  | undefined;

export type ReportsOverview = {
  kpis: {
    activeTasks: number;
    overdueTasks: number;
    dueToday: number;
    dueThisWeek: number;
    waitingTasks: number;
    overdueProjects: number;
    activeProjects: number;
    clients: number;
    completionRate: number;
  };
  taskStatus: Array<{ label: string; value: string; count: number }>;
  projectStatus: Array<{ label: string; value: string; count: number }>;
  attentionClients: Array<{
    id: string;
    name: string;
    openTasks: number;
    openProjects: number;
    completedTasks: number;
    status: string;
  }>;
  focusTasks: Array<{
    id: string;
    title: string;
    dueLabel: string;
    clientName: string;
    status: string;
    urgency: "overdue" | "today" | "planned";
  }>;
  departmentLoad: Array<{
    name: string;
    openTasks: number;
    activeProjects: number;
    total: number;
  }>;
  projectWatchlist: Array<{
    id: string;
    title: string;
    clientName: string;
    status: string;
    dueLabel: string;
    urgency: "overdue" | "this_week" | "planned";
  }>;
  activity: Awaited<ReturnType<typeof getRecentActivitySummary>>;
};

function toLabel(value?: string | null) {
  if (!value) return "Sin estado";
  return value.replaceAll("_", " ").replace(/\w/g, (char) => char.toUpperCase());
}

function countByStatus(items: Array<{ status?: string | null }>) {
  const map = new Map<string, number>();
  for (const item of items) {
    const key = item.status?.trim() || "sin_estado";
    map.set(key, (map.get(key) ?? 0) + 1);
  }

  return Array.from(map.entries())
    .map(([value, count]) => ({ value, count, label: toLabel(value) }))
    .sort((a, b) => b.count - a.count);
}

function getDepartmentName(reference: DepartmentReference) {
  const department = Array.isArray(reference) ? reference[0] : reference;
  return department?.name?.trim() || department?.code?.trim() || "Sin departamento";
}

function buildProjectUrgency(project: ProjectRow, today: Date, weekEnd: Date): "overdue" | "this_week" | "planned" {
  if (!project.due_date) return "planned";

  try {
    const dueDate = parseISO(project.due_date);
    if (dueDate < today) return "overdue";
    if (isWithinInterval(dueDate, { start: today, end: weekEnd })) return "this_week";
  } catch {
    return "planned";
  }

  return "planned";
}

function formatDueLabel(rawValue?: string | null) {
  if (!rawValue) return "Sin fecha";
  try {
    return format(parseISO(rawValue), "dd/MM/yyyy");
  } catch {
    return rawValue;
  }
}

export async function getReportsOverview(): Promise<ReportsOverview> {
  const [tasks, projects, clients, activity] = await Promise.all([
    getTasks({}),
    getProjects({}),
    getClients(),
    getRecentActivitySummary(24),
  ]);

  const typedTasks: TaskRow[] = tasks;
  const typedProjects: ProjectRow[] = projects;
  const typedClients: ClientRow[] = clients;

  const today = startOfToday();
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const activeTasks = typedTasks.filter((task) => task.status !== "concluido");
  const overdueTasks = activeTasks.filter((task) => {
    if (!task.due_date) return false;
    try {
      return isTaskOverdue(task.due_date, task.status);
    } catch {
      return false;
    }
  });
  const dueToday = activeTasks.filter((task) => {
    if (!task.due_date) return false;
    try {
      return isToday(parseISO(task.due_date));
    } catch {
      return false;
    }
  });
  const dueThisWeek = activeTasks.filter((task) => {
    if (!task.due_date) return false;
    try {
      return isWithinInterval(parseISO(task.due_date), { start: today, end: weekEnd });
    } catch {
      return false;
    }
  });
  const waitingTasks = activeTasks.filter((task) => task.status === "en_espera");
  const overdueProjects = typedProjects.filter((project) => {
    if (project.status === "completado" || !project.due_date) return false;
    try {
      return parseISO(project.due_date) < today;
    } catch {
      return false;
    }
  });

  const completionRate = typedTasks.length
    ? Math.round((typedTasks.filter((task) => task.status === "concluido").length / typedTasks.length) * 100)
    : 0;

  const focusTasks = [...activeTasks]
    .sort((a, b) => {
      if (!a.due_date && !b.due_date) return 0;
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return a.due_date.localeCompare(b.due_date);
    })
    .slice(0, 6)
    .map((task) => {
      let urgency: "overdue" | "today" | "planned" = "planned";
      let dueLabel = "Sin fecha";
      if (task.due_date) {
        try {
          const dueDate = parseISO(task.due_date);
          dueLabel = format(dueDate, "dd/MM/yyyy");
          if (isTaskOverdue(task.due_date, task.status)) urgency = "overdue";
          else if (isToday(dueDate)) urgency = "today";
        } catch {
          dueLabel = task.due_date;
        }
      }
      return {
        id: task.id,
        title: task.title,
        dueLabel,
        clientName: task.client_name || "Sin cliente",
        status: task.status,
        urgency,
      };
    });

  const attentionClients = [...typedClients]
    .sort((a, b) => b.openTasksCount + b.projectsCount - (a.openTasksCount + a.projectsCount))
    .slice(0, 5)
    .map((client) => ({
      id: client.id,
      name: client.name,
      openTasks: client.openTasksCount,
      openProjects: client.projectsCount,
      completedTasks: client.completedTasksCount,
      status: client.status,
    }));

  const departmentMap = new Map<string, { name: string; openTasks: number; activeProjects: number; total: number }>();
  for (const task of activeTasks) {
    const departmentName = getDepartmentName(task.departments);
    const current = departmentMap.get(departmentName) ?? { name: departmentName, openTasks: 0, activeProjects: 0, total: 0 };
    current.openTasks += 1;
    current.total += 1;
    departmentMap.set(departmentName, current);
  }
  for (const project of typedProjects.filter((item) => item.status !== "completado")) {
    const departmentName = getDepartmentName(project.departments);
    const current = departmentMap.get(departmentName) ?? { name: departmentName, openTasks: 0, activeProjects: 0, total: 0 };
    current.activeProjects += 1;
    current.total += 1;
    departmentMap.set(departmentName, current);
  }

  const departmentLoad = Array.from(departmentMap.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);

  const projectWatchlist = [...typedProjects]
    .filter((project) => project.status !== "completado")
    .sort((a, b) => {
      const urgencyA = buildProjectUrgency(a, today, weekEnd);
      const urgencyB = buildProjectUrgency(b, today, weekEnd);
      const rank = { overdue: 0, this_week: 1, planned: 2 } as const;
      if (rank[urgencyA] !== rank[urgencyB]) return rank[urgencyA] - rank[urgencyB];
      if (!a.due_date && !b.due_date) return 0;
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return a.due_date.localeCompare(b.due_date);
    })
    .slice(0, 6)
    .map((project) => ({
      id: project.id,
      title: project.title,
      clientName: project.client_name || "Sin cliente",
      status: project.status,
      dueLabel: formatDueLabel(project.due_date),
      urgency: buildProjectUrgency(project, today, weekEnd),
    }));

  return {
    kpis: {
      activeTasks: activeTasks.length,
      overdueTasks: overdueTasks.length,
      dueToday: dueToday.length,
      dueThisWeek: dueThisWeek.length,
      waitingTasks: waitingTasks.length,
      overdueProjects: overdueProjects.length,
      activeProjects: typedProjects.filter((project) => project.status !== "completado").length,
      clients: typedClients.length,
      completionRate,
    },
    taskStatus: countByStatus(typedTasks),
    projectStatus: countByStatus(typedProjects),
    attentionClients,
    focusTasks,
    departmentLoad,
    projectWatchlist,
    activity,
  };
}
