"use client";

import type { BoardTool } from "@/lib/boards/board-types";
import { BOARD_TOOLS } from "@/lib/boards/board-tools";

type BoardToolboxProps = { activeTool: BoardTool; onToolChange: (tool: BoardTool) => void };

export function BoardToolbox({ activeTool, onToolChange }: BoardToolboxProps) {
  const groups = [
    { id: "basics", label: "Básicos" },
    { id: "tables", label: "Tablas" },
  ] as const;

  return (
    <aside className="ft-glass-panel absolute left-4 top-4 z-30 w-[220px] p-3 md:left-6 md:top-6">
      <p className="ft-text-label px-2 text-slate-500">Herramientas</p>
      <div className="mt-3 space-y-4">
        {groups.map((group) => (
          <section key={group.id}>
            <p className="mb-2 px-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">{group.label}</p>
            <div className="grid grid-cols-2 gap-2">
              {BOARD_TOOLS.filter((tool) => tool.group === group.id).map((tool) => {
                const Icon = tool.icon;
                const active = activeTool === tool.id;
                return (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => onToolChange(tool.id)}
                    className={`ft-pressable flex min-h-[74px] flex-col items-center justify-center gap-2 rounded-[16px] border px-2 text-center transition ${active ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50/70"}`}
                    title={tool.hint}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-[11px] font-bold leading-tight">{tool.label}</span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </aside>
  );
}
