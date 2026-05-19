import { cache } from "react";
import {
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isWithinInterval,
  parseISO,
  startOfMonth,
  startOfWeek,
  subDays,
} from "date-fns";
import { getRecentActivitySummary } from "@/lib/queries/activity";
import { getDashboardData } from "@/lib/queries/dashboard";
import { getOrganizationContext } from "@/lib/queries/organization";
import { getUsageEventMetrics } from "@/lib/queries/observability";
import { getWorkspaceOnboardingSummary } from "@/lib/queries/onboarding";
import { getProjects } from "@/lib/queries/projects";
import { getReportsOverview } from "@/lib/queries/reports";
import { getRiskRadarSummary } from "@/lib/queries/risk-radar";
import { getTasks } from "@/lib/queries/tasks";
import { createClient } from "@/lib/supabase/server";
import {
  getTaskStatusLabel,
  isTaskOverdue,
  normalizeTaskStatus,
  TASK_STATUS,
} from "@/lib/tasks/status";

export type AnalyticsTone = "critical" | "attention" | "stable";

export type AnalyticsFeedItem = {
  id: string;
  title: string;
  meta: string;
  statusLabel: string;
  tone: AnalyticsTone;
  source: "Tasks" | "Projects" | "Clients" | "Workspace";
};

export type SharedReportTaskItem = {
  id: string;
  itemType: "Tarea" | "Proyecto";
  title: string;
  createdAtLabel: string;
  deadlineLabel: string;
  statusLabel: string;
  clientLabel: string;
  priorityLabel: string;
  lastComment: string | null;
  progressPercent: number;
  checklistDone: number;
  checklistTotal: number;
};

export type AnalyticsTimeSeriesPoint = {
  label: string;
  iso: string;
  created: number;
  completed: number;
  activeDue: number;
};

export type AnalyticsStatusItem = {
  status:
    | "pendiente"
    | "en_proceso"
    | "produccion"
    | "en_espera"
    | "revision"
    | "concluido";
  label: string;
  count: number;
  color: string;
};

export type AnalyticsWorkloadItem = {
  label: string;
  active: number;
  waiting: number;
  overdue: number;
  total: number;
};

export type AnalyticsProjectProgressItem = {
  id: string;
  title: string;
  active: number;
  waiting: number;
  completed: number;
  total: number;
  percent: number;
};

export type WorkspaceAnalyticsSummary = {
  organizationName: string;
  generatedAtLabel: string;
  kpis: {
    healthScore: number;
    intelligenceScore: number;
    readinessScore: number;
    completionRate: number;
    adoptionScore: number;
    activityLast48h: number;
  };
  pipeline: {
    activeTasks: number;
    dueThisWeek: number;
    waitingTasks: number;
    activeProjects: number;
    clients: number;
    overdueLoad: number;
  };
  adoption: {
    loginEvents: number;
    projectEvents: number;
    taskEvents: number;
    supportEvents: number;
  };
  realMetrics: {
    totalTasks: number;
    operationalTasks: number;
    completedTasks: number;
    waitingTasks: number;
    overdueActiveTasks: number;
    dueThisWeekActiveTasks: number;
    attachmentsCount: number;
    commentsCount: number;
    avgCloseDays: number;
    averageTaskProgress: number;
    tasksWithChecklist: number;
  };
  timeSeries: AnalyticsTimeSeriesPoint[];
  statusDistribution: AnalyticsStatusItem[];
  workload: AnalyticsWorkloadItem[];
  projectProgress: AnalyticsProjectProgressItem[];
  weeklyFocus: AnalyticsFeedItem[];
  projectPipeline: AnalyticsFeedItem[];
  shareDigest: {
    priorityCount: number;
    weekCount: number;
    monthCount: number;
    upcomingCount: number;
    undatedCount: number;
    inProgressCount: number;
    waitingCount: number;
    completedCount: number;
    deadlineItems: Array<
      Pick<
        AnalyticsFeedItem,
        "id" | "title" | "meta" | "statusLabel" | "tone" | "source"
      >
    >;
    shareSummary: string[];
  };
  reportModules: {
    importantItems: SharedReportTaskItem[];
    currentWeekItems: SharedReportTaskItem[];
    currentMonthItems: SharedReportTaskItem[];
    upcomingItems: SharedReportTaskItem[];
    undatedItems: SharedReportTaskItem[];
    waitingTasks: SharedReportTaskItem[];
  };
  recommendations: string[];
};

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function statusLabel(value?: string | null) {
  return getTaskStatusLabel(value);
}

function priorityLabel(value?: string | null) {
  if (!value) return "Media";
  if (value === "alta") return "Alta";
  if (value === "baja") return "Baja";
  return "Media";
}

function formatShortDate(value?: string | null) {
  if (!value) return "Sin fecha";
  try {
    return format(parseISO(value), "dd/MM/yyyy");
  } catch {
    return value;
  }
}

function safeParse(value?: string | null) {
  if (!value) return null;
  try {
    const parsed = parseISO(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  } catch {
    return null;
  }
}

function isoDay(value: Date) {
  return format(value, "yyyy-MM-dd");
}

type TaskProgressSnapshot = {
  progressPercent: number;
  checklistDone: number;
  checklistTotal: number;
};

const EMPTY_PROGRESS: TaskProgressSnapshot = {
  progressPercent: 0,
  checklistDone: 0,
  checklistTotal: 0,
};

function buildReportTaskItem(
  task: Awaited<ReturnType<typeof getTasks>>[number],
  lastComment: string | null = null,
  progress: TaskProgressSnapshot = EMPTY_PROGRESS,
): SharedReportTaskItem {
  return {
    id: task.id,
    itemType: "Tarea",
    title: task.title,
    createdAtLabel: formatShortDate(task.created_at),
    deadlineLabel: formatShortDate(task.due_date),
    statusLabel: statusLabel(task.status),
    clientLabel: task.client_name || "Sin cliente",
    priorityLabel: priorityLabel(task.priority),
    lastComment,
    progressPercent: progress.progressPercent,
    checklistDone: progress.checklistDone,
    checklistTotal: progress.checklistTotal,
  };
}

function projectStatusLabel(value?: string | null) {
  if (!value) return "Sin estado";
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function buildProjectReportItem(
  project: Awaited<ReturnType<typeof getProjects>>[number],
): SharedReportTaskItem {
  return {
    id: project.id,
    itemType: "Proyecto",
    title: project.title,
    createdAtLabel: formatShortDate(project.created_at),
    deadlineLabel: formatShortDate(project.due_date),
    statusLabel: projectStatusLabel(project.status),
    clientLabel: project.client_name || "Sin cliente",
    priorityLabel: "Media",
    lastComment: null,
    progressPercent: 0,
    checklistDone: 0,
    checklistTotal: 0,
  };
}

function isImportantTask(task: Awaited<ReturnType<typeof getTasks>>[number]) {
  return task.priority === "alta";
}

function isCompletedProject(
  project: Awaited<ReturnType<typeof getProjects>>[number],
) {
  return project.status === "completado";
}

function sortByDateWeight<
  T extends { due_date?: string | null; created_at?: string | null },
>(items: T[]) {
  return [...items].sort((a, b) => {
    const dueA = a.due_date ?? "9999-12-31";
    const dueB = b.due_date ?? "9999-12-31";
    if (dueA !== dueB) return dueA.localeCompare(dueB);
    return (b.created_at ?? "").localeCompare(a.created_at ?? "");
  });
}

function getDepartmentName(task: Awaited<ReturnType<typeof getTasks>>[number]) {
  const department = Array.isArray(task.departments)
    ? task.departments[0]
    : task.departments;
  return (
    department?.name?.trim() ||
    department?.code?.trim() ||
    task.departmentName ||
    "Sin departamento"
  );
}

function buildTimeSeries(
  tasks: Awaited<ReturnType<typeof getTasks>>,
  days = 30,
): AnalyticsTimeSeriesPoint[] {
  const today = new Date();
  const start = subDays(today, days - 1);
  return eachDayOfInterval({ start, end: today }).map((day) => {
    const iso = isoDay(day);
    const created = tasks.filter(
      (task) => task.created_at?.slice(0, 10) === iso,
    ).length;
    const completed = tasks.filter(
      (task) =>
        task.status === TASK_STATUS.DONE &&
        task.updated_at?.slice(0, 10) === iso,
    ).length;
    const activeDue = tasks.filter(
      (task) =>
        task.status !== TASK_STATUS.DONE &&
        task.status !== TASK_STATUS.WAITING &&
        task.due_date?.slice(0, 10) === iso,
    ).length;
    return { label: format(day, "dd MMM"), iso, created, completed, activeDue };
  });
}

function buildWorkload(
  tasks: Awaited<ReturnType<typeof getTasks>>,
): AnalyticsWorkloadItem[] {
  const map = new Map<string, AnalyticsWorkloadItem>();
  for (const task of tasks.filter((item) => item.status !== TASK_STATUS.DONE)) {
    const label = task.client_name?.trim() || getDepartmentName(task);
    const current = map.get(label) ?? {
      label,
      active: 0,
      waiting: 0,
      overdue: 0,
      total: 0,
    };
    if (task.status === TASK_STATUS.WAITING) current.waiting += 1;
    else current.active += 1;
    if (isTaskOverdue(task.due_date, task.status)) current.overdue += 1;
    current.total += 1;
    map.set(label, current);
  }
  return Array.from(map.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);
}

function buildProjectProgress(
  tasks: Awaited<ReturnType<typeof getTasks>>,
  projects: Awaited<ReturnType<typeof getProjects>>,
): AnalyticsProjectProgressItem[] {
  const projectTitle = new Map(
    projects.map((project) => [project.id, project.title]),
  );
  const map = new Map<string, AnalyticsProjectProgressItem>();
  for (const task of tasks.filter((item) => item.project_id)) {
    const id = task.project_id as string;
    const current = map.get(id) ?? {
      id,
      title: projectTitle.get(id) ?? "Proyecto sin nombre",
      active: 0,
      waiting: 0,
      completed: 0,
      total: 0,
      percent: 0,
    };
    if (task.status === TASK_STATUS.DONE) current.completed += 1;
    else if (task.status === TASK_STATUS.WAITING) current.waiting += 1;
    else current.active += 1;
    current.total += 1;
    current.percent = current.total
      ? Math.round((current.completed / current.total) * 100)
      : 0;
    map.set(id, current);
  }
  return Array.from(map.values())
    .sort((a, b) => b.percent - a.percent || b.total - a.total)
    .slice(0, 6);
}

async function getTableCount(table: "attachments" | "comments") {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from(table)
    .select("id", { count: "exact", head: true });
  if (error) return 0;
  return count ?? 0;
}

async function getLatestCommentsByTaskIds(taskIds: string[]) {
  const uniqueTaskIds = Array.from(new Set(taskIds.filter(Boolean)));
  const latestComments = new Map<string, string | null>();
  if (!uniqueTaskIds.length) return latestComments;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comments")
    .select("task_id,content,created_at")
    .in("task_id", uniqueTaskIds)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getLatestCommentsByTaskIds]", error.message);
    return latestComments;
  }

  for (const row of data ?? []) {
    const taskId = String(row.task_id ?? "");
    if (!taskId || latestComments.has(taskId)) continue;
    latestComments.set(taskId, String(row.content ?? "").trim() || null);
  }

  return latestComments;
}

async function getChecklistProgressByTaskIds(
  taskIds: string[],
  doneTaskIds: Set<string>,
) {
  const uniqueTaskIds = Array.from(new Set(taskIds.filter(Boolean)));
  const progressByTask = new Map<string, TaskProgressSnapshot>();
  if (!uniqueTaskIds.length) return progressByTask;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("task_checklist_items")
    .select("task_id,done")
    .in("task_id", uniqueTaskIds);

  if (error) {
    console.error("[getChecklistProgressByTaskIds]", error.message);
    return progressByTask;
  }

  const totals = new Map<string, { total: number; done: number }>();
  for (const row of data ?? []) {
    const taskId = String(row.task_id ?? "");
    if (!taskId) continue;
    const current = totals.get(taskId) ?? { total: 0, done: 0 };
    current.total += 1;
    if (Boolean(row.done)) current.done += 1;
    totals.set(taskId, current);
  }

  for (const taskId of uniqueTaskIds) {
    const current = totals.get(taskId);
    if (!current || current.total === 0) {
      progressByTask.set(taskId, {
        progressPercent: doneTaskIds.has(taskId) ? 100 : 0,
        checklistDone: 0,
        checklistTotal: 0,
      });
      continue;
    }
    progressByTask.set(taskId, {
      progressPercent: Math.round((current.done / current.total) * 100),
      checklistDone: current.done,
      checklistTotal: current.total,
    });
  }

  return progressByTask;
}

function estimateAverageCloseDays(tasks: Awaited<ReturnType<typeof getTasks>>) {
  const closed = tasks.filter(
    (task) =>
      task.status === TASK_STATUS.DONE && task.created_at && task.updated_at,
  );
  if (!closed.length) return 0;
  const total = closed.reduce((sum, task) => {
    const created = safeParse(task.created_at);
    const updated = safeParse(task.updated_at);
    if (!created || !updated) return sum;
    return sum + Math.max(0, differenceInCalendarDays(updated, created));
  }, 0);
  return Math.round(total / closed.length);
}

export const getWorkspaceAnalyticsSummary = cache(
  async (): Promise<WorkspaceAnalyticsSummary | null> => {
    const organizationContext = await getOrganizationContext();
    const activeOrganizationId =
      organizationContext?.activeOrganization?.id ?? null;

    const [
      dashboard,
      reports,
      risk,
      onboarding,
      usage,
      activity,
      allTasks,
      allProjects,
      attachmentsCount,
      commentsCount,
    ] = await Promise.all([
      getDashboardData(),
      getReportsOverview(),
      getRiskRadarSummary(),
      getWorkspaceOnboardingSummary(),
      getUsageEventMetrics(activeOrganizationId),
      getRecentActivitySummary(10),
      getTasks({ includeCompleted: true }),
      getProjects({}),
      getTableCount("attachments"),
      getTableCount("comments"),
    ]);

    const readinessScore = onboarding?.score ?? 0;
    const completionRate = reports.kpis.completionRate;
    const riskScore = risk.kpis.riskScore;
    const activeTasks = allTasks.filter(
      (task) => task.status !== TASK_STATUS.DONE,
    );
    const operationalTasks = activeTasks.filter(
      (task) => task.status !== TASK_STATUS.WAITING,
    );
    const waitingTasks = activeTasks.filter(
      (task) => task.status === TASK_STATUS.WAITING,
    );
    const completedTasks = allTasks.filter(
      (task) => task.status === TASK_STATUS.DONE,
    );
    const overdueActiveTasks = operationalTasks.filter((task) =>
      isTaskOverdue(task.due_date, task.status),
    );
    const overdueLoad =
      overdueActiveTasks.length + reports.kpis.overdueProjects;
    const activityLast48h = activity.counts.total;
    const adoptionScore = clamp(
      Math.round(
        usage.loginEvents * 8 +
          usage.projectEvents * 6 +
          usage.taskEvents * 4 +
          activityLast48h * 2,
      ),
    );
    const intelligenceScore = clamp(
      Math.round(
        readinessScore * 0.25 +
          completionRate * 0.25 +
          (100 - riskScore) * 0.25 +
          Math.max(0, 100 - overdueLoad * 10) * 0.25,
      ),
    );
    const healthScore = clamp(
      Math.round(
        completionRate * 0.35 +
          readinessScore * 0.2 +
          (100 - riskScore) * 0.2 +
          Math.max(0, 100 - overdueLoad * 8) * 0.25,
      ),
    );
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const dueThisWeekActiveTasks = operationalTasks.filter((task) => {
      const due = safeParse(task.due_date);
      return due
        ? isWithinInterval(due, { start: weekStart, end: weekEnd })
        : false;
    });

    const weeklyFocus: WorkspaceAnalyticsSummary["weeklyFocus"] =
      reports.focusTasks.map((item) => ({
        id: item.id,
        title: item.title,
        meta: `${item.clientName} · ${item.dueLabel}`,
        statusLabel: statusLabel(item.status),
        tone:
          item.urgency === "overdue"
            ? "critical"
            : item.urgency === "today"
              ? "attention"
              : "stable",
        source: "Tasks",
      }));

    const projectPipeline: WorkspaceAnalyticsSummary["projectPipeline"] =
      reports.projectWatchlist.map((item) => ({
        id: item.id,
        title: item.title,
        meta: `${item.clientName} · ${item.dueLabel}`,
        statusLabel: item.status
          .replaceAll("_", " ")
          .replace(/\b\w/g, (char) => char.toUpperCase()),
        tone:
          item.urgency === "overdue"
            ? "critical"
            : item.urgency === "this_week"
              ? "attention"
              : "stable",
        source: "Projects",
      }));

    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const activeProjects = allProjects.filter(
      (project) => !isCompletedProject(project),
    );

    const importantTasks = sortByDateWeight(
      operationalTasks.filter(isImportantTask),
    );

    const nonImportantOperationalTasks = operationalTasks.filter(
      (task) => !isImportantTask(task),
    );
    const nonWaitingActiveProjects = activeProjects;

    const currentWeekTasks = sortByDateWeight(
      nonImportantOperationalTasks.filter((task) => {
        const due = safeParse(task.due_date);
        return due
          ? isWithinInterval(due, { start: weekStart, end: weekEnd })
          : false;
      }),
    );

    const currentWeekProjects = sortByDateWeight(
      nonWaitingActiveProjects.filter((project) => {
        const due = safeParse(project.due_date);
        return due
          ? isWithinInterval(due, { start: weekStart, end: weekEnd })
          : false;
      }),
    );

    const currentMonthTasks = sortByDateWeight(
      nonImportantOperationalTasks.filter((task) => {
        const due = safeParse(task.due_date);
        return due
          ? isWithinInterval(due, { start: monthStart, end: monthEnd }) &&
              !isWithinInterval(due, { start: weekStart, end: weekEnd })
          : false;
      }),
    );

    const currentMonthProjects = sortByDateWeight(
      nonWaitingActiveProjects.filter((project) => {
        const due = safeParse(project.due_date);
        return due
          ? isWithinInterval(due, { start: monthStart, end: monthEnd }) &&
              !isWithinInterval(due, { start: weekStart, end: weekEnd })
          : false;
      }),
    );

    const upcomingTasks = sortByDateWeight(
      nonImportantOperationalTasks.filter((task) => {
        const due = safeParse(task.due_date);
        return due ? isAfter(due, monthEnd) : false;
      }),
    );

    const upcomingProjects = sortByDateWeight(
      nonWaitingActiveProjects.filter((project) => {
        const due = safeParse(project.due_date);
        return due ? isAfter(due, monthEnd) : false;
      }),
    );

    const undatedTasks = sortByDateWeight(
      nonImportantOperationalTasks.filter((task) => !safeParse(task.due_date)),
    );
    const undatedProjects = sortByDateWeight(
      nonWaitingActiveProjects.filter(
        (project) => !safeParse(project.due_date),
      ),
    );

    const allTaskIds = allTasks.map((task) => task.id);
    const reportTaskIds = Array.from(
      new Set(
        [
          ...importantTasks,
          ...currentWeekTasks,
          ...currentMonthTasks,
          ...upcomingTasks,
          ...undatedTasks,
          ...waitingTasks,
        ].map((task) => task.id),
      ),
    );
    const doneTaskIds = new Set(
      allTasks
        .filter((task) => task.status === TASK_STATUS.DONE)
        .map((task) => task.id),
    );
    const [latestCommentsByTaskId, checklistProgressByTaskId] =
      await Promise.all([
        getLatestCommentsByTaskIds(reportTaskIds),
        getChecklistProgressByTaskIds(allTaskIds, doneTaskIds),
      ]);
    const reportItemForTask = (
      task: Awaited<ReturnType<typeof getTasks>>[number],
    ) =>
      buildReportTaskItem(
        task,
        latestCommentsByTaskId.get(task.id) ?? null,
        checklistProgressByTaskId.get(task.id) ??
          (task.status === TASK_STATUS.DONE
            ? { progressPercent: 100, checklistDone: 0, checklistTotal: 0 }
            : EMPTY_PROGRESS),
      );

    const progressSnapshots = allTasks
      .map((task) => checklistProgressByTaskId.get(task.id))
      .filter((item): item is TaskProgressSnapshot => Boolean(item));
    const tasksWithChecklist = progressSnapshots.filter(
      (item) => item.checklistTotal > 0,
    ).length;
    const averageTaskProgress = tasksWithChecklist
      ? Math.round(
          progressSnapshots
            .filter((item) => item.checklistTotal > 0)
            .reduce((sum, item) => sum + item.progressPercent, 0) /
            tasksWithChecklist,
        )
      : 0;

    const importantItems = importantTasks.slice(0, 16).map(reportItemForTask);
    const currentWeekItems = [
      ...currentWeekTasks.map(reportItemForTask),
      ...currentWeekProjects.map((project) => buildProjectReportItem(project)),
    ].slice(0, 20);
    const currentMonthItems = [
      ...currentMonthTasks.map(reportItemForTask),
      ...currentMonthProjects.map((project) => buildProjectReportItem(project)),
    ].slice(0, 24);
    const upcomingItems = [
      ...upcomingTasks.map(reportItemForTask),
      ...upcomingProjects.map((project) => buildProjectReportItem(project)),
    ].slice(0, 24);
    const undatedItems = [
      ...undatedTasks.map(reportItemForTask),
      ...undatedProjects.map((project) => buildProjectReportItem(project)),
    ].slice(0, 24);

    const priorityCount = importantItems.length;
    const weekCount = currentWeekItems.length;
    const monthCount = currentMonthItems.length;
    const upcomingCount = upcomingItems.length;
    const undatedCount = undatedItems.length;

    const deadlineItems = [
      ...importantItems.map((item) => ({
        id: item.id,
        title: item.title,
        meta: `${item.itemType} · ${item.clientLabel} · ${item.deadlineLabel}`,
        statusLabel: item.statusLabel,
        tone: "attention" as const,
        source:
          item.itemType === "Proyecto"
            ? ("Projects" as const)
            : ("Tasks" as const),
      })),
      ...currentWeekItems.map((item) => ({
        id: item.id,
        title: item.title,
        meta: `${item.itemType} · ${item.clientLabel} · ${item.deadlineLabel}`,
        statusLabel: item.statusLabel,
        tone: "stable" as const,
        source:
          item.itemType === "Proyecto"
            ? ("Projects" as const)
            : ("Tasks" as const),
      })),
    ]
      .filter((item) => !item.meta.includes("Sin fecha"))
      .slice(0, 6);

    const recommendations: string[] = [];
    if (importantItems.length > 0)
      recommendations.push(
        `${importantItems.length} elemento(s) marcados con estrella salen como Importantes en el reporte.`,
      );
    if (currentWeekItems.length > 0)
      recommendations.push(
        `${currentWeekItems.length} elemento(s) sin estrella están programados para la semana actual.`,
      );
    if (currentMonthItems.length > 0)
      recommendations.push(
        `${currentMonthItems.length} elemento(s) sin estrella quedan para el mes actual fuera de esta semana.`,
      );
    if (overdueActiveTasks.length > 0)
      recommendations.push(
        `${overdueActiveTasks.length} tarea(s) activas están vencidas. Las concluidas y en espera no se cuentan como atraso.`,
      );
    if (waitingTasks.length > 0)
      recommendations.push(
        `${waitingTasks.length} tarea(s) están en espera. Conviene revisar bloqueos por cliente, jefatura o proveedor.`,
      );
    if (risk.kpis.pressuredClients > 0)
      recommendations.push(
        `${risk.kpis.pressuredClients} cliente(s) muestran presión operativa. Revisa seguimiento y capacidad.`,
      );
    if (!recommendations.length)
      recommendations.push(
        "El workspace viene estable. Mantén foco en importantes, semana actual y desbloqueos.",
      );

    const shareSummary: string[] = [
      `${importantItems.length} elemento(s) marcados con estrella se reportan como Importantes.`,
      `${currentWeekItems.length} elemento(s) sin estrella quedan en Semana actual.`,
      `${currentMonthItems.length} elemento(s) sin estrella quedan en Mes actual.`,
      `${waitingTasks.length} tarea(s) están en espera y se reportan separadas para no contaminar fechas.`,
      `${completedTasks.length} tarea(s) concluidas quedan fuera de operación por defecto.`,
    ];

    const waitingBase = sortByDateWeight(waitingTasks).slice(0, 12);
    const waitingReportTasks = waitingBase.map(reportItemForTask);

    return {
      organizationName:
        organizationContext?.activeOrganization?.name ?? "Workspace personal",
      generatedAtLabel: now.toLocaleString("es-CR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      kpis: {
        healthScore,
        intelligenceScore,
        readinessScore,
        completionRate,
        adoptionScore,
        activityLast48h,
      },
      pipeline: {
        activeTasks: activeTasks.length,
        dueThisWeek: dueThisWeekActiveTasks.length,
        waitingTasks: waitingTasks.length,
        activeProjects: allProjects.filter(
          (project) => project.status !== "completado",
        ).length,
        clients: reports.kpis.clients,
        overdueLoad,
      },
      adoption: usage,
      realMetrics: {
        totalTasks: allTasks.length,
        operationalTasks: operationalTasks.length,
        completedTasks: completedTasks.length,
        waitingTasks: waitingTasks.length,
        overdueActiveTasks: overdueActiveTasks.length,
        dueThisWeekActiveTasks: dueThisWeekActiveTasks.length,
        attachmentsCount,
        commentsCount,
        avgCloseDays: estimateAverageCloseDays(allTasks),
        averageTaskProgress,
        tasksWithChecklist,
      },
      timeSeries: buildTimeSeries(allTasks),
      statusDistribution: [
        {
          status: TASK_STATUS.PENDING,
          label: "Pendiente",
          count: allTasks.filter((task) => task.status === TASK_STATUS.PENDING)
            .length,
          color: "#0EA5E9",
        },
        {
          status: TASK_STATUS.IN_PROGRESS,
          label: "En curso",
          count: allTasks.filter(
            (task) => task.status === TASK_STATUS.IN_PROGRESS,
          ).length,
          color: "#3B82F6",
        },
        {
          status: TASK_STATUS.PRODUCTION,
          label: "Producción",
          count: allTasks.filter(
            (task) => task.status === TASK_STATUS.PRODUCTION,
          ).length,
          color: "#8B5CF6",
        },
        {
          status: TASK_STATUS.WAITING,
          label: "En espera",
          count: waitingTasks.length,
          color: "#F59E0B",
        },
        {
          status: TASK_STATUS.REVIEW,
          label: "Revisión",
          count: allTasks.filter((task) => task.status === TASK_STATUS.REVIEW)
            .length,
          color: "#D946EF",
        },
        {
          status: TASK_STATUS.DONE,
          label: "Concluido",
          count: completedTasks.length,
          color: "#16C784",
        },
      ],
      workload: buildWorkload(allTasks),
      projectProgress: buildProjectProgress(allTasks, allProjects),
      weeklyFocus,
      projectPipeline,
      shareDigest: {
        priorityCount,
        weekCount,
        monthCount,
        upcomingCount,
        undatedCount,
        inProgressCount: operationalTasks.length,
        waitingCount: waitingTasks.length,
        completedCount: completedTasks.length,
        deadlineItems,
        shareSummary,
      },
      reportModules: {
        importantItems,
        currentWeekItems,
        currentMonthItems,
        upcomingItems,
        undatedItems,
        waitingTasks: waitingReportTasks,
      },
      recommendations: recommendations.slice(0, 5),
    };
  },
);
