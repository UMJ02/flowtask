"use client";

import { Copy, GitBranch, Trash2 } from "lucide-react";
import type { BoardElement } from "@/lib/boards/board-types";

type Props = {
  selected: BoardElement | null;
  onDuplicate: () => void;
  onDelete: () => void;
  onChangeColor: (color: string) => void;
};

const colors = ["#FFFFFF", "#ECFDF5", "#DBEAFE", "#F5F3FF", "#FEF3C7", "#FFE4E6", "#334155", "#16C784"];

export function FloatingFormatToolbar({ selected, onDuplicate, onDelete, onChangeColor }: Props) {
  if (!selected) return null;
  const isConnector = selected.type === "connector";
  return (
    <div className="ft-popover-surface absolute left-1/2 top-5 z-50 flex -translate-x-1/2 items-center gap-2 px-3 py-2">
      {isConnector ? <GitBranch className="h-4 w-4 text-emerald-600" /> : null}
      <div className="flex items-center gap-1 border-r border-slate-200 pr-2">
        {colors.map((color) => (
          <button key={color} type="button" onClick={() => onChangeColor(color)} className="h-6 w-6 rounded-full border border-slate-200 transition hover:scale-110" style={{ backgroundColor: color }} aria-label={isConnector ? `Color de línea ${color}` : `Color ${color}`} />
        ))}
      </div>
      <button type="button" onClick={onDuplicate} className="ft-pressable grid h-8 w-8 place-items-center rounded-xl text-slate-600 hover:bg-slate-100" title="Duplicar"><Copy className="h-4 w-4" /></button>
      <button type="button" onClick={onDelete} className="ft-pressable grid h-8 w-8 place-items-center rounded-xl text-rose-600 hover:bg-rose-50" title="Borrar"><Trash2 className="h-4 w-4" /></button>
    </div>
  );
}
