"use client";

import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { BoardElement, BoardTool } from "@/lib/boards/board-types";

type BoardElementViewProps = {
  element: BoardElement;
  selected: boolean;
  activeTool: BoardTool;
  onSelect: (id: string) => void;
  onDragStart: (id: string, event: ReactPointerEvent<HTMLDivElement>) => void;
  onUpdateContent: (id: string, content: string) => void;
  onConnectorTarget: (id: string) => void;
  onUpdateTableCell: (elementId: string, rowId: string, columnId: string, value: string) => void;
  onAddTableRow: (elementId: string) => void;
  onAddTableColumn: (elementId: string) => void;
  onRemoveTableRow: (elementId: string, rowId: string) => void;
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

export function BoardElementView({
  element,
  selected,
  activeTool,
  onSelect,
  onDragStart,
  onUpdateContent,
  onConnectorTarget,
  onUpdateTableCell,
  onAddTableRow,
  onAddTableColumn,
  onRemoveTableRow,
}: BoardElementViewProps) {
  if (element.type === "connector") return null;

  const common = "group absolute touch-none select-none transition duration-150";
  const selection = selected ? "ring-2 ring-emerald-400 ring-offset-2 ring-offset-[#FBFCFE]" : "hover:ring-1 hover:ring-slate-300";
  const connectorMode = activeTool === "connector";

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (connectorMode) return;
    onDragStart(element.id, event);
  }

  function handleClick() {
    if (connectorMode) {
      onConnectorTarget(element.id);
      return;
    }
    onSelect(element.id);
  }

  if (element.type === "table") {
    return (
      <div
        style={getStyle(element)}
        className={`${common} overflow-hidden rounded-[16px] border border-violet-200 bg-white ${selection} ${connectorMode ? "cursor-crosshair hover:border-emerald-300" : ""}`}
        onPointerDown={handlePointerDown}
        onClick={handleClick}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-violet-100 bg-violet-50/90 px-2 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-violet-700">
            <span>Tabla editable</span>
            {selected && !connectorMode ? (
              <div className="flex items-center gap-1 normal-case tracking-normal">
                <button
                  type="button"
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={(event) => { event.stopPropagation(); onAddTableRow(element.id); }}
                  className="inline-flex h-6 items-center gap-1 rounded-lg bg-white px-2 text-[11px] font-bold text-slate-600 hover:bg-violet-100"
                >
                  <Plus className="h-3 w-3" /> Fila
                </button>
                <button
                  type="button"
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={(event) => { event.stopPropagation(); onAddTableColumn(element.id); }}
                  className="inline-flex h-6 items-center gap-1 rounded-lg bg-white px-2 text-[11px] font-bold text-slate-600 hover:bg-violet-100"
                >
                  <Plus className="h-3 w-3" /> Col.
                </button>
              </div>
            ) : null}
          </div>
          <div className="min-h-0 flex-1 overflow-auto">
            <table className="h-full min-w-full border-collapse text-[12px]">
              <thead className="bg-violet-50 text-slate-700">
                <tr>
                  {element.columns.map((column) => (
                    <th key={column.id} style={{ width: column.width }} className="border border-violet-100 px-2 py-2 text-left font-bold">
                      {column.label}
                    </th>
                  ))}
                  {selected && !connectorMode ? <th className="w-8 border border-violet-100 px-1 py-2" aria-label="Acciones" /> : null}
                </tr>
              </thead>
              <tbody>
                {element.rows.map((row) => (
                  <tr key={row.id}>
                    {element.columns.map((column) => (
                      <td key={column.id} className="border border-slate-100 p-0 text-slate-700">
                        <textarea
                          value={row.cells[column.id] ?? ""}
                          readOnly={connectorMode || element.locked}
                          onPointerDown={(event) => event.stopPropagation()}
                          onClick={(event) => event.stopPropagation()}
                          onChange={(event) => onUpdateTableCell(element.id, row.id, column.id, event.target.value)}
                          className="block min-h-[34px] w-full resize-none border-none bg-transparent px-2 py-2 text-[12px] leading-4 outline-none focus:bg-emerald-50/50"
                          placeholder="Escribe..."
                        />
                      </td>
                    ))}
                    {selected && !connectorMode ? (
                      <td className="border border-slate-100 p-1 text-center">
                        <button
                          type="button"
                          onPointerDown={(event) => event.stopPropagation()}
                          onClick={(event) => { event.stopPropagation(); onRemoveTableRow(element.id, row.id); }}
                          className="grid h-7 w-7 place-items-center rounded-lg text-rose-500 hover:bg-rose-50"
                          title="Eliminar fila"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  const fill = element.style?.fill ?? "#FFFFFF";
  const stroke = element.style?.stroke ?? "#E5EAF1";
  const radius = element.type === "shape" && element.shape === "circle" ? "999px" : `${element.style?.radius ?? 16}px`;
  const textColor = element.style?.textColor ?? "#0F172A";
  const content = "content" in element ? element.content : "";

  return (
    <div
      style={{ ...getStyle(element), background: fill === "transparent" ? "transparent" : fill, borderColor: stroke, borderRadius: radius, color: textColor }}
      className={`${common} ${selection} ${connectorMode ? "cursor-crosshair hover:border-emerald-300 hover:bg-emerald-50/50" : ""} flex items-center justify-center border p-3`}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
    >
      <textarea
        value={content}
        readOnly={connectorMode || element.locked}
        onPointerDown={(event) => event.stopPropagation()}
        onChange={(event) => onUpdateContent(element.id, event.target.value)}
        className="h-full w-full resize-none border-none bg-transparent text-center text-[14px] font-semibold leading-5 outline-none placeholder:text-slate-400"
        style={{ color: textColor, fontSize: element.style?.fontSize ?? 14, fontWeight: element.style?.fontWeight ?? 650, textAlign: element.style?.textAlign ?? "center" }}
      />
    </div>
  );
}
