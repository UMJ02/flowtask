export type TaskStatus = "en_proceso" | "en_espera" | "concluido";

export interface TaskBase {
  id: string;
  title: string;
  status: TaskStatus;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface TaskSummary extends TaskBase {
  clientName?: string | null;
  dueDate?: string | null;
  priority?: string | null;
  project_id?: string | null;
  departmentCode?: string | null;
  departmentName?: string | null;
  isOverdue?: boolean;
  isDueToday?: boolean;
  /** Compat aliases kept while modules are normalized */
  client_name?: string | null;
  due_date?: string | null;
  departments?: { code?: string | null; name?: string | null }[] | { code?: string | null; name?: string | null } | null;
}
