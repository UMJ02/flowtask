export type WorkspaceViewId = "list" | "board" | "timeline" | "table" | "canvas" | "files" | "reports";

export type WorkspaceMode = "personal" | "organization";

export type WorkspaceSpaceSummary = {
  id: string;
  name: string;
  slug: string;
  source: "department" | "client" | "general" | "persisted";
  color?: string | null;
  icon?: string | null;
  isPersisted?: boolean;
  taskCount: number;
  projectCount: number;
};

export type WorkspaceContext = {
  workspaceId: string;
  workspaceName: string;
  mode: WorkspaceMode;
  organizationId?: string | null;
  userId?: string | null;
  spaceId?: string | null;
  spaceName?: string | null;
  projectId?: string | null;
  projectTitle?: string | null;
  hasProjectFilter?: boolean;
  invalidProjectId?: string | null;
  activeFilters?: {
    view: WorkspaceViewId;
    space?: string | null;
    projectId?: string | null;
    status?: string | null;
  };
};

export type WorkspaceTaskItem = {
  id: string;
  title: string;
  status: string;
  priority?: string | null;
  dueDate?: string | null;
  assigneeName?: string | null;
  projectId?: string | null;
  projectTitle?: string | null;
  clientName?: string | null;
  departmentName?: string | null;
  country?: string | null;
  isOverdue?: boolean;
  isDueToday?: boolean;
  tags?: string[];
};

export type WorkspaceProjectSummary = {
  id: string;
  title: string;
  status: string;
  progress: number;
  dueDate?: string | null;
  membersCount: number;
  taskTotal: number;
  clientName?: string | null;
  departmentName?: string | null;
  country?: string | null;
};

export type WorkspaceBoardSummary = {
  id: string;
  title: string;
  description?: string | null;
  projectId?: string | null;
  projectTitle?: string | null;
  visibility?: string | null;
  thumbnailUrl?: string | null;
  updatedAt?: string | null;
  createdAt?: string | null;
};

export type WorkspaceActivityItem = {
  id: string;
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  title: string;
  description?: string | null;
  projectId?: string | null;
  taskId?: string | null;
  createdAt: string;
};

export type WorkspaceFileSummary = {
  id: string;
  fileName: string;
  mimeType?: string | null;
  fileSize?: number | null;
  publicUrl?: string | null;
  storagePath?: string | null;
  projectId?: string | null;
  projectTitle?: string | null;
  taskId?: string | null;
  taskTitle?: string | null;
  createdAt?: string | null;
};

export type WorkspaceProjectViewPreference = {
  id: string;
  projectId: string;
  viewType: WorkspaceViewId;
  title: string;
  config: Record<string, unknown>;
  isDefault: boolean;
  sortOrder: number;
};
