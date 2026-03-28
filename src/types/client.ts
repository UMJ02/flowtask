export type ClientStatus = "activo" | "en_pausa" | "cerrado";

export interface ClientBase {
  id: string;
  name: string;
  status: ClientStatus;
  notes?: string | null;
}

export interface ClientListItem extends ClientBase {
  createdAtLabel: string;
  projectsCount: number;
  openTasksCount: number;
  completedTasksCount: number;
  overdueTasksCount: number;
}

export interface ClientDetailSummary extends ClientListItem {
  organizationId: string;
  accountOwnerEmail?: string | null;
  recentProjects: Array<{ id: string; title: string; status: string; dueDateLabel: string }>;
  recentTasks: Array<{ id: string; title: string; status: string; dueDateLabel: string }>;
  activity: Array<{ id: string; action: string; createdAtLabel: string }>;
}

export interface ClientDashboardItem {
  id: string;
  name: string;
  openProjects: number;
  openTasks: number;
  overdueTasks: number;
  /** Compat aliases kept while workspace modules converge */
  activeProjects?: number;
  overdueTasksCount?: number;
}
