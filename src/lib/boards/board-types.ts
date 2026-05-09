export type BoardTool = "select" | "hand" | "sticky" | "text" | "shape" | "connector" | "table";

export type BoardElementType = "sticky" | "text" | "shape" | "connector" | "table";

export type BoardPoint = { x: number; y: number };

export type BoardStyle = {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  radius?: number;
  shadow?: "none" | "soft" | "medium";
  opacity?: number;
  fontSize?: number;
  fontWeight?: number;
  textColor?: string;
  textAlign?: "left" | "center" | "right";
  arrowEnd?: boolean;
  lineType?: "straight" | "elbow" | "curve";
};

export type BoardElementBase = {
  id: string;
  boardId: string;
  type: BoardElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  zIndex: number;
  locked?: boolean;
  hidden?: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type StickyElement = BoardElementBase & {
  type: "sticky";
  content: string;
  style: BoardStyle;
};

export type TextElement = BoardElementBase & {
  type: "text";
  content: string;
  style: BoardStyle;
};

export type ShapeElement = BoardElementBase & {
  type: "shape";
  shape: "rectangle" | "rounded" | "diamond" | "circle" | "pill";
  content: string;
  style: BoardStyle;
};

export type ConnectorElement = BoardElementBase & {
  type: "connector";
  fromElementId?: string | null;
  toElementId?: string | null;
  from: BoardPoint;
  to: BoardPoint;
  label?: string;
  style: BoardStyle;
};

export type TableElement = BoardElementBase & {
  type: "table";
  columns: Array<{ id: string; label: string; width: number }>;
  rows: Array<{ id: string; cells: Record<string, string> }>;
  style: BoardStyle;
};

export type BoardElement = StickyElement | TextElement | ShapeElement | ConnectorElement | TableElement;

export type VisualBoard = {
  id: string;
  ownerId: string;
  organizationId: string | null;
  projectId: string | null;
  taskId: string | null;
  title: string;
  description: string | null;
  visibility: "private" | "workspace" | "public_link";
  shareToken: string | null;
  publicCanEdit: boolean;
  thumbnailUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type VisualBoardRow = {
  id: string;
  owner_id: string;
  organization_id: string | null;
  project_id: string | null;
  task_id: string | null;
  title: string;
  description: string | null;
  visibility: "private" | "workspace" | "public_link";
  share_token?: string | null;
  public_can_edit?: boolean | null;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
};

export type VisualBoardElementRow = {
  id: string;
  board_id: string;
  type: BoardElementType;
  x: number | string;
  y: number | string;
  width: number | string;
  height: number | string;
  rotation: number | string | null;
  z_index: number;
  locked: boolean;
  hidden: boolean;
  data: Record<string, unknown>;
  style: BoardStyle;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
};

export type VisualBoardComment = {
  id: string;
  boardId: string;
  elementId: string | null;
  authorId: string | null;
  body: string;
  x: number | null;
  y: number | null;
  resolved: boolean;
  createdAt: string;
};

export type VisualBoardCommentRow = {
  id: string;
  board_id: string;
  element_id: string | null;
  author_id: string | null;
  body: string;
  x: number | string | null;
  y: number | string | null;
  resolved: boolean;
  created_at: string;
};

export type VisualBoardActivity = {
  id: string;
  boardId: string;
  actorId: string | null;
  type: string;
  payload: Record<string, unknown>;
  createdAt: string;
};

export type VisualBoardActivityRow = {
  id: string;
  board_id: string;
  actor_id: string | null;
  type: string;
  payload: Record<string, unknown>;
  created_at: string;
};


export type VisualBoardCollaboratorRole = "viewer" | "editor" | "admin";

export type VisualBoardCollaborator = {
  id: string;
  boardId: string;
  userId: string | null;
  email: string | null;
  role: VisualBoardCollaboratorRole;
  invitedBy: string | null;
  createdAt: string;
  acceptedAt: string | null;
};

export type VisualBoardCollaboratorRow = {
  id: string;
  board_id: string;
  user_id: string | null;
  email: string | null;
  role: VisualBoardCollaboratorRole;
  invited_by: string | null;
  created_at: string;
  accepted_at: string | null;
};
