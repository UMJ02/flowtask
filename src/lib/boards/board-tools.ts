import { FileUp, GitBranch, Hand, Image, MessageCircle, MousePointer2, Shapes, StickyNote, Table2, Type } from "lucide-react";
import type { BoardTool } from "@/lib/boards/board-types";

export const BOARD_TOOLS: Array<{
  id: BoardTool;
  label: string;
  hint: string;
  group: "basics" | "diagrams" | "tables" | "media";
  icon: typeof MousePointer2;
}> = [
  { id: "select", label: "Seleccionar", hint: "Mover y editar elementos", group: "basics", icon: MousePointer2 },
  { id: "hand", label: "Mover lienzo", hint: "Pan suave del canvas", group: "basics", icon: Hand },
  { id: "sticky", label: "Nota", hint: "Idea rápida tipo post-it", group: "basics", icon: StickyNote },
  { id: "text", label: "Texto", hint: "Bloque de texto libre", group: "basics", icon: Type },
  { id: "comment", label: "Comentario", hint: "Ancla una conversación en el lienzo", group: "basics", icon: MessageCircle },
  { id: "shape", label: "Forma", hint: "Proceso o paso visual", group: "diagrams", icon: Shapes },
  { id: "connector", label: "Conector", hint: "Une pasos, notas y decisiones", group: "diagrams", icon: GitBranch },
  { id: "table", label: "Tabla", hint: "Tabla visual editable", group: "tables", icon: Table2 },
  { id: "image", label: "Imagen", hint: "Sube y coloca una imagen", group: "media", icon: Image },
  { id: "file", label: "Archivo", hint: "Adjunta un archivo al canvas", group: "media", icon: FileUp },
];
