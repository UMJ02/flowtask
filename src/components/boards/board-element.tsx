"use client";

import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import type { BoardElement, BoardTool } from "@/lib/boards/board-types";

type BoardElementViewProps = {
  element: BoardElement;
  selected: boolean;
  activeTool: BoardTool;
  onSelect: (id: string) => void;
  onDragStart: (id: string, event: ReactPointerEvent<HTMLDivElement>) => void;
  onUpdateContent: (id: string, content: string) => void;
  onConnectorTarget: (id: string) => void;
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

export function BoardElementView({ element, selected, activeTool, onSelect, onDragStart, onUpdateContent, onConnectorTarget }: BoardElementViewProps) {
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
      <div style={getStyle(element)} className={`${common} overflow-hidden rounded-[16px] border border-violet-200 bg-white ${selection} ${connectorMode ? "cursor-crosshair hover:border-emerald-300" : ""}`} onPointerDown={handlePointerDown} onClick={handleClick}>
        <table className="h-full w-full border-collapse text-[12px]">
          <thead className="bg-violet-50 text-slate-700">
            <tr>{element.columns.map((column) => <th key={column.id} className="border border-violet-100 px-2 py-2 text-left font-bold">{column.label}</th>)}</tr>
          </thead>
          <tbody>
            {element.rows.map((row) => (
              <tr key={row.id}>{element.columns.map((column) => <td key={column.id} className="border border-slate-100 px-2 py-2 text-slate-700">{row.cells[column.id] ?? ""}</td>)}</tr>
            ))}
          </tbody>
        </table>
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
