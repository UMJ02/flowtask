import type { BoardElement, BoardElementType, BoardStyle, TableElement, VisualBoard, VisualBoardElementRow, VisualBoardRow } from "@/lib/boards/board-types";

export function mapBoardRow(row: VisualBoardRow): VisualBoard {
  return {
    id: row.id,
    ownerId: row.owner_id,
    organizationId: row.organization_id,
    projectId: row.project_id,
    taskId: row.task_id,
    title: row.title,
    description: row.description,
    visibility: row.visibility,
    thumbnailUrl: row.thumbnail_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function numberValue(value: number | string | null | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function mapElementRow(row: VisualBoardElementRow): BoardElement {
  const data = row.data ?? {};
  const common = {
    id: row.id,
    boardId: row.board_id,
    type: row.type as BoardElementType,
    x: numberValue(row.x, 0),
    y: numberValue(row.y, 0),
    width: numberValue(row.width, 160),
    height: numberValue(row.height, 80),
    rotation: numberValue(row.rotation, 0),
    zIndex: row.z_index ?? 1,
    locked: Boolean(row.locked),
    hidden: Boolean(row.hidden),
    createdBy: row.created_by ?? "system",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    style: (row.style ?? {}) as BoardStyle,
  };

  if (row.type === "table") {
    return {
      ...common,
      type: "table",
      columns: Array.isArray((data as any).columns) ? (data as any).columns : [],
      rows: Array.isArray((data as any).rows) ? (data as any).rows : [],
    } as TableElement;
  }

  if (row.type === "shape") {
    return { ...common, type: "shape", shape: String((data as any).shape ?? "rounded") as any, content: String((data as any).content ?? "") } as BoardElement;
  }

  return { ...common, type: row.type as any, content: String((data as any).content ?? "") } as BoardElement;
}

export function serializeElementForUpsert(element: BoardElement) {
  const data = element.type === "table"
    ? { columns: element.columns, rows: element.rows }
    : element.type === "shape"
      ? { shape: element.shape, content: element.content }
      : { content: (element as any).content ?? "" };

  return {
    id: element.id,
    board_id: element.boardId,
    type: element.type,
    x: element.x,
    y: element.y,
    width: element.width,
    height: element.height,
    rotation: element.rotation ?? 0,
    z_index: element.zIndex,
    locked: Boolean(element.locked),
    hidden: Boolean(element.hidden),
    data,
    style: element.style ?? {},
    created_by: element.createdBy,
    updated_at: new Date().toISOString(),
    deleted_at: null,
  };
}
