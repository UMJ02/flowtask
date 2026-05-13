export type WorkspaceViewId = "list" | "board" | "timeline" | "table" | "canvas" | "files" | "reports";

export type WorkspaceMode = "personal" | "organization";

export type WorkspaceSpaceSummary = {
  id: string;
  name: string;
  slug: string;
  source: "department" | "client" | "general";
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
