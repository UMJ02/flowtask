export type BoardTool = "select" | "hand" | "sticky" | "text" | "shape" | "table";

export type BoardElementType = "sticky" | "text" | "shape" | "table";

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

export type TableElement = BoardElementBase & {
  type: "table";
  columns: Array<{ id: string; label: string; width: number }>;
  rows: Array<{ id: string; cells: Record<string, string> }>;
  style: BoardStyle;
};

export type BoardElement = StickyElement | TextElement | ShapeElement | TableElement;

export type VisualBoard = {
  id: string;
  ownerId: string;
  organizationId: string | null;
  projectId: string | null;
  taskId: string | null;
  title: string;
  description: string | null;
  visibility: "private" | "workspace" | "public_link";
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
