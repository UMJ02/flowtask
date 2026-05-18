export const TASK_STATUS = {
  PENDING: "pendiente",
  IN_PROGRESS: "en_proceso",
  PRODUCTION: "produccion",
  WAITING: "en_espera",
  REVIEW: "revision",
  DONE: "concluido",
} as const;

export const TASK_OVERDUE_EXCLUDED_STATUSES = new Set<string>([TASK_STATUS.DONE, TASK_STATUS.WAITING]);
export const TASK_DEFAULT_HIDDEN_STATUSES = new Set<string>([TASK_STATUS.DONE]);

export function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export function normalizeTaskStatus(status?: string | null) {
  if (status === TASK_STATUS.DONE) return TASK_STATUS.DONE;
  if (status === TASK_STATUS.WAITING) return TASK_STATUS.WAITING;
  if (status === TASK_STATUS.PRODUCTION) return TASK_STATUS.PRODUCTION;
  if (status === TASK_STATUS.REVIEW) return TASK_STATUS.REVIEW;
  if (status === TASK_STATUS.PENDING) return TASK_STATUS.PENDING;
  return TASK_STATUS.IN_PROGRESS;
}

export function isTaskDone(status?: string | null) {
  return normalizeTaskStatus(status) === TASK_STATUS.DONE;
}

export function isTaskWaiting(status?: string | null) {
  return normalizeTaskStatus(status) === TASK_STATUS.WAITING;
}

export function isTaskOperationallyActive(status?: string | null) {
  const normalized = normalizeTaskStatus(status);
  return normalized === TASK_STATUS.IN_PROGRESS || normalized === TASK_STATUS.PRODUCTION || normalized === TASK_STATUS.REVIEW || normalized === TASK_STATUS.PENDING;
}

export function shouldHideTaskByDefault(status?: string | null) {
  return TASK_DEFAULT_HIDDEN_STATUSES.has(normalizeTaskStatus(status));
}

export function isTaskOverdue(dueDate?: string | null, status?: string | null) {
  if (!dueDate) return false;
  return isTaskOperationallyActive(status) && dueDate.slice(0, 10) < todayIsoDate();
}

export function daysSince(value?: string | null) {
  if (!value) return 0;
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  const today = new Date(`${todayIsoDate()}T12:00:00`);
  if (Number.isNaN(date.getTime())) return 0;
  return Math.max(0, Math.floor((today.getTime() - date.getTime()) / 86400000));
}

export function getTaskStandbyDays(task: { updated_at?: string | null; created_at?: string | null; status?: string | null }) {
  if (!isTaskWaiting(task.status)) return 0;
  return daysSince(task.updated_at ?? task.created_at ?? null);
}

export function getTaskStatusLabel(status?: string | null) {
  const normalized = normalizeTaskStatus(status);
  if (normalized === TASK_STATUS.DONE) return "Concluido";
  if (normalized === TASK_STATUS.PRODUCTION) return "Producción";
  if (normalized === TASK_STATUS.REVIEW) return "Revisión";
  if (normalized === TASK_STATUS.PENDING) return "Pendiente";
  if (normalized === TASK_STATUS.WAITING) return "En espera";
  return "En curso";
}

export function getTaskStatusColor(status?: string | null) {
  const normalized = normalizeTaskStatus(status);
  if (normalized === TASK_STATUS.DONE) return "emerald";
  if (normalized === TASK_STATUS.PRODUCTION) return "violet";
  if (normalized === TASK_STATUS.REVIEW) return "fuchsia";
  if (normalized === TASK_STATUS.PENDING) return "sky";
  if (normalized === TASK_STATUS.WAITING) return "amber";
  return "blue";
}

export function getTaskStatusUpdatePayload(nextStatus: string, currentDueDate?: string | null) {
  const normalized = normalizeTaskStatus(nextStatus);
  return currentDueDate === undefined
    ? { status: normalized }
    : { status: normalized, due_date: currentDueDate };
}
