export function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export function shouldRefreshDueDateForStatus(status: string) {
  return status === "en_proceso" || status === "concluido";
}

export function isTaskConsideredOpen(status?: string | null) {
  return status !== "concluido";
}

export function isTaskOverdue(dueDate?: string | null, status?: string | null) {
  if (!dueDate || !isTaskConsideredOpen(status) || status === "en_espera") return false;
  return dueDate < todayIsoDate();
}

export function isTaskDueToday(dueDate?: string | null, status?: string | null) {
  if (!dueDate || !isTaskConsideredOpen(status) || status === "en_espera") return false;
  return dueDate === todayIsoDate();
}

export function buildTaskStatusUpdate(nextStatus: string, currentDueDate?: string | null) {
  if (shouldRefreshDueDateForStatus(nextStatus)) {
    return { status: nextStatus, due_date: todayIsoDate() };
  }
  return { status: nextStatus, due_date: currentDueDate ?? null };
}
