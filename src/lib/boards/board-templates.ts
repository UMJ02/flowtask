import type { BoardElement } from "@/lib/boards/board-types";
import { createDefaultBoardElement, createDefaultConnector } from "@/lib/boards/board-defaults";

export type BoardTemplateId = "blank" | "flow" | "project" | "meeting" | "ideas" | "wireframe";

export type BoardTemplate = {
  id: BoardTemplateId;
  title: string;
  description: string;
  badge: string;
};

export const BOARD_TEMPLATES: BoardTemplate[] = [
  { id: "blank", title: "Pizarra en blanco", description: "Empieza libre con notas, formas, tablas y conectores.", badge: "Libre" },
  { id: "flow", title: "Diagrama de flujo", description: "Inicio, decisión, pasos y salida conectados para mapear un proceso.", badge: "Flujo" },
  { id: "project", title: "Plan de proyecto", description: "Tabla de tareas, notas clave y una secuencia visual de avance.", badge: "Proyecto" },
  { id: "meeting", title: "Reunión con cliente", description: "Acuerdos, pendientes y responsables para cerrar seguimiento.", badge: "Cliente" },
  { id: "ideas", title: "Mapa de ideas", description: "Clusters de notas adhesivas para ordenar conceptos rápidamente.", badge: "Ideas" },
  { id: "wireframe", title: "Wireframe landing", description: "Boceto visual de hero, secciones y notas UX.", badge: "UX" },
];

function cloneWith(element: BoardElement, patch: Partial<BoardElement>): BoardElement {
  return { ...element, ...patch, updatedAt: new Date().toISOString() } as BoardElement;
}

export function createTemplateElements(templateId: BoardTemplateId, boardId: string, userId: string): BoardElement[] {
  if (templateId === "blank") return [];

  if (templateId === "flow") {
    const start = cloneWith(createDefaultBoardElement("shape", boardId, { x: 160, y: 120 }, userId), { content: "Inicio", width: 150, style: { fill: "#ECFDF5", stroke: "#16C784", strokeWidth: 2, radius: 24, textColor: "#065F46", fontWeight: 800 } } as Partial<BoardElement>);
    const process = cloneWith(createDefaultBoardElement("shape", boardId, { x: 160, y: 250 }, userId), { content: "Investigar", width: 180, style: { fill: "#DBEAFE", stroke: "#3B82F6", strokeWidth: 2, radius: 16, textColor: "#1E3A8A", fontWeight: 700 } } as Partial<BoardElement>);
    const decision = cloneWith(createDefaultBoardElement("shape", boardId, { x: 170, y: 390 }, userId), { content: "¿Aprobado?", width: 160, height: 90, shape: "diamond", style: { fill: "#FEF3C7", stroke: "#F59E0B", strokeWidth: 2, radius: 14, textColor: "#92400E", fontWeight: 800 } } as Partial<BoardElement>);
    const finish = cloneWith(createDefaultBoardElement("shape", boardId, { x: 430, y: 390 }, userId), { content: "Producción", width: 180, style: { fill: "#F5F3FF", stroke: "#8B5CF6", strokeWidth: 2, radius: 16, textColor: "#4C1D95", fontWeight: 800 } } as Partial<BoardElement>);
    const c1 = createDefaultConnector(boardId, { x: start.x + start.width / 2, y: start.y + start.height }, { x: process.x + process.width / 2, y: process.y }, userId, start.id, process.id);
    const c2 = createDefaultConnector(boardId, { x: process.x + process.width / 2, y: process.y + process.height }, { x: decision.x + decision.width / 2, y: decision.y }, userId, process.id, decision.id);
    const c3 = createDefaultConnector(boardId, { x: decision.x + decision.width, y: decision.y + decision.height / 2 }, { x: finish.x, y: finish.y + finish.height / 2 }, userId, decision.id, finish.id);
    c3.label = "Sí";
    return [start, process, decision, finish, c1, c2, c3];
  }

  if (templateId === "project") {
    const table = cloneWith(createDefaultBoardElement("table", boardId, { x: 120, y: 180 }, userId), { width: 650, height: 260 } as Partial<BoardElement>);
    const note = cloneWith(createDefaultBoardElement("sticky", boardId, { x: 820, y: 180 }, userId), { content: "Notas clave\n• Validar alcance\n• Confirmar responsable\n• Revisar fecha límite", width: 230, height: 170 } as Partial<BoardElement>);
    const step = cloneWith(createDefaultBoardElement("shape", boardId, { x: 120, y: 90 }, userId), { content: "Plan de proyecto", width: 220 } as Partial<BoardElement>);
    return [step, table, note];
  }

  if (templateId === "meeting") {
    const a = cloneWith(createDefaultBoardElement("sticky", boardId, { x: 140, y: 140 }, userId), { content: "Acuerdos\n• Definir alcance\n• Enviar propuesta", style: { fill: "#ECFDF5", stroke: "#A7F3D0", textColor: "#065F46", fontSize: 15 } } as Partial<BoardElement>);
    const p = cloneWith(createDefaultBoardElement("sticky", boardId, { x: 370, y: 140 }, userId), { content: "Pendientes\n• Cotización\n• Materiales\n• Fecha de entrega", style: { fill: "#FEF3C7", stroke: "#FDE68A", textColor: "#92400E", fontSize: 15 } } as Partial<BoardElement>);
    const table = cloneWith(createDefaultBoardElement("table", boardId, { x: 140, y: 340 }, userId), { width: 620 } as Partial<BoardElement>);
    return [a, p, table];
  }

  if (templateId === "ideas") {
    return [
      cloneWith(createDefaultBoardElement("sticky", boardId, { x: 120, y: 120 }, userId), { content: "Idea principal", style: { fill: "#DBEAFE", stroke: "#BFDBFE", textColor: "#1E3A8A" } } as Partial<BoardElement>),
      cloneWith(createDefaultBoardElement("sticky", boardId, { x: 360, y: 110 }, userId), { content: "Oportunidad", style: { fill: "#F5F3FF", stroke: "#DDD6FE", textColor: "#4C1D95" } } as Partial<BoardElement>),
      cloneWith(createDefaultBoardElement("sticky", boardId, { x: 240, y: 300 }, userId), { content: "Riesgo / duda", style: { fill: "#FFE4E6", stroke: "#FECDD3", textColor: "#9F1239" } } as Partial<BoardElement>),
      cloneWith(createDefaultBoardElement("text", boardId, { x: 120, y: 60 }, userId), { content: "Mapa de ideas", width: 320 } as Partial<BoardElement>),
    ];
  }

  const hero = cloneWith(createDefaultBoardElement("shape", boardId, { x: 120, y: 100 }, userId), { content: "Hero / propuesta", width: 420, height: 120, style: { fill: "#FFFFFF", stroke: "#CBD5E1", strokeWidth: 2, radius: 18, textColor: "#334155", fontWeight: 800 } } as Partial<BoardElement>);
  const card1 = cloneWith(createDefaultBoardElement("shape", boardId, { x: 120, y: 270 }, userId), { content: "Card 1", width: 180, height: 100 } as Partial<BoardElement>);
  const card2 = cloneWith(createDefaultBoardElement("shape", boardId, { x: 340, y: 270 }, userId), { content: "Card 2", width: 180, height: 100 } as Partial<BoardElement>);
  const note = cloneWith(createDefaultBoardElement("sticky", boardId, { x: 600, y: 110 }, userId), { content: "Notas UX\n• CTA claro\n• Beneficio visible\n• Menos ruido", width: 220 } as Partial<BoardElement>);
  return [hero, card1, card2, note];
}
