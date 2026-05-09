"use client";

import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { Download, FileText, Plus, Trash2 } from "lucide-react";
import type { BoardElement, BoardTool } from "@/lib/boards/board-types";

export type ResizeHandle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

type BoardElementViewProps = {
  element: BoardElement;
  selected: boolean;
  activeTool: BoardTool;
  onSelect: (id: string) => void;
  onDragStart: (id: string, event: ReactPointerEvent<HTMLDivElement>) => void;
  onResizeStart: (id: string, handle: ResizeHandle, event: ReactPointerEvent<HTMLButtonElement>) => void;
  onUpdateContent: (id: string, content: string) => void;
  onConnectorTarget: (id: string) => void;
  onCommentTarget?: (id: string) => void;
  onUpdateTableCell: (elementId: string, rowId: string, columnId: string, value: string) => void;
  onAddTableRow: (elementId: string) => void;
  onAddTableColumn: (elementId: string) => void;
  onRemoveTableRow: (elementId: string, rowId: string) => void;
};

const handleClasses: Record<ResizeHandle, string> = {
  nw: "-left-1.5 -top-1.5 cursor-nwse-resize",
  n: "left-1/2 -top-1.5 -translate-x-1/2 cursor-ns-resize",
  ne: "-right-1.5 -top-1.5 cursor-nesw-resize",
  e: "-right-1.5 top-1/2 -translate-y-1/2 cursor-ew-resize",
  se: "-bottom-1.5 -right-1.5 cursor-nwse-resize",
  s: "bottom-[-6px] left-1/2 -translate-x-1/2 cursor-ns-resize",
  sw: "-bottom-1.5 -left-1.5 cursor-nesw-resize",
  w: "-left-1.5 top-1/2 -translate-y-1/2 cursor-ew-resize",
};

function getStyle(element: BoardElement): CSSProperties {
  return {
    position: "absolute",
    left: element.x,
    top: element.y,
    width: element.width,
    height: element.height,
    transform: `rotate(${element.rotation ?? 0}deg)`,
    zIndex: element.zIndex,
    opacity: element.style?.opacity ?? 1,
  };
}

function ResizeHandles({ elementId, onResizeStart }: { elementId: string; onResizeStart: BoardElementViewProps["onResizeStart"] }) {
  const handles: ResizeHandle[] = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];
  return (
    <>
      {handles.map((handle) => (
        <button
          key={handle}
          type="button"
          aria-label={`Redimensionar ${handle}`}
          onPointerDown={(event) => onResizeStart(elementId, handle, event)}
          className={`absolute z-20 h-3 w-3 rounded-full border border-emerald-500 bg-white shadow-sm ${handleClasses[handle]}`}
        />
      ))}
    </>
  );
}

function shapeClip(element: BoardElement) {
  if (element.type !== "shape") return undefined;
  if (element.shape === "diamond") return "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)";
  return undefined;
}

export function BoardElementView({
  element,
  selected,
  activeTool,
  onSelect,
  onDragStart,
  onResizeStart,
  onUpdateContent,
  onConnectorTarget,
  onCommentTarget,
  onUpdateTableCell,
  onAddTableRow,
  onAddTableColumn,
  onRemoveTableRow,
}: BoardElementViewProps) {
  if (element.type === "connector") return null;

  const common = "group absolute touch-none select-none transition duration-150";
  const selection = selected ? "board-selection-ring" : "hover:ring-1 hover:ring-slate-300";
  const connectorMode = activeTool === "connector";
  const commentMode = activeTool === "comment";
  const canResize = selected && activeTool === "select" && !element.locked;

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (connectorMode || commentMode || activeTool === "hand") return;
    onDragStart(element.id, event);
  }

  function handleClick() {
    if (connectorMode) {
      onConnectorTarget(element.id);
      return;
    }
    if (commentMode) {
      onCommentTarget?.(element.id);
      return;
    }
    onSelect(element.id);
  }

  if (element.type === "image") {
    return (
      <div
        style={getStyle(element)}
        className={`${common} overflow-visible rounded-[18px] border border-slate-200 bg-white ${selection} ${connectorMode || commentMode ? "cursor-crosshair hover:border-emerald-300" : ""}`}
        onPointerDown={handlePointerDown}
        onClick={handleClick}
      >
        <div className="h-full overflow-hidden rounded-[18px]">
          <img src={element.data.url} alt={element.data.name} className="h-[calc(100%-44px)] w-full object-cover" draggable={false} />
          <div className="flex h-11 items-center justify-between gap-2 border-t border-slate-100 bg-white px-3">
            <p className="min-w-0 truncate text-xs font-bold text-slate-700">{element.data.name}</p>
            <a href={element.data.url} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()} className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" title="Abrir imagen">
              <Download className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
        {canResize ? <ResizeHandles elementId={element.id} onResizeStart={onResizeStart} /> : null}
      </div>
    );
  }

  if (element.type === "file") {
    return (
      <div
        style={getStyle(element)}
        className={`${common} overflow-visible rounded-[18px] border border-slate-200 bg-white ${selection} ${connectorMode || commentMode ? "cursor-crosshair hover:border-emerald-300" : ""}`}
        onPointerDown={handlePointerDown}
        onClick={handleClick}
      >
        <div className="flex h-full items-center gap-3 overflow-hidden rounded-[18px] p-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-slate-100 text-slate-600">
            <FileText className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-slate-800">{element.data.name}</p>
            <p className="mt-0.5 text-xs font-semibold text-slate-400">{Math.max(1, Math.round(element.data.size / 1024))} KB · {element.data.mime}</p>
          </div>
          <a href={element.data.url} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()} className="ft-btn-secondary h-8 px-3 text-xs">Abrir</a>
        </div>
        {canResize ? <ResizeHandles elementId={element.id} onResizeStart={onResizeStart} /> : null}
      </div>
    );
  }

  if (element.type === "table") {
    return (
      <div
        style={getStyle(element)}
        className={`${common} overflow-visible rounded-[16px] border border-violet-200 bg-white ${selection} ${connectorMode || commentMode ? "cursor-crosshair hover:border-emerald-300" : ""}`}
        onPointerDown={handlePointerDown}
        onClick={handleClick}
      >
        <div className="flex h-full flex-col overflow-hidden rounded-[16px]">
          <div className="flex items-center justify-between border-b border-violet-100 bg-violet-50/90 px-2 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-violet-700">
            <span>Tabla editable</span>
            {selected && !connectorMode ? (
              <div className="flex items-center gap-1 normal-case tracking-normal">
                <button type="button" onPointerDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); onAddTableRow(element.id); }} className="inline-flex h-6 items-center gap-1 rounded-lg bg-white px-2 text-[11px] font-bold text-slate-600 hover:bg-violet-100"><Plus className="h-3 w-3" /> Fila</button>
                <button type="button" onPointerDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); onAddTableColumn(element.id); }} className="inline-flex h-6 items-center gap-1 rounded-lg bg-white px-2 text-[11px] font-bold text-slate-600 hover:bg-violet-100"><Plus className="h-3 w-3" /> Col.</button>
              </div>
            ) : null}
          </div>
          <div className="min-h-0 flex-1 overflow-auto">
            <table className="h-full min-w-full border-collapse text-[12px]">
              <thead className="bg-violet-50 text-slate-700">
                <tr>
                  {element.columns.map((column) => (
                    <th key={column.id} style={{ width: column.width }} className="border border-violet-100 px-2 py-2 text-left font-bold">{column.label}</th>
                  ))}
                  {selected && !connectorMode ? <th className="w-8 border border-violet-100 px-1 py-2" aria-label="Acciones" /> : null}
                </tr>
              </thead>
              <tbody>
                {element.rows.map((row) => (
                  <tr key={row.id}>
                    {element.columns.map((column) => (
                      <td key={column.id} className="border border-slate-100 p-0 text-slate-700">
                        <textarea value={row.cells[column.id] ?? ""} readOnly={connectorMode || commentMode || element.locked} onPointerDown={(event) => event.stopPropagation()} onClick={(event) => event.stopPropagation()} onChange={(event) => onUpdateTableCell(element.id, row.id, column.id, event.target.value)} className="block min-h-[34px] w-full resize-none border-none bg-transparent px-2 py-2 text-[12px] leading-4 outline-none focus:bg-emerald-50/50" placeholder="Escribe..." />
                      </td>
                    ))}
                    {selected && !connectorMode ? (
                      <td className="border border-slate-100 p-1 text-center">
                        <button type="button" onPointerDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); onRemoveTableRow(element.id, row.id); }} className="grid h-7 w-7 place-items-center rounded-lg text-rose-500 hover:bg-rose-50" title="Eliminar fila"><Trash2 className="h-3.5 w-3.5" /></button>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {canResize ? <ResizeHandles elementId={element.id} onResizeStart={onResizeStart} /> : null}
      </div>
    );
  }

  const fill = element.style?.fill ?? "#FFFFFF";
  const stroke = element.style?.stroke ?? "#E5EAF1";
  const radius = element.type === "shape" && element.shape === "circle" ? "999px" : element.type === "shape" && element.shape === "pill" ? "999px" : `${element.style?.radius ?? 16}px`;
  const textColor = element.style?.textColor ?? "#0F172A";
  const content = "content" in element ? element.content : "";
  const clipPath = shapeClip(element);

  return (
    <div
      style={{ ...getStyle(element), background: fill === "transparent" ? "transparent" : fill, borderColor: stroke, borderRadius: radius, color: textColor, clipPath }}
      className={`${common} ${selection} ${connectorMode || commentMode ? "cursor-crosshair hover:border-emerald-300 hover:bg-emerald-50/50" : ""} flex items-center justify-center overflow-visible border p-3`}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
    >
      <textarea value={content} readOnly={connectorMode || commentMode || element.locked} onPointerDown={(event) => event.stopPropagation()} onChange={(event) => onUpdateContent(element.id, event.target.value)} className="h-full w-full resize-none border-none bg-transparent text-center text-[14px] font-semibold leading-5 outline-none placeholder:text-slate-400" style={{ color: textColor, fontSize: element.style?.fontSize ?? 14, fontWeight: element.style?.fontWeight ?? 650, textAlign: element.style?.textAlign ?? "center" }} />
      {canResize ? <ResizeHandles elementId={element.id} onResizeStart={onResizeStart} /> : null}
    </div>
  );
}
