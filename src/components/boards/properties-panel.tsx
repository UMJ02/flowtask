"use client";

import { Download, FileText, GitBranch, Image, Lock, Minus, Plus, Trash2, Unlock } from "lucide-react";
import type { BoardElement, BoardStyle, ConnectorElement, ShapeElement, TableElement } from "@/lib/boards/board-types";

const fillSwatches = ["#FFFFFF", "#ECFDF5", "#DBEAFE", "#F5F3FF", "#FEF3C7", "#FFE4E6"];
const strokeSwatches = ["#334155", "#16C784", "#3B82F6", "#8B5CF6", "#F59E0B", "#FB7185"];
const shapeOptions: Array<{ value: ShapeElement["shape"]; label: string }> = [
  { value: "rectangle", label: "Rectángulo" },
  { value: "rounded", label: "Redondeado" },
  { value: "circle", label: "Círculo" },
  { value: "diamond", label: "Decisión" },
  { value: "pill", label: "Píldora" },
];

function mergeStyle(selected: BoardElement, style: Partial<BoardStyle>): Partial<BoardElement> {
  return { style: { ...selected.style, ...style } } as Partial<BoardElement>;
}

function numberPatch(value: string, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

type Props = {
  selected: BoardElement | null;
  onPatch: (patch: Partial<BoardElement>) => void;
  onDelete: () => void;
  onAddTableRow: () => void;
  onAddTableColumn: () => void;
  onSetTableRowCount: (count: number) => void;
  onSetTableColumnCount: (count: number) => void;
  onRemoveTableColumn: (columnId: string) => void;
  onRenameTableColumn: (columnId: string, label: string) => void;
};

export function PropertiesPanel({ selected, onPatch, onDelete, onAddTableRow, onAddTableColumn, onSetTableRowCount, onSetTableColumnCount, onRemoveTableColumn, onRenameTableColumn }: Props) {
  const connector = selected?.type === "connector" ? selected : null;
  const table = selected?.type === "table" ? selected : null;
  const shape = selected?.type === "shape" ? selected : null;
  const isConnector = Boolean(connector);
  const media = selected?.type === "image" || selected?.type === "file" ? selected : null;

  return (
    <aside className="ft-glass-panel absolute bottom-6 right-6 top-6 z-30 hidden w-[320px] overflow-y-auto p-4 xl:block">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="ft-text-label text-slate-500">Propiedades</p>
          <h2 className="ft-title-card mt-1">{selected ? (isConnector ? "Conector" : table ? "Tabla" : media ? (media.type === "image" ? "Imagen" : "Archivo") : "Elemento") : "Pizarra"}</h2>
        </div>
        {selected ? <button type="button" onClick={onDelete} className="grid h-9 w-9 place-items-center rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button> : null}
      </div>
      {!selected ? (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-white/70 p-4 text-sm font-medium text-slate-500">
          Selecciona un elemento para editar tamaño, posición, forma, texto, tablas, conectores y organización.
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
              <section className="rounded-2xl border border-slate-200 bg-white/80 p-3">
                <label className="ft-text-label text-slate-500">Puntos del conector</label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div><label className="text-[10px] font-bold uppercase text-slate-400">Inicio X</label><input type="number" value={Math.round(connector!.from.x)} onChange={(event) => onPatch({ from: { ...connector!.from, x: numberPatch(event.target.value, connector!.from.x) } } as Partial<ConnectorElement>)} className="ft-input mt-1 w-full" /></div>
                  <div><label className="text-[10px] font-bold uppercase text-slate-400">Inicio Y</label><input type="number" value={Math.round(connector!.from.y)} onChange={(event) => onPatch({ from: { ...connector!.from, y: numberPatch(event.target.value, connector!.from.y) } } as Partial<ConnectorElement>)} className="ft-input mt-1 w-full" /></div>
                  <div><label className="text-[10px] font-bold uppercase text-slate-400">Final X</label><input type="number" value={Math.round(connector!.to.x)} onChange={(event) => onPatch({ to: { ...connector!.to, x: numberPatch(event.target.value, connector!.to.x) } } as Partial<ConnectorElement>)} className="ft-input mt-1 w-full" /></div>
                  <div><label className="text-[10px] font-bold uppercase text-slate-400">Final Y</label><input type="number" value={Math.round(connector!.to.y)} onChange={(event) => onPatch({ to: { ...connector!.to, y: numberPatch(event.target.value, connector!.to.y) } } as Partial<ConnectorElement>)} className="ft-input mt-1 w-full" /></div>
                </div>
              </section>
              <section>
                <label className="ft-text-label text-slate-500">Etiqueta</label>
                <input value={connector?.label ?? ""} onChange={(event) => onPatch({ label: event.target.value } as Partial<BoardElement>)} placeholder="Ej. Sí, No, Aprobado..." className="ft-input mt-2 w-full" />
              </section>
              <section>
                <label className="ft-text-label text-slate-500">Color de línea</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {strokeSwatches.map((stroke) => <button key={stroke} type="button" onClick={() => onPatch(mergeStyle(selected, { stroke }))} className="h-7 w-7 rounded-full border border-slate-200 transition hover:scale-110" style={{ backgroundColor: stroke }} />)}
                </div>
              </section>
              <section className="grid grid-cols-2 gap-2">
                <div><label className="ft-text-label text-slate-500">Grosor</label><select value={connector?.style?.strokeWidth ?? 2} onChange={(event) => onPatch(mergeStyle(selected, { strokeWidth: Number(event.target.value) }))} className="ft-input mt-2 w-full"><option value={1}>1 px</option><option value={2}>2 px</option><option value={3}>3 px</option><option value={4}>4 px</option></select></div>
                <div><label className="ft-text-label text-slate-500">Tipo</label><select value={connector?.style?.lineType ?? "straight"} onChange={(event) => onPatch(mergeStyle(selected, { lineType: event.target.value as BoardStyle["lineType"] }))} className="ft-input mt-2 w-full"><option value="straight">Recta</option><option value="elbow">Codo</option><option value="curve">Curva</option></select></div>
              </section>
              <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/80 px-3 py-3 text-sm font-bold text-slate-700">Flecha final<input type="checkbox" checked={connector?.style?.arrowEnd !== false} onChange={(event) => onPatch(mergeStyle(selected, { arrowEnd: event.target.checked }))} /></label>
            </>
          ) : (
            <>
              <section className="rounded-2xl border border-slate-200 bg-white/80 p-3">
                <label className="ft-text-label text-slate-500">Posición y tamaño</label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div><label className="text-[10px] font-bold uppercase text-slate-400">X</label><input type="number" value={Math.round(selected.x)} onChange={(event) => onPatch({ x: numberPatch(event.target.value, selected.x) } as Partial<BoardElement>)} className="ft-input mt-1 w-full" /></div>
                  <div><label className="text-[10px] font-bold uppercase text-slate-400">Y</label><input type="number" value={Math.round(selected.y)} onChange={(event) => onPatch({ y: numberPatch(event.target.value, selected.y) } as Partial<BoardElement>)} className="ft-input mt-1 w-full" /></div>
                  <div><label className="text-[10px] font-bold uppercase text-slate-400">W</label><input type="number" min={32} value={Math.round(selected.width)} onChange={(event) => onPatch({ width: Math.max(32, numberPatch(event.target.value, selected.width)) } as Partial<BoardElement>)} className="ft-input mt-1 w-full" /></div>
                  <div><label className="text-[10px] font-bold uppercase text-slate-400">H</label><input type="number" min={32} value={Math.round(selected.height)} onChange={(event) => onPatch({ height: Math.max(32, numberPatch(event.target.value, selected.height)) } as Partial<BoardElement>)} className="ft-input mt-1 w-full" /></div>
                </div>
              </section>

              {shape ? (
                <section>
                  <label className="ft-text-label text-slate-500">Tipo de forma</label>
                  <select value={shape.shape} onChange={(event) => onPatch({ shape: event.target.value as ShapeElement["shape"] } as Partial<ShapeElement>)} className="ft-input mt-2 w-full">
                    {shapeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </section>
              ) : null}

              {media ? (
                <section className="rounded-2xl border border-slate-200 bg-white/80 p-3">
                  <div className="flex items-start gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-slate-100 text-slate-600">{media.type === "image" ? <Image className="h-5 w-5" /> : <FileText className="h-5 w-5" />}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-slate-800">{media.data.name}</p><p className="mt-1 text-xs font-semibold text-slate-500">{Math.max(1, Math.round(media.data.size / 1024))} KB · {media.data.mime}</p></div></div>
                  <a href={media.data.url} target="_blank" rel="noreferrer" className="ft-btn-secondary mt-3 flex h-9 w-full justify-center gap-2 text-xs"><Download className="h-3.5 w-3.5" /> Abrir archivo</a>
                </section>
              ) : null}

              {table ? <TableControls table={table} onAddTableRow={onAddTableRow} onAddTableColumn={onAddTableColumn} onSetTableRowCount={onSetTableRowCount} onSetTableColumnCount={onSetTableColumnCount} onRemoveTableColumn={onRemoveTableColumn} onRenameTableColumn={onRenameTableColumn} /> : null}

              {!table && !media ? (
                <>
                  <section><label className="ft-text-label text-slate-500">Relleno</label><div className="mt-2 flex flex-wrap gap-2">{fillSwatches.map((fill) => <button key={fill} type="button" onClick={() => onPatch(mergeStyle(selected, { fill }))} className="h-7 w-7 rounded-full border border-slate-200 transition hover:scale-110" style={{ backgroundColor: fill }} />)}</div></section>
                  <section><label className="ft-text-label text-slate-500">Texto</label><div className="mt-2 grid grid-cols-2 gap-2"><select value={selected.style?.fontSize ?? 14} onChange={(event) => onPatch(mergeStyle(selected, { fontSize: Number(event.target.value) }))} className="ft-input w-full"><option value={12}>12 px</option><option value={14}>14 px</option><option value={16}>16 px</option><option value={18}>18 px</option><option value={22}>22 px</option></select><select value={selected.style?.textAlign ?? "center"} onChange={(event) => onPatch(mergeStyle(selected, { textAlign: event.target.value as BoardStyle["textAlign"] }))} className="ft-input w-full"><option value="left">Izquierda</option><option value="center">Centro</option><option value="right">Derecha</option></select></div></section>
                </>
              ) : null}
            </>
          )}

          <button type="button" onClick={() => onPatch({ locked: !selected.locked } as Partial<BoardElement>)} className="ft-btn-secondary w-full justify-between">
            {selected.locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
            {selected.locked ? "Desbloquear" : "Bloquear"}
          </button>
        </div>
      )}
    </aside>
  );
}

function Stepper({ label, value, min, onChange }: { label: string; value: number; min: number; onChange: (value: number) => void }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 p-2">
      <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">{label}</label>
      <div className="mt-2 flex items-center gap-2">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} className="grid h-8 w-8 place-items-center rounded-xl border border-slate-200 hover:bg-slate-50"><Minus className="h-3.5 w-3.5" /></button>
        <input type="number" min={min} value={value} onChange={(event) => onChange(Math.max(min, numberPatch(event.target.value, value)))} className="ft-input h-8 min-w-0 flex-1 text-center" />
        <button type="button" onClick={() => onChange(value + 1)} className="grid h-8 w-8 place-items-center rounded-xl border border-slate-200 hover:bg-slate-50"><Plus className="h-3.5 w-3.5" /></button>
      </div>
    </div>
  );
}

function TableControls({ table, onAddTableRow, onAddTableColumn, onSetTableRowCount, onSetTableColumnCount, onRemoveTableColumn, onRenameTableColumn }: { table: TableElement; onAddTableRow: () => void; onAddTableColumn: () => void; onSetTableRowCount: (count: number) => void; onSetTableColumnCount: (count: number) => void; onRemoveTableColumn: (columnId: string) => void; onRenameTableColumn: (columnId: string, label: string) => void }) {
  return (
    <>
      <section className="rounded-2xl border border-violet-100 bg-violet-50/50 p-3">
        <label className="ft-text-label text-violet-700">Tabla visual</label>
        <p className="mt-1 text-xs font-semibold text-slate-500">Edita celdas inline o define filas/columnas con valores exactos.</p>
        <div className="mt-3 grid gap-2">
          <Stepper label="Filas" value={table.rows.length} min={1} onChange={onSetTableRowCount} />
          <Stepper label="Columnas" value={table.columns.length} min={1} onChange={onSetTableColumnCount} />
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
              <input value={column.label} onChange={(event) => onRenameTableColumn(column.id, event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-700 outline-none" />
              <button type="button" disabled={table.columns.length <= 1} onClick={() => onRemoveTableColumn(column.id)} className="grid h-8 w-8 place-items-center rounded-lg text-rose-500 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40" title="Eliminar columna"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
