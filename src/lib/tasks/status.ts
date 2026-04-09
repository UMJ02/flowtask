export const TASK_OVERDUE_EXCLUDED_STATUSES = new Set(["concluido", "en_espera"]);

export function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export function isTaskOverdue(dueDate?: string | null, status?: string | null) {
  if (!dueDate || TASK_OVERDUE_EXCLUDED_STATUSES.has(status ?? "")) return false;
  return dueDate < todayIsoDate();
}

export function getTaskStatusUpdatePayload(nextStatus: string, currentDueDate?: string | null) {
  return {
    status: nextStatus,
    due_date: nextStatus === "en_proceso" || nextStatus === "concluido" ? todayIsoDate() : (currentDueDate ?? null),
  };
}
