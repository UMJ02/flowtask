"use client";

import { GitBranch, Lock, Trash2, Unlock } from "lucide-react";
import type { BoardElement, BoardStyle } from "@/lib/boards/board-types";

const fillSwatches = ["#FFFFFF", "#ECFDF5", "#DBEAFE", "#F5F3FF", "#FEF3C7", "#FFE4E6"];
const strokeSwatches = ["#334155", "#16C784", "#3B82F6", "#8B5CF6", "#F59E0B", "#FB7185"];

function mergeStyle(selected: BoardElement, style: Partial<BoardStyle>): Partial<BoardElement> {
  return { style: { ...selected.style, ...style } } as Partial<BoardElement>;
}

export function PropertiesPanel({ selected, onPatch, onDelete }: { selected: BoardElement | null; onPatch: (patch: Partial<BoardElement>) => void; onDelete: () => void }) {
  const connector = selected?.type === "connector" ? selected : null;
  const isConnector = Boolean(connector);

  return (
    <aside className="ft-glass-panel absolute bottom-6 right-6 top-6 z-30 hidden w-[312px] overflow-y-auto p-4 xl:block">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="ft-text-label text-slate-500">Propiedades</p>
          <h2 className="ft-title-card mt-1">{selected ? (isConnector ? "Conector" : "Elemento") : "Pizarra"}</h2>
        </div>
        {selected ? <button type="button" onClick={onDelete} className="grid h-9 w-9 place-items-center rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button> : null}
      </div>
      {!selected ? (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-white/70 p-4 text-sm font-medium text-slate-500">
          Selecciona un elemento para editar color, línea, texto, bloqueo y organización. Usa Conector para unir ideas del lienzo.
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          <section>
            <label className="ft-text-label text-slate-500">Tipo</label>
            <p className="mt-2 flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm font-semibold capitalize text-slate-700">
              {isConnector ? <GitBranch className="h-4 w-4 text-emerald-600" /> : null}
              {selected.type}
            </p>
          </section>

          {isConnector ? (
            <>
              <section>
                <label className="ft-text-label text-slate-500">Etiqueta</label>
                <input
                  value={connector?.label ?? ""}
                  onChange={(event) => onPatch({ label: event.target.value } as Partial<BoardElement>)}
                  placeholder="Ej. Sí, No, Aprobado..."
                  className="ft-input mt-2 w-full"
                />
              </section>
              <section>
                <label className="ft-text-label text-slate-500">Color de línea</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {strokeSwatches.map((stroke) => (
                    <button key={stroke} type="button" onClick={() => onPatch(mergeStyle(selected, { stroke }))} className="h-7 w-7 rounded-full border border-slate-200 transition hover:scale-110" style={{ backgroundColor: stroke }} />
                  ))}
                </div>
              </section>
              <section className="grid grid-cols-2 gap-2">
                <div>
                  <label className="ft-text-label text-slate-500">Grosor</label>
                  <select value={connector?.style?.strokeWidth ?? 2} onChange={(event) => onPatch(mergeStyle(selected, { strokeWidth: Number(event.target.value) }))} className="ft-input mt-2 w-full">
                    <option value={1}>1 px</option>
                    <option value={2}>2 px</option>
                    <option value={3}>3 px</option>
                    <option value={4}>4 px</option>
                  </select>
                </div>
                <div>
                  <label className="ft-text-label text-slate-500">Tipo</label>
                  <select value={connector?.style?.lineType ?? "straight"} onChange={(event) => onPatch(mergeStyle(selected, { lineType: event.target.value as BoardStyle["lineType"] }))} className="ft-input mt-2 w-full">
                    <option value="straight">Recta</option>
                    <option value="elbow">Codo</option>
                    <option value="curve">Curva</option>
                  </select>
                </div>
              </section>
              <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/80 px-3 py-3 text-sm font-bold text-slate-700">
                Flecha final
                <input type="checkbox" checked={connector?.style?.arrowEnd !== false} onChange={(event) => onPatch(mergeStyle(selected, { arrowEnd: event.target.checked }))} />
              </label>
            </>
          ) : (
            <>
              <section>
                <label className="ft-text-label text-slate-500">Relleno</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {fillSwatches.map((fill) => (
                    <button key={fill} type="button" onClick={() => onPatch(mergeStyle(selected, { fill }))} className="h-7 w-7 rounded-full border border-slate-200 transition hover:scale-110" style={{ backgroundColor: fill }} />
                  ))}
                </div>
              </section>
              <section>
                <label className="ft-text-label text-slate-500">Texto</label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <select value={selected.style?.fontSize ?? 14} onChange={(event) => onPatch(mergeStyle(selected, { fontSize: Number(event.target.value) }))} className="ft-input w-full">
                    <option value={12}>12 px</option>
                    <option value={14}>14 px</option>
                    <option value={16}>16 px</option>
                    <option value={18}>18 px</option>
                    <option value={22}>22 px</option>
                  </select>
                  <select value={selected.style?.textAlign ?? "center"} onChange={(event) => onPatch(mergeStyle(selected, { textAlign: event.target.value as BoardStyle["textAlign"] }))} className="ft-input w-full">
                    <option value="left">Izquierda</option>
                    <option value="center">Centro</option>
                    <option value="right">Derecha</option>
                  </select>
                </div>
              </section>
            </>
          )}

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
