export type WorkspaceViewId = "list" | "board" | "timeline" | "table" | "canvas" | "files" | "reports";

export type WorkspaceMode = "personal" | "organization";

export type WorkspaceContext = {
  workspaceId: string;
  workspaceName: string;
  mode: WorkspaceMode;
  spaceId?: string | null;
  spaceName?: string | null;
  projectId?: string | null;
  projectTitle?: string | null;
};

export type WorkspaceTaskItem = {
  id: string;
  title: string;
  status: string;
  priority?: string | null;
  dueDate?: string | null;
  assigneeName?: string | null;
  projectId?: string | null;
  clientName?: string | null;
  departmentName?: string | null;
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
};
