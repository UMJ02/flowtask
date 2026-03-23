export interface ProjectSummary {
  id: string;
  title: string;
  status: "activo" | "en_pausa" | "completado" | "vencido";
  clientName?: string | null;
  dueDate?: string | null;
}
