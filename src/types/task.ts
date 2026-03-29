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
  client_name?: string | null;
  dueDate?: string | null;
  due_date?: string | null;
  departmentCode?: string | null;
  departmentName?: string | null;
  departments?: string[];
  isOverdue?: boolean;
  isDueToday?: boolean;
}
