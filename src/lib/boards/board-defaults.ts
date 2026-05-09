import type { BoardElement, BoardTool, ShapeElement } from "@/lib/boards/board-types";

function nowIso() {
  return new Date().toISOString();
}

export function createDefaultBoardElement(type: BoardTool, boardId: string, point: { x: number; y: number }, userId: string): BoardElement {
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
      style: { fill: "#FFFFFF", stroke: "#C4B5FD", shadow: "none", radius: 16 },
    };
  }

  return {
    ...base,
    type: "shape",
    shape: "rounded",
    width: 180,
    height: 72,
    content: "Nuevo paso",
    style: { fill: "#ECFDF5", stroke: "#16C784", strokeWidth: 2, radius: 16, shadow: "none", fontSize: 14, textColor: "#065F46", fontWeight: 700 },
  } as ShapeElement;
}
