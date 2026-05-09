"use client";

import type { BoardTool } from "@/lib/boards/board-types";
import { BOARD_TOOLS } from "@/lib/boards/board-tools";

type BoardToolboxProps = { activeTool: BoardTool; onToolChange: (tool: BoardTool) => void };

const groupLabels: Record<string, string> = {
  basics: "Básicos",
  diagrams: "Diagramas",
  tables: "Tablas",
  media: "Media",
};

export function BoardToolbox({ activeTool, onToolChange }: BoardToolboxProps) {
  const groups = ["basics", "diagrams", "tables", "media"] as const;

  return (
    <aside className="board-panel absolute left-4 top-4 z-30 w-[92px] max-h-[calc(100%-120px)] overflow-y-auto p-2 lg:left-5 lg:top-5">
      <p className="px-1 text-center text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">Herr.</p>
      <div className="mt-3 space-y-3">
        {groups.map((group) => {
          const tools = BOARD_TOOLS.filter((tool) => tool.group === group);
          if (!tools.length) return null;
          return (
            <section key={group}>
              <p className="mb-1.5 text-center text-[9px] font-extrabold uppercase tracking-[0.14em] text-slate-400">{groupLabels[group]}</p>
              <div className="grid gap-1.5">
                {tools.map((tool) => {
                  const Icon = tool.icon;
                  const active = activeTool === tool.id;
                  return (
                    <button
                      key={tool.id}
                      type="button"
                      onClick={() => onToolChange(tool.id)}
                      className={`ft-pressable grid h-[62px] place-items-center rounded-[16px] border text-center transition ${active ? "border-emerald-300 bg-emerald-50 text-emerald-700 shadow-[0_10px_22px_rgba(22,199,132,.10)]" : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50/70"}`}
                      title={tool.hint ?? tool.label}
                    >
                      <span className="flex flex-col items-center gap-1">
                        <Icon className="h-4 w-4" />
                        <span className="max-w-[58px] truncate text-[10px] font-bold leading-tight">{tool.label}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </aside>
  );
}
