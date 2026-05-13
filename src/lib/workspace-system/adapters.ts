import type { ProjectSummary } from "@/types/project";
import type { TaskSummary } from "@/types/task";
import type { WorkspaceProjectSummary, WorkspaceSpaceSummary, WorkspaceTaskItem } from "./view-state";

function cleanString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

export function slugifyWorkspaceValue(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "workspace";
}

export function mapTaskToWorkspaceItem(task: TaskSummary, projectTitleById: Map<string, string> = new Map()): WorkspaceTaskItem {
  const departmentName = cleanString(task.departmentName ?? (Array.isArray(task.departments) ? task.departments[0]?.name : task.departments?.name));
  const clientName = cleanString(task.clientName ?? task.client_name);
  const projectId = task.project_id ?? null;
  return {
    id: task.id,
    title: task.title || "Tarea sin título",
    status: task.status ?? "pendiente",
    priority: task.priority ?? "media",
    dueDate: task.dueDate ?? task.due_date ?? null,
    assigneeName: null,
    projectId,
    projectTitle: projectId ? projectTitleById.get(projectId) ?? null : null,
    clientName,
    departmentName,
    country: task.country ?? null,
    isOverdue: Boolean(task.isOverdue),
    isDueToday: Boolean(task.isDueToday),
    tags: [departmentName, clientName, task.country].filter(Boolean) as string[],
  };
}

export function mapProjectToWorkspaceSummary(project: ProjectSummary): WorkspaceProjectSummary {
  const departmentName = cleanString(project.departmentName ?? (Array.isArray(project.departments) ? project.departments[0]?.name : project.departments?.name));
  return {
    id: project.id,
    title: project.title || "Proyecto sin título",
    status: project.status ?? "activo",
    progress: project.projectTaskProgress ?? (project.status === "completado" ? 100 : 0),
    dueDate: project.dueDate ?? project.due_date ?? null,
    membersCount: project.isCollaborative || project.is_collaborative ? 2 : 1,
    taskTotal: project.projectTaskTotal ?? 0,
    clientName: project.clientName ?? project.client_name ?? null,
    departmentName,
    country: project.country ?? null,
  };
}

export function groupTasksByStatus(tasks: WorkspaceTaskItem[]) {
  return {
    inProgress: tasks.filter((task) => ["en_proceso", "produccion", "activo", "revision"].includes(task.status)),
    waiting: tasks.filter((task) => ["en_espera", "pendiente"].includes(task.status)),
    completed: tasks.filter((task) => ["concluido", "completado"].includes(task.status)),
  };
}

export function getTaskProgress(tasks: WorkspaceTaskItem[]) {
  const total = tasks.length;
  const completed = tasks.filter((task) => ["concluido", "completado"].includes(task.status)).length;
  return total ? Math.round((completed / total) * 100) : 0;
}

export function normalizeWorkspaceView(value?: string | string[] | null) {
  const raw = Array.isArray(value) ? value[0] : value;
  const allowed = new Set(["list", "board", "timeline", "table", "canvas", "files", "reports"]);
  return allowed.has(raw ?? "") ? raw : "list";
}

export function getSpaceKeyFromTask(task: WorkspaceTaskItem) {
  return slugifyWorkspaceValue(task.departmentName ?? task.clientName ?? "Operación");
}

export function getSpaceKeyFromProject(project: WorkspaceProjectSummary) {
  return slugifyWorkspaceValue(project.departmentName ?? project.clientName ?? "Operación");
}

export function buildWorkspaceSpaces(tasks: WorkspaceTaskItem[], projects: WorkspaceProjectSummary[]): WorkspaceSpaceSummary[] {
  const spaces = new Map<string, WorkspaceSpaceSummary>();
  const ensure = (name: string, source: WorkspaceSpaceSummary["source"]) => {
    const slug = slugifyWorkspaceValue(name);
    const current = spaces.get(slug) ?? { id: slug, name, slug, source, taskCount: 0, projectCount: 0 };
    spaces.set(slug, current);
    return current;
  };

  for (const project of projects) {
    const label = project.departmentName ?? project.clientName ?? "Operación";
    const space = ensure(label, project.departmentName ? "department" : project.clientName ? "client" : "general");
    space.projectCount += 1;
  }

  for (const task of tasks) {
    const label = task.departmentName ?? task.clientName ?? "Operación";
    const space = ensure(label, task.departmentName ? "department" : task.clientName ? "client" : "general");
    space.taskCount += 1;
  }

  return [...spaces.values()].sort((a, b) => (b.taskCount + b.projectCount) - (a.taskCount + a.projectCount) || a.name.localeCompare(b.name)).slice(0, 8);
}

export function filterTasksForWorkspace(tasks: WorkspaceTaskItem[], filters: { projectId?: string | null; spaceSlug?: string | null; status?: string | null }) {
  return tasks.filter((task) => {
    if (filters.projectId && task.projectId !== filters.projectId) return false;
    if (filters.spaceSlug && getSpaceKeyFromTask(task) !== filters.spaceSlug) return false;
    if (filters.status && filters.status !== "todos" && task.status !== filters.status) return false;
    return true;
  });
}

export function filterProjectsForWorkspace(projects: WorkspaceProjectSummary[], filters: { spaceSlug?: string | null }) {
  return projects.filter((project) => !filters.spaceSlug || getSpaceKeyFromProject(project) === filters.spaceSlug);
}
