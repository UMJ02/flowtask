"use client";

import type { PointerEvent as ReactPointerEvent } from "react";
import type { ConnectorElement } from "@/lib/boards/board-types";

type ConnectorLayerProps = {
  connectors: ConnectorElement[];
  selectedIds: string[];
  pendingPoint?: { x: number; y: number } | null;
  onSelect: (id: string) => void;
  onConnectorPointDragStart: (id: string, point: "from" | "to", event: ReactPointerEvent<SVGCircleElement>) => void;
};

function pathFor(connector: ConnectorElement) {
  const lineType = connector.style?.lineType ?? "straight";
  const { from, to } = connector;

  if (lineType === "curve") {
    const midX = (from.x + to.x) / 2;
    return `M ${from.x} ${from.y} C ${midX} ${from.y}, ${midX} ${to.y}, ${to.x} ${to.y}`;
  }

  if (lineType === "elbow") {
    const midX = (from.x + to.x) / 2;
    return `M ${from.x} ${from.y} L ${midX} ${from.y} L ${midX} ${to.y} L ${to.x} ${to.y}`;
  }

  return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
}

export function ConnectorLayer({ connectors, selectedIds, pendingPoint, onSelect, onConnectorPointDragStart }: ConnectorLayerProps) {
  return (
    <svg className="absolute left-0 top-0 z-[4] h-[6000px] w-[6000px] overflow-visible" aria-hidden="true">
      <defs>
        <marker id="board-arrow" markerWidth="12" markerHeight="12" refX="10" refY="4" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,8 L11,4 z" fill="currentColor" />
        </marker>
      </defs>
      {connectors.map((connector) => {
        const selected = selectedIds.includes(connector.id);
        const stroke = connector.style?.stroke ?? "#334155";
        const strokeWidth = connector.style?.strokeWidth ?? 2;
        const midX = (connector.from.x + connector.to.x) / 2;
        const midY = (connector.from.y + connector.to.y) / 2;
        return (
          <g key={connector.id} className="text-slate-700">
            <path
              d={pathFor(connector)}
              fill="none"
              stroke={selected ? "#16C784" : stroke}
              strokeWidth={selected ? strokeWidth + 1 : strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              markerEnd={connector.style?.arrowEnd === false ? undefined : "url(#board-arrow)"}
              className="cursor-pointer transition duration-150 hover:stroke-emerald-500"
              style={{ pointerEvents: "stroke" }}
              onPointerDown={(event: ReactPointerEvent<SVGPathElement>) => {
                event.stopPropagation();
                onSelect(connector.id);
              }}
            />
            {selected ? (
              <>
                <circle cx={connector.from.x} cy={connector.from.y} r="7" className="cursor-move fill-white stroke-emerald-500 stroke-2" onPointerDown={(event) => onConnectorPointDragStart(connector.id, "from", event)} />
                <circle cx={connector.to.x} cy={connector.to.y} r="7" className="cursor-move fill-white stroke-emerald-500 stroke-2" onPointerDown={(event) => onConnectorPointDragStart(connector.id, "to", event)} />
              </>
            ) : null}
            {connector.label ? (
              <foreignObject x={midX - 70} y={midY - 18} width="140" height="36" className="pointer-events-none overflow-visible">
                <div className="mx-auto w-fit max-w-[132px] rounded-full border border-slate-200 bg-white/90 px-2 py-1 text-[11px] font-bold text-slate-600 shadow-sm backdrop-blur">
                  {connector.label}
                </div>
              </foreignObject>
            ) : null}
          </g>
        );
      })}
      {pendingPoint ? <circle cx={pendingPoint.x} cy={pendingPoint.y} r="6" className="fill-emerald-500 stroke-white stroke-2" /> : null}
    </svg>
  );
}
