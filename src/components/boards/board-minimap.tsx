"use client";

import { Eye, EyeOff, X } from "lucide-react";
import type { CSSProperties, Dispatch, MouseEvent, SetStateAction } from "react";
import type { BoardElement } from "@/lib/boards/board-types";

type Viewport = { x: number; y: number; zoom: number };

type BoardMiniMapProps = {
  elements: BoardElement[];
  viewport: Viewport;
  onViewportChange: Dispatch<SetStateAction<Viewport>>;
  rightOffset?: number;
  hidden?: boolean;
  onHiddenChange?: (hidden: boolean) => void;
};

const MAP_WIDTH = 172;
const MAP_HEIGHT = 96;
const PADDING = 12;

function getBounds(elements: BoardElement[]) {
  const visible = elements.filter((item) => !item.hidden && item.type !== "connector");
  if (!visible.length) return { minX: -200, minY: -120, maxX: 800, maxY: 520 };
  const minX = Math.min(...visible.map((item) => item.x));
  const minY = Math.min(...visible.map((item) => item.y));
  const maxX = Math.max(...visible.map((item) => item.x + item.width));
  const maxY = Math.max(...visible.map((item) => item.y + item.height));
  return {
    minX: Math.min(minX, -120),
    minY: Math.min(minY, -80),
    maxX: Math.max(maxX, 900),
    maxY: Math.max(maxY, 580),
  };
}

export function BoardMiniMap({ elements, viewport, onViewportChange, rightOffset = 24, hidden = false, onHiddenChange }: BoardMiniMapProps) {
  const bounds = getBounds(elements);
  const worldWidth = Math.max(1, bounds.maxX - bounds.minX);
  const worldHeight = Math.max(1, bounds.maxY - bounds.minY);
  const scale = Math.min((MAP_WIDTH - PADDING * 2) / worldWidth, (MAP_HEIGHT - PADDING * 2) / worldHeight);
  const offsetX = PADDING + (MAP_WIDTH - PADDING * 2 - worldWidth * scale) / 2;
  const offsetY = PADDING + (MAP_HEIGHT - PADDING * 2 - worldHeight * scale) / 2;

  function toMapX(x: number) {
    return offsetX + (x - bounds.minX) * scale;
  }

  function toMapY(y: number) {
    return offsetY + (y - bounds.minY) * scale;
  }

  function handleJump(event: MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const mapX = event.clientX - rect.left;
    const mapY = event.clientY - rect.top;
    const canvasX = (mapX - offsetX) / scale + bounds.minX;
    const canvasY = (mapY - offsetY) / scale + bounds.minY;
    onViewportChange((current) => ({
      ...current,
      x: Math.round(320 - canvasX * current.zoom),
      y: Math.round(220 - canvasY * current.zoom),
    }));
  }

  const viewportWidth = Math.min(MAP_WIDTH - 12, 110 / Math.max(0.5, viewport.zoom));
  const viewportHeight = Math.min(MAP_HEIGHT - 12, 68 / Math.max(0.5, viewport.zoom));
  const viewportLeft = Math.min(MAP_WIDTH - viewportWidth - 6, Math.max(6, toMapX((-viewport.x) / viewport.zoom)));
  const viewportTop = Math.min(MAP_HEIGHT - viewportHeight - 6, Math.max(6, toMapY((-viewport.y) / viewport.zoom)));

  const floatingStyle: CSSProperties = { right: `${rightOffset}px` };

  if (hidden) {
    return (
      <button
        type="button"
        onClick={() => onHiddenChange?.(false)}
        style={floatingStyle}
        className="ft-glass-panel absolute bottom-5 z-30 hidden h-11 items-center gap-2 rounded-2xl px-4 text-xs font-bold text-slate-600 transition hover:shadow-sm lg:inline-flex"
        title="Mostrar minimap"
      >
        <Eye className="h-4 w-4 text-emerald-600" />
        Mostrar minimap
      </button>
    );
  }

  return (
    <aside style={floatingStyle} className="ft-glass-panel absolute bottom-5 z-20 hidden w-[212px] overflow-hidden rounded-[26px] p-3 shadow-[0_20px_45px_rgba(15,23,42,0.12)] lg:block">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="ft-text-label text-slate-500">Minimap</p>
          <p className="mt-1 text-[11px] font-medium text-slate-500">Click para navegar · H para mover</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">{Math.round(viewport.zoom * 100)}%</span>
          <button type="button" onClick={() => onHiddenChange?.(true)} className="grid h-8 w-8 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50" title="Ocultar minimap">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div
        role="button"
        tabIndex={0}
        className="relative mt-3 h-[104px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-white/80"
        onClick={handleJump}
        title="Click para mover el viewport"
      >
        {elements.filter((item) => item.type !== "connector" && !item.hidden).map((item) => (
          <span
            key={item.id}
            className={`absolute rounded-[4px] ${item.type === "table" ? "bg-violet-300" : item.type === "sticky" ? "bg-amber-300" : "bg-emerald-300"}`}
            style={{
              left: toMapX(item.x),
              top: toMapY(item.y),
              width: Math.max(4, item.width * scale),
              height: Math.max(3, item.height * scale),
            }}
          />
        ))}
        <span
          className="absolute rounded-lg border-2 border-emerald-500 bg-emerald-100/20"
          style={{ left: viewportLeft, top: viewportTop, width: viewportWidth, height: viewportHeight }}
        />
      </div>
      <button
        type="button"
        onClick={() => onHiddenChange?.(true)}
        className="mt-3 inline-flex items-center gap-2 rounded-xl px-2 py-1 text-[11px] font-bold text-slate-500 transition hover:bg-slate-100"
      >
        <EyeOff className="h-3.5 w-3.5" /> Quitar de vista
      </button>
    </aside>
  );
}
