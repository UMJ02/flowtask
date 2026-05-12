"use client";

import { useState, type CSSProperties, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent } from "react";
import { Download, FileText, Plus, Trash2 } from "lucide-react";
import type { BoardElement, BoardTableSelection, BoardTool } from "@/lib/boards/board-types";
import { cellKey, selectionMatches, selectionStyleForCell, visibleColumns, visibleRows } from "@/lib/boards/table-tools";

export type ResizeHandle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

type BoardElementViewProps = {
  element: BoardElement;
  selected: boolean;
  activeTool: BoardTool;
  onSelect: (id: string) => void;
  onDragStart: (id: string, event: ReactPointerEvent<HTMLDivElement>) => void;
  onResizeStart: (id: string, handle: ResizeHandle, event: ReactPointerEvent<HTMLButtonElement>) => void;
  onUpdateContent: (id: string, content: string) => void;
  onConnectorTarget: (id: string) => void;
  onCommentTarget?: (id: string) => void;
  onUpdateTableCell: (elementId: string, rowId: string, columnId: string, value: string) => void;
  onResolveTableFormula: (elementId: string, rowId: string, columnId: string, formula: string) => void;
  onSelectTableRange: (elementId: string, selection: BoardTableSelection) => void;
  onAddTableRow: (elementId: string) => void;
  onAddTableColumn: (elementId: string) => void;
  onRemoveTableRow: (elementId: string, rowId: string) => void;
  onRemoveTableColumn: (elementId: string, columnId: string) => void;
  onHideTableRow: (elementId: string, rowId: string) => void;
  onHideTableColumn: (elementId: string, columnId: string) => void;
  onShowHiddenTableRows: (elementId: string) => void;
  onShowHiddenTableColumns: (elementId: string) => void;
  onAutofillTableFromCell: (elementId: string, rowId: string, columnId: string) => void;
};

const handleClasses: Record<ResizeHandle, string> = {
  nw: "-left-1.5 -top-1.5 cursor-nwse-resize",
  n: "left-1/2 -top-1.5 -translate-x-1/2 cursor-ns-resize",
  ne: "-right-1.5 -top-1.5 cursor-nesw-resize",
  e: "-right-1.5 top-1/2 -translate-y-1/2 cursor-ew-resize",
  se: "-bottom-1.5 -right-1.5 cursor-nwse-resize",
  s: "bottom-[-6px] left-1/2 -translate-x-1/2 cursor-ns-resize",
  sw: "-bottom-1.5 -left-1.5 cursor-nesw-resize",
  w: "-left-1.5 top-1/2 -translate-y-1/2 cursor-ew-resize",
};

function getStyle(element: BoardElement): CSSProperties {
  return {
    position: "absolute",
    left: element.x,
    top: element.y,
    width: element.width,
    height: element.height,
    transform: `rotate(${element.rotation ?? 0}deg)`,
    zIndex: element.zIndex,
    opacity: element.style?.opacity ?? 1,
  };
}

function ResizeHandles({ elementId, onResizeStart }: { elementId: string; onResizeStart: BoardElementViewProps["onResizeStart"] }) {
  const handles: ResizeHandle[] = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];
  return (
    <>
      {handles.map((handle) => (
        <button
          key={handle}
          type="button"
          aria-label={`Redimensionar ${handle}`}
          onPointerDown={(event) => onResizeStart(elementId, handle, event)}
          className={`absolute z-20 h-3 w-3 rounded-full border border-emerald-500 bg-white shadow-sm ${handleClasses[handle]}`}
        />
      ))}
    </>
  );
}

function shapeClip(element: BoardElement) {
  if (element.type !== "shape") return undefined;
  if (element.shape === "diamond") return "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)";
  return undefined;
}

export function BoardElementView({
  element,
  selected,
  activeTool,
  onSelect,
  onDragStart,
  onResizeStart,
  onUpdateContent,
  onConnectorTarget,
  onCommentTarget,
  onUpdateTableCell,
  onResolveTableFormula,
  onSelectTableRange,
  onAddTableRow,
  onAddTableColumn,
  onRemoveTableRow,
  onRemoveTableColumn,
  onHideTableRow,
  onHideTableColumn,
  onShowHiddenTableRows,
  onShowHiddenTableColumns,
  onAutofillTableFromCell,
}: BoardElementViewProps) {
  const [tableContextMenu, setTableContextMenu] = useState<null | { x: number; y: number; selection: BoardTableSelection }>(null);
  if (element.type === "connector") return null;

  const common = "group absolute touch-none select-none transition duration-150";
  const selection = selected ? "board-selection-ring" : "hover:ring-1 hover:ring-slate-300";
  const connectorMode = activeTool === "connector";
  const commentMode = activeTool === "comment";
  const canResize = selected && activeTool === "select" && !element.locked;

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (connectorMode || commentMode || activeTool === "hand") return;
    onDragStart(element.id, event);
  }

  function handleClick() {
    if (connectorMode) {
      onConnectorTarget(element.id);
      return;
    }
    if (commentMode) {
      onCommentTarget?.(element.id);
      return;
    }
    onSelect(element.id);
  }

  if (element.type === "image") {
    return (
      <div
        style={getStyle(element)}
        className={`${common} overflow-visible rounded-[18px] border border-slate-200 bg-white ${selection} ${connectorMode || commentMode ? "cursor-crosshair hover:border-emerald-300" : ""}`}
        onPointerDown={handlePointerDown}
        onClick={handleClick}
      >
        <div className="h-full overflow-hidden rounded-[18px]">
          <img src={element.data.url} alt={element.data.name} className="h-[calc(100%-44px)] w-full object-cover" draggable={false} />
          <div className="flex h-11 items-center justify-between gap-2 border-t border-slate-100 bg-white px-3">
            <p className="min-w-0 truncate text-xs font-bold text-slate-700">{element.data.name}</p>
            <a href={element.data.url} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()} className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" title="Abrir imagen">
              <Download className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
        {canResize ? <ResizeHandles elementId={element.id} onResizeStart={onResizeStart} /> : null}
      </div>
    );
  }

  if (element.type === "file") {
    return (
      <div
        style={getStyle(element)}
        className={`${common} overflow-visible rounded-[18px] border border-slate-200 bg-white ${selection} ${connectorMode || commentMode ? "cursor-crosshair hover:border-emerald-300" : ""}`}
        onPointerDown={handlePointerDown}
        onClick={handleClick}
      >
        <div className="flex h-full items-center gap-3 overflow-hidden rounded-[18px] p-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-slate-100 text-slate-600">
            <FileText className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-slate-800">{element.data.name}</p>
            <p className="mt-0.5 text-xs font-semibold text-slate-400">{Math.max(1, Math.round(element.data.size / 1024))} KB · {element.data.mime}</p>
          </div>
          <a href={element.data.url} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()} className="ft-btn-secondary h-8 px-3 text-xs">Abrir</a>
        </div>
        {canResize ? <ResizeHandles elementId={element.id} onResizeStart={onResizeStart} /> : null}
      </div>
    );
  }

  if (element.type === "table") {
    const table = element;
    const tableColumns = visibleColumns(table);
    const tableRows = visibleRows(table);
    const hiddenRowsCount = table.hiddenRowIds?.length ?? 0;
    const hiddenColumnsCount = table.hiddenColumnIds?.length ?? 0;

    function openTableContextMenu(event: ReactMouseEvent, selection: BoardTableSelection) {
      event.preventDefault();
      event.stopPropagation();
      onSelect(element.id);
      onSelectTableRange(element.id, selection);
      setTableContextMenu({ x: event.clientX - element.x, y: event.clientY - element.y, selection });
    }

    function rowBackground(rowId: string) {
      return table.rowStyles?.[rowId]?.backgroundColor;
    }

    function columnBackground(columnId: string) {
      return table.columnStyles?.[columnId]?.backgroundColor;
    }

    function cellBackground(rowId: string, columnId: string) {
      return table.cellStyles?.[cellKey(rowId, columnId)]?.backgroundColor ?? rowBackground(rowId) ?? columnBackground(columnId);
    }

    return (
      <div
        style={getStyle(element)}
        className={`${common} overflow-visible rounded-[16px] border border-violet-200 bg-white ${selection} ${connectorMode || commentMode ? "cursor-crosshair hover:border-emerald-300" : ""}`}
        onPointerDown={handlePointerDown}
        onClick={() => { setTableContextMenu(null); handleClick(); }}
      >
        <div className="flex h-full flex-col overflow-hidden rounded-[16px]">
          <div className="flex items-center justify-between border-b border-violet-100 bg-violet-50/90 px-2 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-violet-700">
            <span>Tabla editable</span>
            {selected && !connectorMode ? (
              <div className="flex items-center gap-1 normal-case tracking-normal">
                {hiddenRowsCount ? <button type="button" onPointerDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); onShowHiddenTableRows(element.id); }} className="board-table-mini-action">Mostrar filas</button> : null}
                {hiddenColumnsCount ? <button type="button" onPointerDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); onShowHiddenTableColumns(element.id); }} className="board-table-mini-action">Mostrar cols.</button> : null}
                <button type="button" onPointerDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); onAddTableRow(element.id); }} className="board-table-mini-action"><Plus className="h-3 w-3" /> Fila</button>
                <button type="button" onPointerDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); onAddTableColumn(element.id); }} className="board-table-mini-action"><Plus className="h-3 w-3" /> Col.</button>
              </div>
            ) : null}
          </div>
          <div className="min-h-0 flex-1 overflow-auto">
            <table className="h-full min-w-full border-collapse text-[12px]">
              <thead className="bg-violet-50 text-slate-700">
                <tr>
                  <th className="w-9 border border-violet-100 px-1 py-2 text-center font-bold text-slate-400">#</th>
                  {tableColumns.map((column) => (
                    <th
                      key={column.id}
                      style={{ width: column.width, backgroundColor: columnBackground(column.id) }}
                      className={`board-table-header-cell ${selectionMatches(element.selectedRange, "column", column.id) ? "board-table-column-selected" : ""}`}
                      onPointerDown={(event) => event.stopPropagation()}
                      onClick={(event) => { event.stopPropagation(); onSelect(element.id); onSelectTableRange(element.id, { type: "column", columnId: column.id }); }}
                      onContextMenu={(event) => openTableContextMenu(event, { type: "column", columnId: column.id })}
                      title="Click para seleccionar columna. Click derecho para acciones."
                    >
                      {column.label}
                    </th>
                  ))}
                  {selected && !connectorMode ? <th className="w-8 border border-violet-100 px-1 py-2" aria-label="Acciones" /> : null}
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row, rowIndex) => (
                  <tr key={row.id} className={selectionMatches(element.selectedRange, "row", row.id) ? "board-table-row-selected" : ""}>
                    <th
                      className="board-table-row-handle"
                      style={{ backgroundColor: rowBackground(row.id) }}
                      onPointerDown={(event) => event.stopPropagation()}
                      onClick={(event) => { event.stopPropagation(); onSelect(element.id); onSelectTableRange(element.id, { type: "row", rowId: row.id }); }}
                      onContextMenu={(event) => openTableContextMenu(event, { type: "row", rowId: row.id })}
                      title="Click para seleccionar fila. Click derecho para acciones."
                    >
                      {rowIndex + 1}
                    </th>
                    {tableColumns.map((column) => {
                      const formula = element.formulas?.[cellKey(row.id, column.id)];
                      return (
                        <td
                          key={column.id}
                          className={`board-table-cell ${selectionStyleForCell(element, row.id, column.id)}`}
                          style={{ backgroundColor: cellBackground(row.id, column.id) }}
                          onContextMenu={(event) => openTableContextMenu(event, { type: "cell", rowId: row.id, columnId: column.id })}
                        >
                          <div className="relative">
                            <textarea
                              value={row.cells[column.id] ?? ""}
                              readOnly={connectorMode || commentMode || element.locked}
                              onPointerDown={(event) => event.stopPropagation()}
                              onClick={(event) => { event.stopPropagation(); onSelect(element.id); onSelectTableRange(element.id, { type: "cell", rowId: row.id, columnId: column.id }); }}
                              onChange={(event) => onUpdateTableCell(element.id, row.id, column.id, event.target.value)}
                              onBlur={(event) => {
                                const value = event.target.value.trim();
                                if (value.startsWith("=")) onResolveTableFormula(element.id, row.id, column.id, value);
                              }}
                              className="block min-h-[34px] w-full resize-none border-none bg-transparent px-2 py-2 pr-5 text-[12px] leading-4 outline-none focus:bg-emerald-50/50"
                              placeholder="Escribe..."
                              title={formula ? `Fórmula: ${formula}` : "Tip: usa =A1+B1 o =SUM(A1:A5)"}
                            />
                            {selected && !connectorMode && !commentMode ? (
                              <button
                                type="button"
                                className="board-table-fill-handle"
                                title="Autorrellenar hacia abajo"
                                onPointerDown={(event) => {
                                  event.preventDefault();
                                  event.stopPropagation();
                                  onAutofillTableFromCell(element.id, row.id, column.id);
                                }}
                              />
                            ) : null}
                          </div>
                        </td>
                      );
                    })}
                    {selected && !connectorMode ? (
                      <td className="border border-slate-100 p-1 text-center">
                        <button type="button" onPointerDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); onRemoveTableRow(element.id, row.id); }} className="grid h-7 w-7 place-items-center rounded-lg text-rose-500 hover:bg-rose-50" title="Eliminar fila"><Trash2 className="h-3.5 w-3.5" /></button>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {tableContextMenu && selected && !connectorMode ? (
          <div
            className="board-table-context-menu"
            style={{ left: tableContextMenu.x, top: tableContextMenu.y }}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => event.stopPropagation()}
          >
            {tableContextMenu.selection.type === "row" ? (
              <>
                <button type="button" onClick={() => { onRemoveTableRow(element.id, (tableContextMenu.selection as Extract<BoardTableSelection, { type: "row" }>).rowId); setTableContextMenu(null); }}>Eliminar fila</button>
                <button type="button" onClick={() => { onHideTableRow(element.id, (tableContextMenu.selection as Extract<BoardTableSelection, { type: "row" }>).rowId); setTableContextMenu(null); }}>Ocultar fila</button>
              </>
            ) : null}
            {tableContextMenu.selection.type === "column" ? (
              <>
                <button type="button" onClick={() => { onRemoveTableColumn(element.id, (tableContextMenu.selection as Extract<BoardTableSelection, { type: "column" }>).columnId); setTableContextMenu(null); }}>Eliminar columna</button>
                <button type="button" onClick={() => { onHideTableColumn(element.id, (tableContextMenu.selection as Extract<BoardTableSelection, { type: "column" }>).columnId); setTableContextMenu(null); }}>Ocultar columna</button>
              </>
            ) : null}
            {tableContextMenu.selection.type === "cell" ? (
              <>
                <button type="button" onClick={() => { onSelectTableRange(element.id, { type: "row", rowId: (tableContextMenu.selection as Extract<BoardTableSelection, { type: "cell" }>).rowId }); setTableContextMenu(null); }}>Seleccionar fila</button>
                <button type="button" onClick={() => { onSelectTableRange(element.id, { type: "column", columnId: (tableContextMenu.selection as Extract<BoardTableSelection, { type: "cell" }>).columnId }); setTableContextMenu(null); }}>Seleccionar columna</button>
              </>
            ) : null}
            {hiddenRowsCount ? <button type="button" onClick={() => { onShowHiddenTableRows(element.id); setTableContextMenu(null); }}>Mostrar filas ocultas</button> : null}
            {hiddenColumnsCount ? <button type="button" onClick={() => { onShowHiddenTableColumns(element.id); setTableContextMenu(null); }}>Mostrar columnas ocultas</button> : null}
          </div>
        ) : null}

        {canResize ? <ResizeHandles elementId={element.id} onResizeStart={onResizeStart} /> : null}
      </div>
    );
  }

  const fill = element.style?.fill ?? "#FFFFFF";
  const stroke = element.style?.stroke ?? "#E5EAF1";
  const radius = element.type === "shape" && element.shape === "circle" ? "999px" : element.type === "shape" && element.shape === "pill" ? "999px" : `${element.style?.radius ?? 16}px`;
  const textColor = element.style?.textColor ?? "#0F172A";
  const content = "content" in element ? element.content : "";
  const clipPath = shapeClip(element);

  return (
    <div
      style={{ ...getStyle(element), background: fill === "transparent" ? "transparent" : fill, borderColor: stroke, borderRadius: radius, color: textColor, clipPath }}
      className={`${common} ${selection} ${connectorMode || commentMode ? "cursor-crosshair hover:border-emerald-300 hover:bg-emerald-50/50" : ""} flex items-center justify-center overflow-visible border p-3`}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
    >
      <textarea value={content} readOnly={connectorMode || commentMode || element.locked} onPointerDown={(event) => event.stopPropagation()} onChange={(event) => onUpdateContent(element.id, event.target.value)} className="h-full w-full resize-none border-none bg-transparent text-center text-[14px] font-semibold leading-5 outline-none placeholder:text-slate-400" style={{ color: textColor, fontSize: element.style?.fontSize ?? 14, fontWeight: element.style?.fontWeight ?? 650, textAlign: element.style?.textAlign ?? "center" }} />
      {canResize ? <ResizeHandles elementId={element.id} onResizeStart={onResizeStart} /> : null}
    </div>
  );
}
