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
  dueDate?: string | null;
  isCollaborative?: boolean;
  departmentCode?: string | null;
  departmentName?: string | null;
  /** Compat aliases kept while modules are normalized */
  client_name?: string | null;
  due_date?: string | null;
  is_collaborative?: boolean;
  departments?: { code?: string | null; name?: string | null }[] | { code?: string | null; name?: string | null } | null;
  country?: string | null;
}
