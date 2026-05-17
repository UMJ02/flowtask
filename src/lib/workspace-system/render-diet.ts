import type {
  WorkspaceActivityItem,
  WorkspaceBoardSummary,
  WorkspaceFileSummary,
  WorkspaceProjectSummary,
  WorkspaceProjectViewPreference,
  WorkspaceTaskItem,
} from "@/lib/workspace-system/view-state";

export type WorkspaceProDerivedData = {
  metrics: {
    done: number;
    important: number;
    overdue: number;
    today: number;
    progress: number;
  };
  importantTasks: WorkspaceTaskItem[];
  upcomingTasks: WorkspaceTaskItem[];
  activeProjects: WorkspaceProjectSummary[];
  activityPreview: WorkspaceActivityItem[];
  boardsPreview: WorkspaceBoardSummary[];
  filesPreview: WorkspaceFileSummary[];
  projectViewsPreview: WorkspaceProjectViewPreference[];
  projectTaskMap: Record<string, WorkspaceTaskItem[]>;
  boardColumns: Record<string, WorkspaceTaskItem[]>;
};

const DONE_STATUSES = new Set(["concluido", "completado", "done", "hecho"]);
const BOARD_STATUS_KEYS = ["pendiente", "en_proceso", "produccion", "en_espera", "revision", "concluido"] as const;

function isTaskDone(status?: string | null) {
  return DONE_STATUSES.has(String(status ?? "").toLowerCase());
}

function normalizeBoardColumn(status?: string | null) {
  const value = String(status ?? "").toLowerCase();
  if (value === "pendiente") return "pendiente";
  if (value === "produccion") return "produccion";
  if (value === "en_espera" || value === "waiting") return "en_espera";
  if (value === "revision") return "revision";
  if (DONE_STATUSES.has(value)) return "concluido";
  return "en_proceso";
}

export function getWorkspaceProDerivedData(input: {
  tasks: WorkspaceTaskItem[];
  projects: WorkspaceProjectSummary[];
  boards: WorkspaceBoardSummary[];
  files: WorkspaceFileSummary[];
  activity: WorkspaceActivityItem[];
  projectViews: WorkspaceProjectViewPreference[];
}): WorkspaceProDerivedData {
  const projectTaskMap: Record<string, WorkspaceTaskItem[]> = {};
  const boardColumns: Record<string, WorkspaceTaskItem[]> = Object.fromEntries(BOARD_STATUS_KEYS.map((key) => [key, []]));
  const importantTasks: WorkspaceTaskItem[] = [];
  const upcomingTasks: WorkspaceTaskItem[] = [];

  let done = 0;
  let important = 0;
  let overdue = 0;
  let today = 0;

  for (const task of input.tasks) {
    if (isTaskDone(task.status)) done += 1;
    if (String(task.priority ?? "").toLowerCase() === "alta") {
      important += 1;
      if (importantTasks.length < 5) importantTasks.push(task);
    }
    if (task.isOverdue) overdue += 1;
    if (task.isDueToday) today += 1;
    if (task.dueDate && !isTaskDone(task.status) && upcomingTasks.length < 5) upcomingTasks.push(task);

    if (task.projectId) {
      (projectTaskMap[task.projectId] ??= []).push(task);
    }
    boardColumns[normalizeBoardColumn(task.status)].push(task);
  }

  const activeProjects = input.projects
    .filter((project) => String(project.status ?? "").toLowerCase() !== "completado")
    .slice(0, 5);

  return {
    metrics: {
      done,
      important,
      overdue,
      today,
      progress: input.tasks.length ? Math.round((done / input.tasks.length) * 100) : 0,
    },
    importantTasks,
    upcomingTasks,
    activeProjects,
    activityPreview: input.activity.slice(0, 5),
    boardsPreview: input.boards.slice(0, 8),
    filesPreview: input.files.slice(0, 18),
    projectViewsPreview: input.projectViews.slice(0, 8),
    projectTaskMap,
    boardColumns,
  };
}
