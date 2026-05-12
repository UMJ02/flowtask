import type { BoardTableSelection, TableElement } from "@/lib/boards/board-types";

export function cellKey(rowId: string, columnId: string) {
  return `${rowId}:${columnId}`;
}

export function isRowHidden(table: TableElement, rowId: string) {
  return (table.hiddenRowIds ?? []).includes(rowId);
}

export function isColumnHidden(table: TableElement, columnId: string) {
  return (table.hiddenColumnIds ?? []).includes(columnId);
}

export function visibleRows(table: TableElement) {
  const hidden = new Set(table.hiddenRowIds ?? []);
  return table.rows.filter((row) => !hidden.has(row.id));
}

export function visibleColumns(table: TableElement) {
  const hidden = new Set(table.hiddenColumnIds ?? []);
  return table.columns.filter((column) => !hidden.has(column.id));
}

export function nextAutofillValue(previous: string, beforePrevious?: string) {
  const trimmed = previous.trim();
  if (!trimmed) return "";

  const prevNumber = Number(trimmed);
  const beforeNumber = Number(beforePrevious?.trim() ?? "");
  if (Number.isFinite(prevNumber)) {
    const step = Number.isFinite(beforeNumber) ? prevNumber - beforeNumber : 1;
    return String(prevNumber + (step || 1));
  }

  const numericSuffix = trimmed.match(/^(.*?)(\d+)$/);
  if (numericSuffix) {
    const [, prefix, number] = numericSuffix;
    return `${prefix}${String(Number(number) + 1).padStart(number.length, "0")}`;
  }

  const asDate = Date.parse(trimmed);
  if (Number.isFinite(asDate)) {
    const date = new Date(asDate);
    date.setDate(date.getDate() + 1);
    return date.toLocaleDateString("es-CR");
  }

  return previous;
}

function getCellNumber(table: TableElement, reference: string) {
  const match = reference.trim().match(/^([A-Z]+)(\d+)$/i);
  if (!match) return 0;
  const [, letters, rowText] = match;
  const columnIndex = letters.toUpperCase().split("").reduce((acc, char) => acc * 26 + char.charCodeAt(0) - 64, 0) - 1;
  const rowIndex = Number(rowText) - 1;
  const column = table.columns[columnIndex];
  const row = table.rows[rowIndex];
  const value = column && row ? Number(String(row.cells[column.id] ?? "").replace(",", ".")) : 0;
  return Number.isFinite(value) ? value : 0;
}

function rangeValues(table: TableElement, range: string) {
  const [start, end] = range.split(":");
  const a = start?.match(/^([A-Z]+)(\d+)$/i);
  const b = end?.match(/^([A-Z]+)(\d+)$/i);
  if (!a || !b) return [];
  const colA = a[1].toUpperCase().split("").reduce((acc, char) => acc * 26 + char.charCodeAt(0) - 64, 0) - 1;
  const colB = b[1].toUpperCase().split("").reduce((acc, char) => acc * 26 + char.charCodeAt(0) - 64, 0) - 1;
  const rowA = Number(a[2]) - 1;
  const rowB = Number(b[2]) - 1;
  const values: number[] = [];
  for (let r = Math.min(rowA, rowB); r <= Math.max(rowA, rowB); r += 1) {
    for (let c = Math.min(colA, colB); c <= Math.max(colA, colB); c += 1) {
      const row = table.rows[r];
      const column = table.columns[c];
      const value = row && column ? Number(String(row.cells[column.id] ?? "").replace(",", ".")) : 0;
      if (Number.isFinite(value)) values.push(value);
    }
  }
  return values;
}

export function evaluateTableFormula(table: TableElement, rawFormula: string) {
  const formula = rawFormula.trim();
  if (!formula.startsWith("=")) return rawFormula;

  const expression = formula.slice(1).trim();
  const aggregate = expression.match(/^(SUM|AVG|MIN|MAX)\(([^)]+)\)$/i);
  if (aggregate) {
    const [, fn, range] = aggregate;
    const values = rangeValues(table, range);
    if (!values.length) return "0";
    if (fn.toUpperCase() === "SUM") return String(values.reduce((a, b) => a + b, 0));
    if (fn.toUpperCase() === "AVG") return String(values.reduce((a, b) => a + b, 0) / values.length);
    if (fn.toUpperCase() === "MIN") return String(Math.min(...values));
    if (fn.toUpperCase() === "MAX") return String(Math.max(...values));
  }

  const binary = expression.match(/^([A-Z]+\d+|\d+(?:[.,]\d+)?)\s*([+\-*/])\s*([A-Z]+\d+|\d+(?:[.,]\d+)?)$/i);
  if (!binary) return "Error";
  const [, left, op, right] = binary;
  const leftValue = /^[A-Z]+\d+$/i.test(left) ? getCellNumber(table, left) : Number(left.replace(",", "."));
  const rightValue = /^[A-Z]+\d+$/i.test(right) ? getCellNumber(table, right) : Number(right.replace(",", "."));
  if (!Number.isFinite(leftValue) || !Number.isFinite(rightValue)) return "Error";
  if (op === "+") return String(leftValue + rightValue);
  if (op === "-") return String(leftValue - rightValue);
  if (op === "*") return String(leftValue * rightValue);
  if (op === "/") return rightValue === 0 ? "Error" : String(leftValue / rightValue);
  return "Error";
}

export function selectionStyleForCell(table: TableElement, rowId: string, columnId: string) {
  const selection = table.selectedRange;
  if (!selection) return "";
  if (selection.type === "row" && selection.rowId === rowId) return "board-table-cell-selected";
  if (selection.type === "column" && selection.columnId === columnId) return "board-table-cell-selected";
  if (selection.type === "cell" && selection.rowId === rowId && selection.columnId === columnId) return "board-table-cell-selected";
  return "";
}

export function selectionMatches(selection: BoardTableSelection | undefined, type: BoardTableSelection["type"], id: string) {
  if (!selection || selection.type !== type) return false;
  if (selection.type === "row") return selection.rowId === id;
  if (selection.type === "column") return selection.columnId === id;
  return selection.rowId === id || selection.columnId === id;
}
