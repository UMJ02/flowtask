"use client";

import type { Dispatch, MouseEvent, SetStateAction } from "react";
import type { BoardElement } from "@/lib/boards/board-types";

type Viewport = { x: number; y: number; zoom: number };

type BoardMiniMapProps = {
  elements: BoardElement[];
  viewport: Viewport;
  onViewportChange: Dispatch<SetStateAction<Viewport>>;
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

export function BoardMiniMap({ elements, viewport, onViewportChange }: BoardMiniMapProps) {
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

  return (
    <aside className="ft-glass-panel absolute bottom-5 right-5 z-20 hidden w-[196px] p-3 lg:block">
      <div className="flex items-center justify-between">
        <p className="ft-text-label text-slate-500">Minimap</p>
        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">{Math.round(viewport.zoom * 100)}%</span>
      </div>
      <div
        role="button"
        tabIndex={0}
        className="relative mt-2 h-[96px] w-[172px] overflow-hidden rounded-xl border border-slate-200 bg-white/80"
        onClick={handleJump}
        title="Click para mover el viewport"
      >
        {elements.filter((item) => item.type !== "connector" && !item.hidden).map((item) => (
          <span
            key={item.id}
            className={`absolute rounded-[3px] ${item.type === "table" ? "bg-violet-300" : item.type === "sticky" ? "bg-amber-300" : "bg-emerald-300"}`}
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
      <p className="mt-2 text-[11px] font-medium text-slate-500">Click para navegar · H para mover</p>
    </aside>
  );
}
