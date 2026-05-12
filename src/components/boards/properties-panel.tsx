"use client";

import {
  AlignHorizontalJustifyCenter,
  ArrowDownUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Download,
  FileText,
  GitBranch,
  GripVertical,
  Image,
  LayoutTemplate,
  Lock,
  MapPin,
  Minus,
  Palette,
  PanelRightClose,
  PanelRightOpen,
  Plus,
  Ruler,
  Table2,
  Type,
  Trash2,
  Unlock,
} from "lucide-react";
import { useState, type ReactNode } from "react";
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
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  onPatch: (patch: Partial<BoardElement>) => void;
  onDelete: () => void;
  onSetTableRowCount: (count: number) => void;
  onSetTableColumnCount: (count: number) => void;
  onRemoveTableColumn: (columnId: string) => void;
  onRenameTableColumn: (columnId: string, label: string) => void;
  onShowHiddenTableRows: () => void;
  onShowHiddenTableColumns: () => void;
};

type SectionKey = "position" | "table" | "columns" | "appearance" | "connector" | "media";

export function PropertiesPanel({
  selected,
  collapsed,
  onCollapsedChange,
  onPatch,
  onDelete,
  onSetTableRowCount,
  onSetTableColumnCount,
  onRemoveTableColumn,
  onRenameTableColumn,
  onShowHiddenTableRows,
  onShowHiddenTableColumns,
}: Props) {
  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>({
    position: true,
    table: true,
    columns: true,
    appearance: true,
    connector: true,
    media: true,
  });

  function toggleSection(section: SectionKey) {
    setOpenSections((current) => ({ ...current, [section]: !current[section] }));
  }

  const connector = selected?.type === "connector" ? selected : null;
  const table = selected?.type === "table" ? selected : null;
  const shape = selected?.type === "shape" ? selected : null;
  const media = selected?.type === "image" || selected?.type === "file" ? selected : null;
  const isConnector = Boolean(connector);
  const title = selected ? (isConnector ? "Conector" : table ? "Tabla" : media ? (media.type === "image" ? "Imagen" : "Archivo") : "Elemento") : "Pizarra";

  if (collapsed) {
    return (
      <aside className="board-inspector board-inspector-collapsed absolute bottom-6 right-6 top-4 z-30 hidden w-[76px] overflow-hidden rounded-[18px] border ft-border bg-white/95 shadow-sm xl:flex xl:flex-col">
        <div className="flex items-center justify-center border-b ft-border px-3 py-3">
          <button type="button" onClick={() => onCollapsedChange(false)} className="grid h-9 w-9 place-items-center rounded-xl border ft-border bg-white text-slate-700 transition hover:bg-slate-50" title="Expandir propiedades">
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>
        <div className="flex flex-1 flex-col items-center gap-4 px-3 py-3">
          <CollapsedRailIcon icon={<LayoutTemplate className="h-5 w-5" />} tone="violet" label="Propiedades" />
          <CollapsedRailIcon icon={<Table2 className="h-5 w-5" />} tone="blue" label="Tipo" />
          <CollapsedRailIcon icon={<Ruler className="h-5 w-5" />} tone="emerald" label="Posición" />
          <CollapsedRailIcon icon={<Palette className="h-5 w-5" />} tone="violet" label="Visual" />
          <CollapsedRailIcon icon={<AlignHorizontalJustifyCenter className="h-5 w-5" />} tone="amber" label="Columnas" />
        </div>
        <div className="border-t ft-border px-3 py-3">
          <div className="grid place-items-center rounded-xl border ft-border bg-slate-50 py-3 text-slate-500">
            {selected?.locked ? <Lock className="h-5 w-5" /> : <Unlock className="h-5 w-5" />}
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="board-inspector absolute bottom-6 right-6 top-4 z-30 hidden w-[404px] overflow-hidden rounded-[18px] border ft-border bg-white/95 shadow-sm xl:flex xl:flex-col">
      <div className="sticky top-0 z-20 border-b ft-border bg-white/95 px-3 py-3 backdrop-blur">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-600">
              <LayoutTemplate className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-[18px] font-extrabold tracking-[-0.03em] text-slate-900">Propiedades</h2>
              <p className="mt-0.5 text-xs font-semibold text-slate-500">{title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => onCollapsedChange(true)} className="grid h-9 w-9 place-items-center rounded-xl border ft-border text-slate-600 transition hover:bg-slate-50" title="Contraer panel">
              <PanelRightClose className="h-5 w-5" />
            </button>
            {selected ? (
              <button type="button" onClick={onDelete} className="grid h-9 w-9 place-items-center rounded-xl border border-rose-200 text-rose-600 transition hover:bg-rose-50" title="Eliminar elemento">
                <Trash2 className="h-5 w-5" />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {!selected ? (
          <div className="px-3 py-3">
            <div className="rounded-[18px] border border-dashed ft-border bg-slate-50 px-3 py-3 text-sm font-medium text-slate-500">
              Selecciona un elemento para editar tamaño, posición, forma, texto, tablas, conectores y organización.
            </div>
          </div>
        ) : (
          <div className="space-y-0">
            <div className="border-b ft-border px-3 py-3">
              <div className="rounded-[16px] border ft-border bg-slate-50 px-3 py-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  {isConnector ? <GitBranch className="h-4 w-4 text-emerald-600" /> : table ? <Table2 className="h-4 w-4 text-violet-600" /> : media ? media.type === "image" ? <Image className="h-4 w-4 text-blue-600" /> : <FileText className="h-4 w-4 text-slate-600" /> : <LayoutTemplate className="h-4 w-4 text-violet-600" />}
                  <span className="capitalize">{selected.type}</span>
                </div>
                {table?.selectedRange ? (
                  <p className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
                    Selección activa: {table.selectedRange.type === "row" ? "fila" : table.selectedRange.type === "column" ? "columna" : "celda"}. Usa las bolitas de color para aplicar estilos.
                  </p>
                ) : null}
              </div>
            </div>

            {isConnector ? (
              <>
                <SectionCard icon={<GitBranch className="h-5 w-5" />} tone="emerald" title="Conector" sectionKey="connector" open={openSections.connector} onToggle={toggleSection}>
                  <div className="grid grid-cols-2 gap-2">
                    <MetricInput label="Inicio X" value={Math.round(connector!.from.x)} onChange={(value) => onPatch({ from: { ...connector!.from, x: value } } as Partial<ConnectorElement>)} accent="emerald" />
                    <MetricInput label="Inicio Y" value={Math.round(connector!.from.y)} onChange={(value) => onPatch({ from: { ...connector!.from, y: value } } as Partial<ConnectorElement>)} accent="blue" />
                    <MetricInput label="Final X" value={Math.round(connector!.to.x)} onChange={(value) => onPatch({ to: { ...connector!.to, x: value } } as Partial<ConnectorElement>)} accent="violet" />
                    <MetricInput label="Final Y" value={Math.round(connector!.to.y)} onChange={(value) => onPatch({ to: { ...connector!.to, y: value } } as Partial<ConnectorElement>)} accent="amber" />
                  </div>
                  <PanelField label="Etiqueta">
                    <input value={connector?.label ?? ""} onChange={(event) => onPatch({ label: event.target.value } as Partial<BoardElement>)} placeholder="Ej. Sí, No, Aprobado..." className="board-input ft-input w-full rounded-xl" />
                  </PanelField>
                  <PanelField label="Color de línea">
                    <Swatches colors={strokeSwatches} onSelect={(stroke) => onPatch(mergeStyle(selected, { stroke }))} />
                  </PanelField>
                  <div className="grid grid-cols-2 gap-2">
                    <PanelField label="Grosor">
                      <select value={connector?.style?.strokeWidth ?? 2} onChange={(event) => onPatch(mergeStyle(selected, { strokeWidth: Number(event.target.value) }))} className="board-input ft-input w-full rounded-xl">
                        <option value={1}>1 px</option><option value={2}>2 px</option><option value={3}>3 px</option><option value={4}>4 px</option>
                      </select>
                    </PanelField>
                    <PanelField label="Tipo">
                      <select value={connector?.style?.lineType ?? "straight"} onChange={(event) => onPatch(mergeStyle(selected, { lineType: event.target.value as BoardStyle["lineType"] }))} className="board-input ft-input w-full rounded-xl">
                        <option value="straight">Recta</option><option value="elbow">Codo</option><option value="curve">Curva</option>
                      </select>
                    </PanelField>
                  </div>
                  <ToggleRow label="Flecha final" checked={connector?.style?.arrowEnd !== false} onChange={(checked) => onPatch(mergeStyle(selected, { arrowEnd: checked }))} />
                </SectionCard>
              </>
            ) : (
              <>
                <SectionCard icon={<Ruler className="h-5 w-5" />} tone="emerald" title="Posición y tamaño" sectionKey="position" open={openSections.position} onToggle={toggleSection}>
                  <div className="grid grid-cols-2 gap-2">
                    <MetricInput label="X" value={Math.round(selected.x)} onChange={(value) => onPatch({ x: value } as Partial<BoardElement>)} accent="emerald" />
                    <MetricInput label="Y" value={Math.round(selected.y)} onChange={(value) => onPatch({ y: value } as Partial<BoardElement>)} accent="emerald" />
                    <MetricInput label="W" value={Math.round(selected.width)} onChange={(value) => onPatch({ width: Math.max(32, value) } as Partial<BoardElement>)} accent="blue" />
                    <MetricInput label="H" value={Math.round(selected.height)} onChange={(value) => onPatch({ height: Math.max(32, value) } as Partial<BoardElement>)} accent="violet" />
                  </div>
                </SectionCard>

                {shape ? (
                  <SectionCard icon={<LayoutTemplate className="h-5 w-5" />} tone="violet" title="Forma" sectionKey="appearance" open={openSections.appearance} onToggle={toggleSection}>
                    <PanelField label="Tipo de forma">
                      <select value={shape.shape} onChange={(event) => onPatch({ shape: event.target.value as ShapeElement["shape"] } as Partial<ShapeElement>)} className="board-input ft-input w-full rounded-xl">
                        {shapeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                      </select>
                    </PanelField>
                  </SectionCard>
                ) : null}

                {media ? (
                  <SectionCard icon={media.type === "image" ? <Image className="h-5 w-5" /> : <FileText className="h-5 w-5" />} tone="blue" title="Archivo" sectionKey="media" open={openSections.media} onToggle={toggleSection}>
                    <div className="rounded-[16px] border ft-border bg-white px-3 py-3">
                      <div className="flex items-start gap-2">
                        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600">
                          {media.type === "image" ? <Image className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-extrabold text-slate-800">{media.data.name}</p>
                          <p className="mt-1 text-xs font-semibold text-slate-500">{Math.max(1, Math.round(media.data.size / 1024))} KB · {media.data.mime}</p>
                        </div>
                      </div>
                      <a href={media.data.url} target="_blank" rel="noreferrer" className="ft-btn-secondary mt-4 flex h-10 w-full justify-center gap-2 text-xs">
                        <Download className="h-3.5 w-3.5" /> Abrir archivo
                      </a>
                    </div>
                  </SectionCard>
                ) : null}

                {table ? (
                  <>
                    <SectionCard icon={<Table2 className="h-5 w-5" />} tone="violet" title="Tabla visual" sectionKey="table" open={openSections.table} onToggle={toggleSection} action={table.hiddenRowIds?.length || table.hiddenColumnIds?.length ? <button type="button" onClick={() => { onShowHiddenTableRows(); onShowHiddenTableColumns(); }} className="grid h-8 w-8 place-items-center rounded-xl border ft-border bg-white text-blue-600 transition hover:bg-blue-50" title="Mostrar ocultos"><PanelRightOpen className="h-4 w-4" /></button> : undefined}>
                      <p className="text-[12px] font-semibold leading-5 text-slate-500">Edita celdas inline o define filas/columnas con valores exactos.</p>
                      <div className="mt-5 grid grid-cols-2 gap-2 rounded-[16px] border ft-border bg-white px-3 py-3">
                        <CompactStepper label="Filas" value={table.rows.length} min={1} onChange={onSetTableRowCount} accent="violet" />
                        <CompactStepper label="Columnas" value={table.columns.length} min={1} onChange={onSetTableColumnCount} accent="emerald" />
                      </div>
                      {(table.hiddenRowIds?.length || table.hiddenColumnIds?.length) ? (
                        <div className="mt-4 grid grid-cols-2 gap-2">
                          <button type="button" onClick={onShowHiddenTableRows} className="rounded-xl border ft-border bg-white px-3 py-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50">Mostrar filas ({table.hiddenRowIds?.length ?? 0})</button>
                          <button type="button" onClick={onShowHiddenTableColumns} className="rounded-xl border ft-border bg-white px-3 py-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50">Mostrar cols. ({table.hiddenColumnIds?.length ?? 0})</button>
                        </div>
                      ) : null}
                    </SectionCard>

                    <SectionCard icon={<AlignHorizontalJustifyCenter className="h-5 w-5" />} tone="amber" title="Columnas" sectionKey="columns" open={openSections.columns} onToggle={toggleSection}>
                      <div className="space-y-2">
                        {table.columns.map((column) => (
                          <div key={column.id} className="flex items-center gap-2 rounded-[14px] border ft-border bg-white px-3 py-2">
                            <GripVertical className="h-5 w-5 shrink-0 text-slate-400" />
                            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-600">
                              <Type className="h-5 w-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <input value={column.label} onChange={(event) => onRenameTableColumn(column.id, event.target.value)} className="w-full bg-transparent text-[13px] font-extrabold text-slate-800 outline-none" />
                              <p className="mt-0.5 text-[11px] font-semibold text-slate-500">Columna editable</p>
                            </div>
                            <button type="button" disabled={table.columns.length <= 1} onClick={() => onRemoveTableColumn(column.id)} className="grid h-8 w-8 place-items-center rounded-xl text-rose-500 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40" title="Eliminar columna">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </SectionCard>
                  </>
                ) : !media ? (
                  <SectionCard icon={<Palette className="h-5 w-5" />} tone="violet" title="Apariencia" sectionKey="appearance" open={openSections.appearance} onToggle={toggleSection}>
                    <PanelField label="Relleno">
                      <Swatches colors={fillSwatches} onSelect={(fill) => onPatch(mergeStyle(selected, { fill }))} />
                    </PanelField>
                    <PanelField label="Texto">
                      <div className="grid grid-cols-2 gap-2">
                        <select value={selected.style?.fontSize ?? 14} onChange={(event) => onPatch(mergeStyle(selected, { fontSize: Number(event.target.value) }))} className="board-input ft-input w-full rounded-xl">
                          <option value={12}>12 px</option><option value={14}>14 px</option><option value={16}>16 px</option><option value={18}>18 px</option><option value={22}>22 px</option>
                        </select>
                        <select value={selected.style?.textAlign ?? "center"} onChange={(event) => onPatch(mergeStyle(selected, { textAlign: event.target.value as BoardStyle["textAlign"] }))} className="board-input ft-input w-full rounded-xl">
                          <option value="left">Izquierda</option><option value="center">Centro</option><option value="right">Derecha</option>
                        </select>
                      </div>
                    </PanelField>
                  </SectionCard>
                ) : null}
              </>
            )}
          </div>
        )}
      </div>

      <div className="sticky bottom-0 mt-auto border-t ft-border bg-white/95 px-3 py-3 backdrop-blur">
        {selected ? (
          <div className="flex items-center justify-between gap-2 rounded-[16px] border ft-border bg-white px-3 py-3">
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-xl border ft-border text-slate-700">
                {selected.locked ? <Lock className="h-5 w-5" /> : <Unlock className="h-5 w-5" />}
              </div>
              <div>
                <p className="text-[15px] font-bold text-slate-900">Bloquear panel</p>
                <p className="text-sm font-medium text-slate-500">Evita mover o editar por accidente.</p>
              </div>
            </div>
            <ToggleSwitch checked={Boolean(selected.locked)} onChange={(checked) => onPatch({ locked: checked } as Partial<BoardElement>)} />
          </div>
        ) : (
          <div className="rounded-[16px] border ft-border bg-slate-50 px-3 py-3 text-sm font-medium text-slate-500">Selecciona un elemento para activar acciones rápidas.</div>
        )}
      </div>
    </aside>
  );
}

function CollapsedRailIcon({ icon, tone, label }: { icon: ReactNode; tone: "violet" | "blue" | "emerald" | "amber"; label: string }) {
  const toneClass = tone === "violet" ? "bg-violet-50 text-violet-600" : tone === "blue" ? "bg-blue-50 text-blue-600" : tone === "emerald" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600";
  return (
    <div className={`grid h-9 w-9 place-items-center rounded-xl ${toneClass}`} title={label}>
      {icon}
    </div>
  );
}

function SectionCard({ icon, tone, title, sectionKey, open, onToggle, children, action }: { icon: ReactNode; tone: "violet" | "blue" | "emerald" | "amber"; title: string; sectionKey: SectionKey; open: boolean; onToggle: (section: SectionKey) => void; children: ReactNode; action?: ReactNode }) {
  const toneClass = tone === "violet" ? "bg-violet-50 text-violet-600" : tone === "blue" ? "bg-blue-50 text-blue-600" : tone === "emerald" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600";
  return (
    <section className="border-b ft-border px-3 py-3 last:border-b-0">
      <div className="rounded-[18px] border ft-border bg-slate-50">
        <div className="flex items-center justify-between gap-2 px-3 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl ${toneClass}`}>{icon}</div>
            <h3 className="truncate text-[13px] font-black uppercase tracking-[0.18em] text-slate-800">{title}</h3>
          </div>
          <div className="flex items-center gap-2">
            {action}
            <button type="button" onClick={() => onToggle(sectionKey)} className="grid h-8 w-8 place-items-center rounded-xl border ft-border bg-white text-slate-500 transition hover:bg-slate-50" title={open ? "Contraer sección" : "Expandir sección"}>
              {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>
        {open ? <div className="border-t ft-border px-3 py-3">{children}</div> : null}
      </div>
    </section>
  );
}

function PanelField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">{label}</label>
      {children}
    </div>
  );
}

function Swatches({ colors, onSelect }: { colors: string[]; onSelect: (color: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {colors.map((color) => (
        <button key={color} type="button" onClick={() => onSelect(color)} className="h-9 w-9 rounded-full border ft-border transition hover:shadow-sm" style={{ backgroundColor: color }} />
      ))}
    </div>
  );
}

function MetricInput({ label, value, onChange, accent }: { label: string; value: number; onChange: (value: number) => void; accent: "emerald" | "blue" | "violet" | "amber" }) {
  const accentClass = accent === "emerald" ? "text-emerald-500" : accent === "blue" ? "text-blue-500" : accent === "violet" ? "text-violet-500" : "text-amber-500";
  return (
    <div className="board-inspector-metric">
      <label>{label}</label>
      <div className="board-inspector-metric-control">
        <ArrowDownUp className={`h-3.5 w-3.5 ${accentClass}`} />
        <input
          type="number"
          value={value}
          onChange={(event) => onChange(numberPatch(event.target.value, value))}
          className="board-inspector-metric-input"
        />
        <span>px</span>
      </div>
    </div>
  );
}

function CompactStepper({ label, value, min, onChange, accent }: { label: string; value: number; min: number; onChange: (value: number) => void; accent: "violet" | "emerald" }) {
  const iconClass = accent === "violet" ? "text-violet-500" : "text-emerald-500";
  const ringClass = accent === "violet" ? "focus-within:border-violet-200 focus-within:ring-violet-500/10" : "focus-within:border-emerald-200 focus-within:ring-emerald-500/10";

  return (
    <div className="min-w-0">
      <label className="mb-2 flex items-center gap-1.5 text-[12px] font-extrabold text-slate-500">
        <ArrowDownUp className={`h-3.5 w-3.5 ${iconClass}`} />
        {label}
      </label>
      <div className={`grid grid-cols-[34px_minmax(42px,1fr)_34px] items-center gap-1 rounded-[14px] border ft-border bg-white p-1.5 transition focus-within:ring-4 ${ringClass}`}>
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} className="grid h-8 w-8 place-items-center rounded-[11px] border ft-border bg-slate-50 text-slate-600 transition hover:bg-slate-100" aria-label={`Restar ${label}`}>
          <Minus className="h-3.5 w-3.5" />
        </button>
        <input
          type="number"
          min={min}
          value={value}
          onChange={(event) => onChange(Math.max(min, numberPatch(event.target.value, value)))}
          className="h-8 min-w-0 bg-transparent px-1 text-center text-[14px] font-black text-slate-900 outline-none"
          aria-label={label}
        />
        <button type="button" onClick={() => onChange(value + 1)} className="grid h-8 w-8 place-items-center rounded-[11px] border ft-border bg-slate-50 text-slate-600 transition hover:bg-slate-100" aria-label={`Sumar ${label}`}>
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className={`relative h-10 w-[68px] rounded-full transition ${checked ? "bg-emerald-500" : "bg-slate-200"}`} aria-pressed={checked}>
      <span className={`absolute top-1 h-8 w-8 rounded-full bg-white shadow transition ${checked ? "left-[32px]" : "left-1"}`} />
    </button>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <div className="flex items-center justify-between rounded-[14px] border ft-border bg-white px-3 py-3">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <ToggleSwitch checked={checked} onChange={onChange} />
    </div>
  );
}
