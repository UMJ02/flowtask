"use client";

import { Download, FileText, GitBranch, Image, Lock, Plus, Trash2, Unlock } from "lucide-react";
import type { BoardElement, BoardStyle } from "@/lib/boards/board-types";

const fillSwatches = ["#FFFFFF", "#ECFDF5", "#DBEAFE", "#F5F3FF", "#FEF3C7", "#FFE4E6"];
const strokeSwatches = ["#334155", "#16C784", "#3B82F6", "#8B5CF6", "#F59E0B", "#FB7185"];

function mergeStyle(selected: BoardElement, style: Partial<BoardStyle>): Partial<BoardElement> {
  return { style: { ...selected.style, ...style } } as Partial<BoardElement>;
}

type Props = {
  selected: BoardElement | null;
  onPatch: (patch: Partial<BoardElement>) => void;
  onDelete: () => void;
  onAddTableRow: () => void;
  onAddTableColumn: () => void;
  onRemoveTableColumn: (columnId: string) => void;
  onRenameTableColumn: (columnId: string, label: string) => void;
};

export function PropertiesPanel({ selected, onPatch, onDelete, onAddTableRow, onAddTableColumn, onRemoveTableColumn, onRenameTableColumn }: Props) {
  const connector = selected?.type === "connector" ? selected : null;
  const table = selected?.type === "table" ? selected : null;
  const isConnector = Boolean(connector);
  const media = selected?.type === "image" || selected?.type === "file" ? selected : null;

  return (
    <aside className="ft-glass-panel absolute bottom-6 right-6 top-6 z-30 hidden w-[312px] overflow-y-auto p-4 xl:block">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="ft-text-label text-slate-500">Propiedades</p>
          <h2 className="ft-title-card mt-1">{selected ? (isConnector ? "Conector" : table ? "Tabla" : media ? (media.type === "image" ? "Imagen" : "Archivo") : "Elemento") : "Pizarra"}</h2>
        </div>
        {selected ? <button type="button" onClick={onDelete} className="grid h-9 w-9 place-items-center rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button> : null}
      </div>
      {!selected ? (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-white/70 p-4 text-sm font-medium text-slate-500">
          Selecciona un elemento para editar color, línea, texto, tablas, bloqueo y organización. Usa Conector para unir ideas del lienzo.
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

          {media ? (
            <>
              <section className="rounded-2xl border border-slate-200 bg-white/80 p-3">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-slate-100 text-slate-600">
                    {media.type === "image" ? <Image className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-800">{media.data.name}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">{Math.max(1, Math.round(media.data.size / 1024))} KB · {media.data.mime}</p>
                  </div>
                </div>
                <a href={media.data.url} target="_blank" rel="noreferrer" className="ft-btn-secondary mt-3 flex h-9 w-full justify-center gap-2 text-xs">
                  <Download className="h-3.5 w-3.5" /> Abrir archivo
                </a>
              </section>
              <section>
                <label className="ft-text-label text-slate-500">Borde</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {strokeSwatches.map((stroke) => (
                    <button key={stroke} type="button" onClick={() => onPatch(mergeStyle(selected, { stroke }))} className="h-7 w-7 rounded-full border border-slate-200 transition hover:scale-110" style={{ backgroundColor: stroke }} />
                  ))}
                </div>
              </section>
            </>
          ) : isConnector ? (
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
          ) : table ? (
            <>
              <section className="rounded-2xl border border-violet-100 bg-violet-50/50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <label className="ft-text-label text-violet-700">Tabla visual</label>
                    <p className="mt-1 text-xs font-semibold text-slate-500">Edita celdas inline en el canvas o administra columnas aquí.</p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button type="button" onClick={onAddTableRow} className="ft-btn-secondary h-9 justify-center gap-2 text-xs"><Plus className="h-3.5 w-3.5" /> Fila</button>
                  <button type="button" onClick={onAddTableColumn} className="ft-btn-secondary h-9 justify-center gap-2 text-xs"><Plus className="h-3.5 w-3.5" /> Columna</button>
                </div>
              </section>
              <section>
                <label className="ft-text-label text-slate-500">Columnas</label>
                <div className="mt-2 space-y-2">
                  {table.columns.map((column) => (
                    <div key={column.id} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 p-2">
                      <input
                        value={column.label}
                        onChange={(event) => onRenameTableColumn(column.id, event.target.value)}
                        className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-700 outline-none"
                      />
                      <button
                        type="button"
                        disabled={table.columns.length <= 1}
                        onClick={() => onRemoveTableColumn(column.id)}
                        className="grid h-8 w-8 place-items-center rounded-lg text-rose-500 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
                        title="Eliminar columna"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
              <section>
                <label className="ft-text-label text-slate-500">Estilo de tabla</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {strokeSwatches.map((stroke) => (
                    <button key={stroke} type="button" onClick={() => onPatch(mergeStyle(selected, { stroke }))} className="h-7 w-7 rounded-full border border-slate-200 transition hover:scale-110" style={{ backgroundColor: stroke }} />
                  ))}
                </div>
              </section>
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
