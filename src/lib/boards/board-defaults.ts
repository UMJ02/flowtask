import type { BoardElement, BoardFileData, BoardTool, ConnectorElement, FileElement, ImageElement, ShapeElement } from "@/lib/boards/board-types";

function nowIso() {
  return new Date().toISOString();
}

export function createDefaultConnector(
  boardId: string,
  from: { x: number; y: number },
  to: { x: number; y: number },
  userId: string,
  fromElementId?: string | null,
  toElementId?: string | null,
): ConnectorElement {
  const createdAt = nowIso();
  const minX = Math.min(from.x, to.x);
  const minY = Math.min(from.y, to.y);
  const width = Math.max(1, Math.abs(to.x - from.x));
  const height = Math.max(1, Math.abs(to.y - from.y));

  return {
    id: crypto.randomUUID(),
    boardId,
    type: "connector",
    x: minX,
    y: minY,
    width,
    height,
    rotation: 0,
    zIndex: 5,
    locked: false,
    hidden: false,
    fromElementId: fromElementId ?? null,
    toElementId: toElementId ?? null,
    from,
    to,
    label: "",
    style: { stroke: "#334155", strokeWidth: 2, arrowEnd: true, lineType: "straight", shadow: "none" },
    createdBy: userId,
    createdAt,
    updatedAt: createdAt,
  };
}


export function createFileBoardElement(
  type: "image" | "file",
  boardId: string,
  point: { x: number; y: number },
  userId: string,
  fileData: BoardFileData,
): ImageElement | FileElement {
  const createdAt = nowIso();
  const isImage = type === "image";
  return {
    id: crypto.randomUUID(),
    boardId,
    type,
    x: Math.round(point.x),
    y: Math.round(point.y),
    width: isImage ? 260 : 260,
    height: isImage ? 180 : 96,
    rotation: 0,
    zIndex: 10,
    locked: false,
    hidden: false,
    data: fileData,
    style: { fill: "#FFFFFF", stroke: "#E5EAF1", radius: 18, shadow: "none" },
    createdBy: userId,
    createdAt,
    updatedAt: createdAt,
  } as ImageElement | FileElement;
}

export function createDefaultBoardElement(type: BoardTool, boardId: string, point: { x: number; y: number }, userId: string, shapeKind: ShapeElement["shape"] = "rounded"): BoardElement {
  const createdAt = nowIso();
  const base = {
    id: crypto.randomUUID(),
    boardId,
    x: Math.round(point.x),
    y: Math.round(point.y),
    rotation: 0,
    zIndex: 10,
    locked: false,
    hidden: false,
    createdBy: userId,
    createdAt,
    updatedAt: createdAt,
  };

  if (type === "sticky") {
    return {
      ...base,
      type: "sticky",
      width: 188,
      height: 144,
      content: "Nueva nota",
      style: { fill: "#FEF3C7", stroke: "#FDE68A", shadow: "none", fontSize: 15, textColor: "#92400E" },
    };
  }

  if (type === "text") {
    return {
      ...base,
      type: "text",
      width: 240,
      height: 80,
      content: "Escribe una idea...",
      style: { fill: "transparent", stroke: "transparent", shadow: "none", fontSize: 18, textColor: "#0F172A", fontWeight: 650 },
    };
  }

  if (type === "table") {
    return {
      ...base,
      type: "table",
      width: 560,
      height: 260,
      columns: [
        { id: "task", label: "Tarea", width: 190 },
        { id: "owner", label: "Responsable", width: 130 },
        { id: "status", label: "Estado", width: 120 },
        { id: "notes", label: "Notas", width: 180 },
      ],
      rows: [
        { id: crypto.randomUUID(), cells: { task: "Actividad clave", owner: "Equipo", status: "Pendiente", notes: "" } },
        { id: crypto.randomUUID(), cells: { task: "Validar diseño", owner: "Ulises", status: "En progreso", notes: "" } },
      ],
      hiddenRowIds: [],
      hiddenColumnIds: [],
      rowStyles: {},
      columnStyles: {},
      cellStyles: {},
      formulas: {},
      selectedRange: undefined,
      style: { fill: "#FFFFFF", stroke: "#C4B5FD", shadow: "none", radius: 16 },
    };
  }

  return {
    ...base,
    type: "shape",
    shape: shapeKind,
    width: shapeKind === "circle" ? 112 : shapeKind === "diamond" ? 132 : shapeKind === "pill" ? 184 : 180,
    height: shapeKind === "circle" ? 112 : shapeKind === "diamond" ? 132 : shapeKind === "pill" ? 64 : 72,
    content: "Nuevo paso",
    style: { fill: "#ECFDF5", stroke: "#16C784", strokeWidth: 2, radius: 16, shadow: "none", fontSize: 14, textColor: "#065F46", fontWeight: 700 },
  } as ShapeElement;
}
