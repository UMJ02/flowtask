"use client";

import { Copy, GitBranch, Plus, Table2, Trash2 } from "lucide-react";
import type { CSSProperties } from "react";
import type { BoardElement } from "@/lib/boards/board-types";

type Props = {
  selected: BoardElement | null;
  onDuplicate: () => void;
  onDelete: () => void;
  onChangeColor: (color: string) => void;
  onAddTableRow: () => void;
  onAddTableColumn: () => void;
  rightOffset?: number;
};

const colors = ["#FFFFFF", "#ECFDF5", "#DBEAFE", "#F5F3FF", "#FEF3C7", "#FFE4E6", "#334155", "#16C784"];

export function FloatingFormatToolbar({ selected, onDuplicate, onDelete, onChangeColor, onAddTableRow, onAddTableColumn, rightOffset = 360 }: Props) {
  if (!selected) return null;
  const isConnector = selected.type === "connector";
  const isTable = selected.type === "table";
  const style: CSSProperties = { right: `${rightOffset}px` };

  return (
    <div style={style} className="ft-popover-surface absolute top-5 z-50 flex items-center gap-2 rounded-[28px] px-4 py-3 shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
      {isConnector ? <GitBranch className="h-4 w-4 text-emerald-600" /> : null}
      {isTable ? <Table2 className="h-4 w-4 text-violet-600" /> : null}
      <div className="flex items-center gap-2 border-r border-slate-200 pr-3">
        {colors.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChangeColor(color)}
            className="h-8 w-8 rounded-full border border-slate-200 transition hover:shadow-sm"
            style={{ backgroundColor: color }}
            aria-label={isConnector ? `Color de línea ${color}` : `Color ${color}`}
          />
        ))}
      </div>
      {isTable ? (
        <div className="flex items-center gap-1 border-r border-slate-200 pr-3">
          <button type="button" onClick={onAddTableRow} className="ft-pressable inline-flex h-9 items-center gap-1 rounded-xl px-2 text-xs font-bold text-slate-600 hover:bg-slate-100" title="Agregar fila"><Plus className="h-3.5 w-3.5" /> Fila</button>
          <button type="button" onClick={onAddTableColumn} className="ft-pressable inline-flex h-9 items-center gap-1 rounded-xl px-2 text-xs font-bold text-slate-600 hover:bg-slate-100" title="Agregar columna"><Plus className="h-3.5 w-3.5" /> Col.</button>
        </div>
      ) : null}
      <button type="button" onClick={onDuplicate} className="ft-pressable grid h-9 w-9 place-items-center rounded-xl text-slate-600 hover:bg-slate-100" title="Duplicar"><Copy className="h-4 w-4" /></button>
      <button type="button" onClick={onDelete} className="ft-pressable grid h-9 w-9 place-items-center rounded-xl text-rose-600 hover:bg-rose-50" title="Borrar"><Trash2 className="h-4 w-4" /></button>
    </div>
  );
}
