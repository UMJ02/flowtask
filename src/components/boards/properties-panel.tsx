"use client";

import { Lock, Trash2, Unlock } from "lucide-react";
import type { BoardElement } from "@/lib/boards/board-types";

export function PropertiesPanel({ selected, onPatch, onDelete }: { selected: BoardElement | null; onPatch: (patch: Partial<BoardElement>) => void; onDelete: () => void }) {
  return (
    <aside className="ft-glass-panel absolute bottom-6 right-6 top-6 z-30 hidden w-[300px] overflow-y-auto p-4 xl:block">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="ft-text-label text-slate-500">Propiedades</p>
          <h2 className="ft-title-card mt-1">{selected ? "Elemento" : "Pizarra"}</h2>
        </div>
        {selected ? <button type="button" onClick={onDelete} className="grid h-9 w-9 place-items-center rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button> : null}
      </div>
      {!selected ? (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-white/70 p-4 text-sm font-medium text-slate-500">
          Selecciona un elemento para editar color, tamaño, bloqueo y organización.
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          <section>
            <label className="ft-text-label text-slate-500">Tipo</label>
            <p className="mt-2 rounded-xl bg-slate-50 px-3 py-2 text-sm font-semibold capitalize text-slate-700">{selected.type}</p>
          </section>
          <section className="grid grid-cols-2 gap-2">
            <div><label className="ft-text-label text-slate-500">X</label><p className="mt-2 rounded-xl bg-slate-50 px-3 py-2 text-sm font-semibold">{Math.round(selected.x)}</p></div>
            <div><label className="ft-text-label text-slate-500">Y</label><p className="mt-2 rounded-xl bg-slate-50 px-3 py-2 text-sm font-semibold">{Math.round(selected.y)}</p></div>
          </section>
          <button type="button" onClick={() => onPatch({ locked: !selected.locked } as Partial<BoardElement>)} className="ft-btn-secondary w-full justify-between">
            {selected.locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
            {selected.locked ? "Desbloquear" : "Bloquear"}
          </button>
        </div>
      )}
    </aside>
  );
}
