export type TaskLifecycleStatus = string | null | undefined;

const DATE_STATUSES = new Set(["en_proceso", "concluido"]);
const NON_OVERDUE_STATUSES = new Set(["concluido", "en_espera"]);

export function shouldRefreshTaskDateOnStatusChange(status: TaskLifecycleStatus) {
  return DATE_STATUSES.has(status ?? "");
}

export function getTaskDateForStatusChange(status: TaskLifecycleStatus) {
  if (!shouldRefreshTaskDateOnStatusChange(status)) return undefined;
  return new Date().toISOString().slice(0, 10);
}

export function isTaskOverdue(dueDate?: string | null, status?: TaskLifecycleStatus) {
  if (!dueDate) return false;
  if (NON_OVERDUE_STATUSES.has(status ?? "")) return false;
  return dueDate < new Date().toISOString().slice(0, 10);
}

export function isTaskOpen(status?: TaskLifecycleStatus) {
  return (status ?? "") !== "concluido";
}
