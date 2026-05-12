"use client";

import type { PointerEvent as ReactPointerEvent } from "react";
import { MessageCircle } from "lucide-react";
import type { BoardElement, VisualBoardComment } from "@/lib/boards/board-types";

type Props = {
  comments: VisualBoardComment[];
  elements: BoardElement[];
  selectedElementId?: string | null;
  onSelectComment: (comment: VisualBoardComment) => void;
  onDragCommentStart: (comment: VisualBoardComment, point: { x: number; y: number }, event: ReactPointerEvent<HTMLButtonElement>) => void;
};

export function getCommentPinPoint(comment: VisualBoardComment, elements: BoardElement[]) {
  if (comment.x !== null && comment.y !== null) return { x: Number(comment.x), y: Number(comment.y) };
  if (!comment.elementId) return null;
  const element = elements.find((item) => item.id === comment.elementId);
  if (!element) return null;
  return { x: element.x + element.width - 8, y: element.y - 8 };
}

export function BoardCommentPins({ comments, elements, selectedElementId, onSelectComment, onDragCommentStart }: Props) {
  const unresolved = comments.filter((comment) => !comment.resolved).slice(0, 50);
  return (
    <div className="pointer-events-none absolute inset-0 z-30">
      {unresolved.map((comment) => {
        const point = getCommentPinPoint(comment, elements);
        if (!point) return null;
        const active = Boolean(comment.elementId && comment.elementId === selectedElementId);
        return (
          <button
            key={comment.id}
            type="button"
            onPointerDown={(event) => onDragCommentStart(comment, point, event)}
            onClick={(event) => {
              event.stopPropagation();
              onSelectComment(comment);
            }}
            className={`pointer-events-auto absolute grid h-8 w-8 place-items-center rounded-full border bg-white text-emerald-700 shadow-sm transition hover:translate-y-0 hover:border-emerald-300 hover:bg-emerald-50 ${active ? "border-emerald-400 ring-4 ring-emerald-500/10" : "border-slate-200"}`}
            style={{ left: point.x, top: point.y }}
            title="Arrastra para mover · clic para editar"
          >
            <MessageCircle className="h-4 w-4" />
          </button>
        );
      })}
    </div>
  );
}
