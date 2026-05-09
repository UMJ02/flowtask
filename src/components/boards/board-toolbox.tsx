"use client";

import type { PointerEvent as ReactPointerEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  Circle,
  Diamond,
  Eraser,
  GripVertical,
  Maximize2,
  Minimize2,
  MoreHorizontal,
  Pill,
  RectangleHorizontal,
  SquareRoundCorner,
  Wrench,
  X,
} from "lucide-react";
import type { BoardTool, ShapeElement } from "@/lib/boards/board-types";
import { BOARD_TOOLS } from "@/lib/boards/board-tools";

type ShapeKind = ShapeElement["shape"];
type ToolbarMode = "expanded" | "collapsed" | "hidden";

type BoardToolboxProps = {
  activeTool: BoardTool;
  activeShape: ShapeKind;
  onToolChange: (tool: BoardTool) => void;
  onShapeChange: (shape: ShapeKind) => void;
  onRequestClearBoard: () => void;
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

const STORAGE_KEY = "flowtask.board.toolbar.v58.24.5";
const DEFAULT_POSITION = { x: 22, y: 22 };

function toolById(id: BoardTool) {
  return BOARD_TOOLS.find((tool) => tool.id === id)!;
}

export function BoardToolbox({ activeTool, activeShape, onToolChange, onShapeChange, onRequestClearBoard }: BoardToolboxProps) {
  const [moreOpen, setMoreOpen] = useState(false);
  const [shapeOpen, setShapeOpen] = useState(false);
  const [mode, setMode] = useState<ToolbarMode>("expanded");
  const [position, setPosition] = useState(DEFAULT_POSITION);
  const dragRef = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<{ mode: ToolbarMode; position: { x: number; y: number } }>;
      if (parsed.mode === "expanded" || parsed.mode === "collapsed" || parsed.mode === "hidden") setMode(parsed.mode);
      if (parsed.position && Number.isFinite(parsed.position.x) && Number.isFinite(parsed.position.y)) setPosition(parsed.position);
    } catch {
      // Local preference only. Ignore corrupted values.
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ mode, position }));
    } catch {
      // Non-blocking visual preference.
    }
  }, [mode, position]);

  useEffect(() => {
    function onMove(event: PointerEvent) {
      if (!dragRef.current) return;
      const nextX = dragRef.current.originX + event.clientX - dragRef.current.startX;
      const nextY = dragRef.current.originY + event.clientY - dragRef.current.startY;
      const maxX = Math.max(8, window.innerWidth - (mode === "expanded" ? 116 : 72));
      const maxY = Math.max(8, window.innerHeight - 120);
      setPosition({ x: Math.min(Math.max(8, nextX), maxX), y: Math.min(Math.max(8, nextY), maxY) });
    }
    function onUp() {
      dragRef.current = null;
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [mode]);

  const isCollapsed = mode === "collapsed";
  const popoverOffset = isCollapsed ? 58 : 104;

  const containerStyle = useMemo(() => ({ left: position.x, top: position.y }), [position]);

  function startDrag(event: ReactPointerEvent<HTMLButtonElement>) {
    event.preventDefault();
    dragRef.current = { startX: event.clientX, startY: event.clientY, originX: position.x, originY: position.y };
  }

  function changeMode(nextMode: ToolbarMode) {
    setMoreOpen(false);
    setShapeOpen(false);
    setMode(nextMode);
  }

  function selectTool(toolId: BoardTool) {
    onToolChange(toolId);
    setMoreOpen(false);
    if (toolId !== "shape") setShapeOpen(false);
  }

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
            setMoreOpen(false);
            if (isShape) setShapeOpen((value) => !value);
            else setShapeOpen(false);
          }}
          className={`board-tool-palette-btn ${isCollapsed ? "board-tool-palette-btn-icon" : ""} ${active ? "board-tool-palette-btn-active" : ""}`}
          title={tool.hint ?? tool.label}
          aria-label={tool.label}
          data-tooltip={tool.label}
        >
          <Icon className="h-4 w-4" />
          {!isCollapsed ? <span className="board-tool-label">{tool.label}</span> : <span className="board-tooltip" role="tooltip">{tool.label}</span>}
          {isShape && !isCollapsed ? <ChevronDown className="absolute right-1.5 top-1.5 h-3 w-3 text-slate-400" /> : null}
        </button>
        {isShape && shapeOpen ? (
          <div className="board-tool-popover animate-board-pop" style={{ left: popoverOffset, top: 0, width: 184 }}>
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

  if (mode === "hidden") {
    return (
      <button
        type="button"
        onClick={() => changeMode("collapsed")}
        style={containerStyle}
        className="board-tool-floating-trigger animate-board-pop"
        title="Mostrar herramientas"
        aria-label="Mostrar herramientas"
      >
        <Wrench className="h-5 w-5" />
      </button>
    );
  }

  return (
    <aside className={`board-tool-palette board-tool-palette-${mode} animate-board-pop`} style={containerStyle}>
      <div className="board-tool-palette-header">
        <button type="button" onPointerDown={startDrag} className="board-tool-drag-handle cursor-grab active:cursor-grabbing" title="Mover paleta" aria-label="Mover paleta">
          <GripVertical className="h-4 w-4" />
        </button>
        {!isCollapsed ? <p className="board-tool-palette-title">Herramientas</p> : null}
        {isCollapsed ? (
          <button type="button" onClick={() => changeMode("expanded")} className="board-tool-mini-btn" title="Expandir" aria-label="Expandir paleta">
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        ) : (
          <div className="ml-auto flex items-center gap-1">
            <button type="button" onClick={() => changeMode("collapsed")} className="board-tool-mini-btn" title="Contraer" aria-label="Contraer paleta">
              <Minimize2 className="h-3.5 w-3.5" />
            </button>
            <button type="button" onClick={() => changeMode("hidden")} className="board-tool-mini-btn" title="Ocultar" aria-label="Ocultar paleta">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
      <div className="board-tool-palette-body grid gap-1.5">
        {primaryTools.map(toolButton)}
        <div className="relative pt-1">
          <button
            type="button"
            onClick={() => {
              setMoreOpen((value) => !value);
              setShapeOpen(false);
            }}
            className={`board-tool-palette-btn ${isCollapsed ? "board-tool-palette-btn-icon" : ""}`}
            title="Más herramientas"
            aria-label="Más herramientas"
            data-tooltip="Más"
          >
            <MoreHorizontal className="h-4 w-4" />
            {!isCollapsed ? <span className="board-tool-label">Más</span> : <span className="board-tooltip" role="tooltip">Más</span>}
          </button>
          {moreOpen ? (
            <div className="board-tool-popover animate-board-pop" style={{ bottom: 0, left: popoverOffset, width: 190 }}>
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
                      onClick={() => selectTool(tool.id)}
                      className={`flex h-10 items-center gap-2 rounded-xl px-3 text-xs font-bold transition ${active ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50"}`}
                    >
                      <Icon className="h-4 w-4" />
                      {tool.label}
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 border-t border-slate-100 pt-3">
                <p className="px-2 pb-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">Acciones</p>
                <button
                  type="button"
                  onClick={() => {
                    setMoreOpen(false);
                    onRequestClearBoard();
                  }}
                  className="flex h-10 w-full items-center gap-2 rounded-xl px-3 text-xs font-extrabold text-rose-600 transition hover:bg-rose-50"
                >
                  <Eraser className="h-4 w-4" />
                  Limpiar pizarra
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
      {isCollapsed ? (
        <button type="button" onClick={() => changeMode("hidden")} className="board-tool-collapse-hide" title="Ocultar" aria-label="Ocultar paleta">
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </aside>
  );
}
