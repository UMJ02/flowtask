export interface ClientListItem {
  id: string;
  name: string;
  status: "activo" | "en_pausa" | "cerrado";
  notes?: string | null;
  createdAtLabel: string;
  projectsCount: number;
  openTasksCount: number;
  completedTasksCount: number;
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
}
