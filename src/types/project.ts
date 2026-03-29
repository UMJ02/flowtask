export type ProjectStatus = "activo" | "en_pausa" | "completado" | "vencido";

export interface ProjectBase {
  id: string;
  title: string;
  status: ProjectStatus;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ProjectSummary extends ProjectBase {
  clientName?: string | null;
  client_name?: string | null;
  dueDate?: string | null;
  due_date?: string | null;
  isCollaborative?: boolean;
  is_collaborative?: boolean;
  departmentCode?: string | null;
  departmentName?: string | null;
  departments?: string[];
}
