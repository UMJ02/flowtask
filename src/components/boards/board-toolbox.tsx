"use client";

import { useState } from "react";
import { ChevronDown, Circle, Diamond, MoreHorizontal, Pill, RectangleHorizontal, SquareRoundCorner } from "lucide-react";
import type { BoardTool, ShapeElement } from "@/lib/boards/board-types";
import { BOARD_TOOLS } from "@/lib/boards/board-tools";

type ShapeKind = ShapeElement["shape"];

type BoardToolboxProps = {
  activeTool: BoardTool;
  activeShape: ShapeKind;
  onToolChange: (tool: BoardTool) => void;
  onShapeChange: (shape: ShapeKind) => void;
};

const primaryTools: BoardTool[] = ["select", "hand", "sticky", "text", "shape", "connector", "table", "comment"];
const secondaryTools: BoardTool[] = ["image", "file"];

const shapeOptions: Array<{ id: ShapeKind; label: string; icon: typeof RectangleHorizontal }> = [
  { id: "rectangle", label: "Rectángulo", icon: RectangleHorizontal },
  { id: "rounded", label: "Redondeado", icon: SquareRoundCorner },
  { id: "circle", label: "Círculo", icon: Circle },
  { id: "diamond", label: "Decisión", icon: Diamond },
  { id: "pill", label: "Píldora", icon: Pill },
];

function toolById(id: BoardTool) {
  return BOARD_TOOLS.find((tool) => tool.id === id)!;
}

export function BoardToolbox({ activeTool, activeShape, onToolChange, onShapeChange }: BoardToolboxProps) {
  const [moreOpen, setMoreOpen] = useState(false);
  const [shapeOpen, setShapeOpen] = useState(false);

  function toolButton(toolId: BoardTool) {
    const tool = toolById(toolId);
    const Icon = tool.icon;
    const active = activeTool === tool.id;
    const isShape = tool.id === "shape";
    return (
      <div key={tool.id} className="relative">
        <button
          type="button"
          onClick={() => {
            onToolChange(tool.id);
            if (isShape) setShapeOpen((value) => !value);
          }}
          className={`board-tool-palette-btn ${active ? "board-tool-palette-btn-active" : ""}`}
          title={tool.hint ?? tool.label}
        >
          <Icon className="h-4 w-4" />
          <span>{tool.label}</span>
          {isShape ? <ChevronDown className="absolute right-1.5 top-1.5 h-3 w-3 text-slate-400" /> : null}
        </button>
        {isShape && shapeOpen ? (
          <div className="board-tool-popover left-[76px] top-0 w-[180px]">
            <p className="px-2 pb-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">Tipo de forma</p>
            <div className="grid gap-1">
              {shapeOptions.map((shape) => {
                const ShapeIcon = shape.icon;
                const selected = activeShape === shape.id;
                return (
                  <button
                    key={shape.id}
                    type="button"
                    onClick={() => {
                      onShapeChange(shape.id);
                      onToolChange("shape");
                      setShapeOpen(false);
                    }}
                    className={`flex h-10 items-center gap-2 rounded-xl px-3 text-xs font-bold transition ${selected ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50"}`}
                  >
                    <ShapeIcon className="h-4 w-4" />
                    {shape.label}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <aside className="board-tool-palette absolute left-5 top-5 z-30">
      <p className="px-1 text-center text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">Herramientas</p>
      <div className="mt-3 grid gap-1.5">
        {primaryTools.map(toolButton)}
        <div className="relative pt-1">
          <button
            type="button"
            onClick={() => setMoreOpen((value) => !value)}
            className="board-tool-palette-btn"
            title="Más herramientas"
          >
            <MoreHorizontal className="h-4 w-4" />
            <span>Más</span>
          </button>
          {moreOpen ? (
            <div className="board-tool-popover bottom-0 left-[76px] w-[172px]">
              <p className="px-2 pb-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">Media</p>
              <div className="grid gap-1">
                {secondaryTools.map((toolId) => {
                  const tool = toolById(toolId);
                  const Icon = tool.icon;
                  const active = activeTool === tool.id;
                  return (
                    <button
                      key={tool.id}
                      type="button"
                      onClick={() => {
                        onToolChange(tool.id);
                        setMoreOpen(false);
                      }}
                      className={`flex h-10 items-center gap-2 rounded-xl px-3 text-xs font-bold transition ${active ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50"}`}
                    >
                      <Icon className="h-4 w-4" />
                      {tool.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
