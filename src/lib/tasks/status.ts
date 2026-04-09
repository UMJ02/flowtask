export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function isTaskPaused(status?: string | null) {
  return status === 'en_espera';
}

export function isTaskCompleted(status?: string | null) {
  return status === 'concluido';
}

export function isTaskOverdue(value?: string | null, status?: string | null, referenceDate = todayIso()) {
  if (!value) return false;
  if (isTaskCompleted(status) || isTaskPaused(status)) return false;
  return value < referenceDate;
}

export function getNextDueDateForTaskStatus(nextStatus: string, fallbackDate?: string | null, referenceDate = todayIso()) {
  if (nextStatus === 'en_proceso' || nextStatus === 'concluido') return referenceDate;
  return fallbackDate ?? null;
}
