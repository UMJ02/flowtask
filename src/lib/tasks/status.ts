export const TASK_STATUS = {
  PENDING: "pendiente",
  IN_PROGRESS: "en_proceso",
  PRODUCTION: "produccion",
  WAITING: "en_espera",
  REVIEW: "revision",
  DONE: "concluido",
} as const;

export const TASK_DUE_ELIGIBLE_STATUSES = new Set<string>([TASK_STATUS.PENDING, TASK_STATUS.IN_PROGRESS, TASK_STATUS.PRODUCTION]);
export const TASK_STANDBY_STATUSES = new Set<string>([TASK_STATUS.WAITING, TASK_STATUS.REVIEW]);
export const TASK_OVERDUE_EXCLUDED_STATUSES = new Set<string>([TASK_STATUS.DONE, TASK_STATUS.WAITING, TASK_STATUS.REVIEW]);
export const TASK_DEFAULT_HIDDEN_STATUSES = new Set<string>([TASK_STATUS.DONE]);
export const TASK_STANDBY_FOLLOWUP_DAYS = 5;

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

export function isTaskOpen(status?: string | null) {
  return normalizeTaskStatus(status) !== TASK_STATUS.DONE;
}

export function isTaskDueEligible(status?: string | null) {
  return TASK_DUE_ELIGIBLE_STATUSES.has(normalizeTaskStatus(status));
}

export function isTaskStandby(status?: string | null) {
  return TASK_STANDBY_STATUSES.has(normalizeTaskStatus(status));
}

export function isTaskOperationallyActive(status?: string | null) {
  return isTaskDueEligible(status);
}

export function shouldHideTaskByDefault(status?: string | null) {
  return TASK_DEFAULT_HIDDEN_STATUSES.has(normalizeTaskStatus(status));
}

export function isTaskOverdue(dueDate?: string | null, status?: string | null) {
  if (!dueDate) return false;
  return isTaskDueEligible(status) && dueDate.slice(0, 10) < todayIsoDate();
}

export function daysSince(value?: string | null) {
  if (!value) return 0;
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  const today = new Date(`${todayIsoDate()}T12:00:00`);
  if (Number.isNaN(date.getTime())) return 0;
  return Math.max(0, Math.floor((today.getTime() - date.getTime()) / 86400000));
}

export function isTaskDueToday(dueDate?: string | null, status?: string | null) {
  if (!dueDate) return false;
  return isTaskDueEligible(status) && dueDate.slice(0, 10) === todayIsoDate();
}

export function isTaskDueSoon(dueDate?: string | null, status?: string | null, days = 3) {
  if (!dueDate || !isTaskDueEligible(status)) return false;
  const due = dueDate.slice(0, 10);
  const today = todayIsoDate();
  const limit = new Date(`${today}T12:00:00`);
  limit.setDate(limit.getDate() + days);
  const limitIso = limit.toISOString().slice(0, 10);
  return due > today && due <= limitIso;
}

export function getTaskStandbyDays(task: { updated_at?: string | null; created_at?: string | null; status?: string | null }) {
  if (!isTaskStandby(task.status)) return 0;
  return daysSince(task.updated_at ?? task.created_at ?? null);
}

export function needsTaskStandbyFollowup(task: { updated_at?: string | null; created_at?: string | null; status?: string | null }, minDays = TASK_STANDBY_FOLLOWUP_DAYS) {
  return getTaskStandbyDays(task) >= minDays;
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
