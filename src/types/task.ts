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
  departmentCode?: string | null;
  departmentName?: string | null;
  isOverdue?: boolean;
  isDueToday?: boolean;
}
