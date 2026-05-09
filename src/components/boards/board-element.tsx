"use client";

import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import type { BoardElement } from "@/lib/boards/board-types";

type BoardElementViewProps = {
  element: BoardElement;
  selected: boolean;
  onSelect: (id: string) => void;
  onDragStart: (id: string, event: ReactPointerEvent<HTMLDivElement>) => void;
  onUpdateContent: (id: string, content: string) => void;
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

export function BoardElementView({ element, selected, onSelect, onDragStart, onUpdateContent }: BoardElementViewProps) {
  const common = "group absolute touch-none select-none transition duration-150";
  const selection = selected ? "ring-2 ring-emerald-400 ring-offset-2 ring-offset-[#FBFCFE]" : "hover:ring-1 hover:ring-slate-300";

  if (element.type === "table") {
    return (
      <div style={getStyle(element)} className={`${common} overflow-hidden rounded-[16px] border border-violet-200 bg-white ${selection}`} onPointerDown={(event) => onDragStart(element.id, event)} onClick={() => onSelect(element.id)}>
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
      className={`${common} ${selection} flex items-center justify-center border p-3`}
      onPointerDown={(event) => onDragStart(element.id, event)}
      onClick={() => onSelect(element.id)}
    >
      <textarea
        value={content}
        onPointerDown={(event) => event.stopPropagation()}
        onChange={(event) => onUpdateContent(element.id, event.target.value)}
        className="h-full w-full resize-none border-none bg-transparent text-center text-[14px] font-semibold leading-5 outline-none placeholder:text-slate-400"
        style={{ color: textColor, fontSize: element.style?.fontSize ?? 14, fontWeight: element.style?.fontWeight ?? 650, textAlign: element.style?.textAlign ?? "center" }}
      />
    </div>
  );
}
