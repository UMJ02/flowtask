export interface TaskSummary {
  id: string;
  title: string;
  status: "en_proceso" | "en_espera" | "concluido";
  clientName?: string | null;
  dueDate?: string | null;
}
