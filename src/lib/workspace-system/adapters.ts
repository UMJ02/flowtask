import type { ProjectSummary } from "@/types/project";
import type { TaskSummary } from "@/types/task";
import type { WorkspaceProjectSummary, WorkspaceTaskItem } from "./view-state";

function cleanString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

export function mapTaskToWorkspaceItem(task: TaskSummary): WorkspaceTaskItem {
  const departmentName = cleanString(task.departmentName ?? (Array.isArray(task.departments) ? task.departments[0]?.name : task.departments?.name));
  const clientName = cleanString(task.clientName ?? task.client_name);
  return {
    id: task.id,
    title: task.title || "Tarea sin título",
    status: task.status ?? "pendiente",
    priority: task.priority ?? "media",
    dueDate: task.dueDate ?? task.due_date ?? null,
    assigneeName: null,
    projectId: task.project_id ?? null,
    clientName,
    departmentName,
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
