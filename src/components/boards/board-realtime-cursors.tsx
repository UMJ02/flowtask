"use client";

import type { VisualBoardPresence } from "@/lib/boards/board-types";

type BoardRealtimeCursorsProps = {
  presence: VisualBoardPresence[];
};

export function BoardRealtimeCursors({ presence }: BoardRealtimeCursorsProps) {
  const cursors = presence.filter((item) => !item.isSelf && item.cursor);
  if (!cursors.length) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-[80]">
      {cursors.map((item) => {
        const cursor = item.cursor!;
        return (
          <div
            key={item.userId}
            className="absolute flex items-start gap-1.5 transition-transform duration-150 ease-out"
            style={{ transform: `translate(${cursor.x}px, ${cursor.y}px)` }}
          >
            <svg width="22" height="22" viewBox="0 0 22 22" className="drop-shadow-sm" aria-hidden="true">
              <path d="M3 2.5L18.5 11L11.5 13L8 19.5L3 2.5Z" fill={item.color} stroke="white" strokeWidth="1.6" />
            </svg>
            <span
              className="mt-3 rounded-full px-2 py-1 text-[11px] font-bold text-white shadow-sm"
              style={{ backgroundColor: item.color }}
            >
              {item.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}
