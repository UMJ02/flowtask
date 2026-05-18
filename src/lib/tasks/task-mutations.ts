import { getTaskStatusUpdatePayload, normalizeTaskStatus } from "@/lib/tasks/status";

export const FLOWTASK_TASK_UPDATED_EVENT = "flowtask:task-updated";

export type FlowtaskTaskUpdatedDetail = {
  task: Record<string, unknown> & { id: string };
  source?: "classic" | "pro" | "form" | "system";
};

export function emitTaskUpdated(task: FlowtaskTaskUpdatedDetail["task"], source: FlowtaskTaskUpdatedDetail["source"] = "system") {
  if (typeof window === "undefined" || !task?.id) return;
  window.dispatchEvent(new CustomEvent<FlowtaskTaskUpdatedDetail>(FLOWTASK_TASK_UPDATED_EVENT, { detail: { task, source } }));
}

export function subscribeTaskUpdated(handler: (detail: FlowtaskTaskUpdatedDetail) => void) {
  if (typeof window === "undefined") return () => {};
  const listener = (event: Event) => {
    const customEvent = event as CustomEvent<FlowtaskTaskUpdatedDetail>;
    if (customEvent.detail?.task?.id) handler(customEvent.detail);
  };
  window.addEventListener(FLOWTASK_TASK_UPDATED_EVENT, listener);
  return () => window.removeEventListener(FLOWTASK_TASK_UPDATED_EVENT, listener);
}

export function mergeTaskUpdate<T extends { id: string }>(items: T[], patch: Record<string, unknown> & { id: string }) {
  return items.map((item) => (item.id === patch.id ? ({ ...item, ...patch } as T) : item));
}

export async function updateTaskStatusCore(
  supabase: any,
  taskId: string,
  nextStatus: string,
  options: { currentDueDate?: string | null; source?: FlowtaskTaskUpdatedDetail["source"] } = {},
) {
  const payload = getTaskStatusUpdatePayload(normalizeTaskStatus(nextStatus), options.currentDueDate);
  const { data, error } = await supabase
    .from("tasks")
    .update(payload)
    .eq("id", taskId)
    .select("id,title,status,priority,due_date,project_id,updated_at")
    .maybeSingle();

  if (error || !data) throw error ?? new Error("No Supabase row returned for task status update.");
  emitTaskUpdated(data, options.source ?? "system");
  return data;
}

export async function updateTaskPriorityCore(
  supabase: any,
  taskId: string,
  priority: string,
  source: FlowtaskTaskUpdatedDetail["source"] = "system",
) {
  const { data, error } = await supabase
    .from("tasks")
    .update({ priority })
    .eq("id", taskId)
    .select("id,title,status,priority,due_date,project_id,updated_at")
    .maybeSingle();

  if (error || !data) throw error ?? new Error("No Supabase row returned for task priority update.");
  emitTaskUpdated(data, source);
  return data;
}

export async function updateTaskCore(
  supabase: any,
  taskId: string,
  payload: Record<string, unknown>,
  source: FlowtaskTaskUpdatedDetail["source"] = "system",
) {
  const normalizedPayload = typeof payload.status === "string" ? { ...payload, status: normalizeTaskStatus(payload.status) } : payload;
  const { data, error } = await supabase
    .from("tasks")
    .update(normalizedPayload)
    .eq("id", taskId)
    .select("id,title,status,priority,due_date,project_id,updated_at")
    .maybeSingle();

  if (error || !data) throw error ?? new Error("No Supabase row returned for task update.");
  emitTaskUpdated(data, source);
  return data;
}
