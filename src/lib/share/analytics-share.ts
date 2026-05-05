import type { SharedReportTaskItem, WorkspaceAnalyticsSummary } from '@/lib/queries/analytics';

export type SharedAnalyticsPayload = {
  workspaceName: string;
  generatedAtLabel: string;
  shareDigest: WorkspaceAnalyticsSummary['shareDigest'];
  reportModules: WorkspaceAnalyticsSummary['reportModules'];
  recommendations: string[];
};

type XlsxCell = string | number | { value: string | number; style?: number };
type XlsxRow = XlsxCell[];
type SheetConfig = { name: string; rows: XlsxRow[]; widths?: number[]; freezeHeader?: boolean; autoFilter?: string; merges?: string[] };

export function buildSharedAnalyticsPayload(summary: WorkspaceAnalyticsSummary): SharedAnalyticsPayload {
  return {
    workspaceName: summary.organizationName,
    generatedAtLabel: summary.generatedAtLabel,
    shareDigest: summary.shareDigest,
    reportModules: summary.reportModules,
    recommendations: summary.recommendations,
  };
}

function bytesToBase64(bytes: Uint8Array) {
  if (typeof window === 'undefined') return Buffer.from(bytes).toString('base64');
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return window.btoa(binary);
}

function base64ToBytes(base64: string) {
  if (typeof window === 'undefined') return new Uint8Array(Buffer.from(base64, 'base64'));
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

export function encodeAnalyticsShareToken(payload: SharedAnalyticsPayload) {
  const json = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(json);
  return bytesToBase64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export function decodeAnalyticsShareToken(token: string): SharedAnalyticsPayload | null {
  try {
    const normalized = token.replace(/-/g, '+').replace(/_/g, '/');
    const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
    const bytes = base64ToBytes(`${normalized}${padding}`);
    const parsed = JSON.parse(new TextDecoder().decode(bytes)) as Partial<SharedAnalyticsPayload>;
    return parsed?.workspaceName
      ? {
          workspaceName: parsed.workspaceName,
          generatedAtLabel: parsed.generatedAtLabel ?? 'Sin fecha',
          shareDigest: parsed.shareDigest as SharedAnalyticsPayload['shareDigest'],
          reportModules: parsed.reportModules as SharedAnalyticsPayload['reportModules'],
          recommendations: parsed.recommendations ?? [],
        }
      : null;
  } catch {
    return null;
  }
}

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 600);
}

function normalizeFilename(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'workspace';
}

export function getSharedReportTasks(payload: SharedAnalyticsPayload) {
  const allItems = [...payload.reportModules.dayTasks, ...payload.reportModules.weeklyInProgress, ...payload.reportModules.waitingTasks];
  const seen = new Set<string>();
  return allItems.filter((item) => {
    const key = item.id || `${item.title}-${item.deadlineLabel}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function statusStyle(status: string) {
  if (status === 'En espera') return 7;
  if (status === 'Concluido') return 8;
  return 6;
}

function priorityStyle(priority: string) {
  if (priority === 'Alta') return 9;
  if (priority === 'Baja') return 11;
  return 10;
}

function reportRows(section: string, items: SharedReportTaskItem[]): XlsxRow[] {
  return items.map((item) => [section, item.title, item.createdAtLabel, item.deadlineLabel, { value: item.statusLabel, style: statusStyle(item.statusLabel) }, item.clientLabel, { value: item.priorityLabel, style: priorityStyle(item.priorityLabel) }, item.lastComment ?? 'Sin comentario registrado']);
}

function safeText(value: unknown) {
  return String(value ?? '').replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char] ?? char));
}

function columnName(index: number) {
  let current = index + 1;
  let label = '';
  while (current > 0) {
    const remainder = (current - 1) % 26;
    label = String.fromCharCode(65 + remainder) + label;
    current = Math.floor((current - 1) / 26);
  }
  return label;
}

function normalizeCell(cell: XlsxCell): { value: string | number; style: number } {
  if (typeof cell === 'object' && cell !== null && 'value' in cell) return { value: cell.value, style: cell.style ?? 0 };
  return { value: cell, style: 0 };
}

function buildWorksheetXml(sheet: SheetConfig) {
  const cols = sheet.widths?.length ? `<cols>${sheet.widths.map((width, index) => `<col min="${index + 1}" max="${index + 1}" width="${width}" customWidth="1"/>`).join('')}</cols>` : '';
  const sheetViews = sheet.freezeHeader ? '<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>' : '<sheetViews><sheetView workbookViewId="0"/></sheetViews>';
  const rows = sheet.rows.map((row, rowIndex) => {
    const rowNumber = rowIndex + 1;
    const cells = row.map((cell, cellIndex) => {
      const normalized = normalizeCell(cell);
      const ref = `${columnName(cellIndex)}${rowNumber}`;
      const style = normalized.style ? ` s="${normalized.style}"` : '';
      if (typeof normalized.value === 'number' && Number.isFinite(normalized.value)) return `<c r="${ref}"${style}><v>${normalized.value}</v></c>`;
      return `<c r="${ref}" t="inlineStr"${style}><is><t>${safeText(normalized.value)}</t></is></c>`;
    }).join('');
    return `<row r="${rowNumber}">${cells}</row>`;
  }).join('');
  const autoFilter = sheet.autoFilter ? `<autoFilter ref="${sheet.autoFilter}"/>` : '';
  const merges = sheet.merges?.length ? `<mergeCells count="${sheet.merges.length}">${sheet.merges.map((ref) => `<mergeCell ref="${ref}"/>`).join('')}</mergeCells>` : '';
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">${sheetViews}${cols}<sheetData>${rows}</sheetData>${autoFilter}${merges}<pageMargins left="0.7" right="0.7" top="0.75" bottom="0.75" header="0.3" footer="0.3"/></worksheet>`;
}

function buildStylesXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="5"><font><sz val="11"/><color rgb="FF071333"/><name val="Aptos"/></font><font><b/><sz val="18"/><color rgb="FF071333"/><name val="Aptos Display"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Aptos"/></font><font><b/><sz val="12"/><color rgb="FF071333"/><name val="Aptos"/></font><font><b/><sz val="11"/><color rgb="FF071333"/><name val="Aptos"/></font></fonts><fills count="10"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF16A878"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFF7F9FC"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFE6F8F1"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFEFF6FF"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFFFF7E6"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFE8FFF3"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFFFEDED"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFEAF2FF"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border><border><left style="thin"><color rgb="FFE5EAF1"/></left><right style="thin"><color rgb="FFE5EAF1"/></right><top style="thin"><color rgb="FFE5EAF1"/></top><bottom style="thin"><color rgb="FFE5EAF1"/></bottom><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="12"><xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1"/><xf numFmtId="0" fontId="1" fillId="4" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf><xf numFmtId="0" fontId="3" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf><xf numFmtId="0" fontId="2" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf><xf numFmtId="0" fontId="4" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="1" fillId="7" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf><xf numFmtId="0" fontId="4" fillId="5" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center"/></xf><xf numFmtId="0" fontId="4" fillId="6" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center"/></xf><xf numFmtId="0" fontId="4" fillId="7" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center"/></xf><xf numFmtId="0" fontId="4" fillId="8" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center"/></xf><xf numFmtId="0" fontId="4" fillId="6" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center"/></xf><xf numFmtId="0" fontId="4" fillId="9" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center"/></xf></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`;
}

function buildSheets(payload: SharedAnalyticsPayload): SheetConfig[] {
  const tasks = getSharedReportTasks(payload);
  const reportRowsData: XlsxRow[] = [[{ value: 'FlowTask · Reporte inteligente', style: 1 }, '', '', '', '', '', '', ''], [{ value: 'Workspace', style: 4 }, payload.workspaceName, { value: 'Generado', style: 4 }, payload.generatedAtLabel, '', '', '', ''], [], [{ value: 'Métricas principales', style: 2 }, '', '', '', '', '', '', ''], [{ value: 'Indicador', style: 3 }, { value: 'Valor', style: 3 }, { value: 'Lectura', style: 3 }, '', { value: 'Indicador', style: 3 }, { value: 'Valor', style: 3 }, { value: 'Lectura', style: 3 }], ['Total de tareas', { value: tasks.length, style: 5 }, 'Incluidas en el reporte', '', 'Prioridad alta', { value: payload.shareDigest.priorityCount, style: 5 }, 'Requieren seguimiento'], ['En proceso', { value: payload.shareDigest.inProgressCount, style: 5 }, 'Operación activa', '', 'En espera', { value: payload.shareDigest.waitingCount, style: 5 }, 'Bloqueos actuales'], ['Concluidos', { value: payload.shareDigest.completedCount, style: 5 }, 'Histórico cerrado', '', 'Última actualización', payload.generatedAtLabel, 'Reporte compartible'], [], [{ value: 'Lectura inteligente', style: 2 }, '', '', '', '', '', '', ''], ...(payload.shareDigest.shareSummary.length ? payload.shareDigest.shareSummary.map((item, index) => [{ value: index + 1, style: 5 }, item]) : [[{ value: 1, style: 5 }, 'Sin resumen disponible']]), [], [{ value: 'Recomendaciones', style: 2 }, '', '', '', '', '', '', ''], ...(payload.recommendations.length ? payload.recommendations.map((item, index) => [{ value: index + 1, style: 5 }, item]) : [[{ value: 1, style: 5 }, 'Mantén el seguimiento semanal y actualiza comentarios en tareas bloqueadas.']])];
  const tasksRows: XlsxRow[] = [[{ value: 'Módulo', style: 3 }, { value: 'Tarea', style: 3 }, { value: 'Fecha ingreso', style: 3 }, { value: 'Deadline', style: 3 }, { value: 'Estado', style: 3 }, { value: 'Cliente', style: 3 }, { value: 'Prioridad', style: 3 }, { value: 'Último comentario', style: 3 }], ...reportRows('Tareas del día', payload.reportModules.dayTasks), ...reportRows('Tareas en proceso semanal', payload.reportModules.weeklyInProgress), ...reportRows('Tareas en espera', payload.reportModules.waitingTasks)];
  const summaryRows: XlsxRow[] = [[{ value: 'Resumen inteligente', style: 1 }, '', '', ''], [{ value: 'Workspace', style: 4 }, payload.workspaceName, { value: 'Generado', style: 4 }, payload.generatedAtLabel], [], [{ value: 'Lectura', style: 3 }, { value: 'Detalle', style: 3 }], ...(payload.shareDigest.shareSummary.length ? payload.shareDigest.shareSummary.map((item, index) => [`${index + 1}`, item]) : [['1', 'Sin resumen disponible']]), [], [{ value: 'Recomendación', style: 3 }, { value: 'Acción sugerida', style: 3 }], ...(payload.recommendations.length ? payload.recommendations.map((item, index) => [`${index + 1}`, item]) : [['1', 'Mantén el seguimiento semanal y actualiza comentarios en tareas bloqueadas.']])];
  const dictionaryRows: XlsxRow[] = [[{ value: 'Diccionario del reporte', style: 1 }, ''], [{ value: 'Campo', style: 3 }, { value: 'Descripción', style: 3 }], ['Módulo', 'Agrupación del reporte: tareas del día, tareas en proceso semanal o tareas en espera.'], ['Deadline', 'Fecha límite registrada para la tarea.'], ['Estado', 'Estado operativo actual de la tarea.'], ['Prioridad', 'Nivel de atención requerido.'], ['Último comentario', 'Comentario más reciente disponible para seguimiento.']];
  return [{ name: 'Reporte', rows: reportRowsData, widths: [24, 18, 38, 4, 24, 18, 38, 4], merges: ['A1:H1', 'A4:H4', 'A10:H10', 'A13:H13'] }, { name: 'Tareas exportadas', rows: tasksRows, widths: [25, 42, 18, 18, 18, 22, 16, 52], freezeHeader: true, autoFilter: `A1:H${Math.max(tasksRows.length, 1)}` }, { name: 'Resumen', rows: summaryRows, widths: [18, 80, 18, 25], merges: ['A1:D1'] }, { name: 'Diccionario', rows: dictionaryRows, widths: [24, 90], merges: ['A1:B1'] }];
}

function dosTimeDate(date = new Date()) {
  return { time: (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2), date: ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate() };
}

let crcTable: Uint32Array | null = null;
function crc32(bytes: Uint8Array) {
  if (!crcTable) {
    crcTable = new Uint32Array(256);
    for (let index = 0; index < 256; index += 1) {
      let current = index;
      for (let bit = 0; bit < 8; bit += 1) current = current & 1 ? 0xedb88320 ^ (current >>> 1) : current >>> 1;
      crcTable[index] = current >>> 0;
    }
  }
  let crc = 0xffffffff;
  for (const byte of bytes) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}
const u16 = (value: number) => [value & 0xff, (value >>> 8) & 0xff];
const u32 = (value: number) => [value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff];
function concatBytes(parts: Uint8Array[]) {
  const size = parts.reduce((total, part) => total + part.length, 0);
  const output = new Uint8Array(size);
  let offset = 0;
  parts.forEach((part) => { output.set(part, offset); offset += part.length; });
  return output;
}

function createZip(entries: { path: string; content: string }[]) {
  const encoder = new TextEncoder();
  const now = dosTimeDate();
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;
  entries.forEach((entry) => {
    const name = encoder.encode(entry.path);
    const data = encoder.encode(entry.content);
    const crc = crc32(data);
    const localHeader = new Uint8Array([...u32(0x04034b50), ...u16(20), ...u16(0), ...u16(0), ...u16(now.time), ...u16(now.date), ...u32(crc), ...u32(data.length), ...u32(data.length), ...u16(name.length), ...u16(0)]);
    localParts.push(localHeader, name, data);
    const centralHeader = new Uint8Array([...u32(0x02014b50), ...u16(20), ...u16(20), ...u16(0), ...u16(0), ...u16(now.time), ...u16(now.date), ...u32(crc), ...u32(data.length), ...u32(data.length), ...u16(name.length), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(offset)]);
    centralParts.push(centralHeader, name);
    offset += localHeader.length + name.length + data.length;
  });
  const centralDirectory = concatBytes(centralParts);
  const localFiles = concatBytes(localParts);
  const end = new Uint8Array([...u32(0x06054b50), ...u16(0), ...u16(0), ...u16(entries.length), ...u16(entries.length), ...u32(centralDirectory.length), ...u32(localFiles.length), ...u16(0)]);
  return concatBytes([localFiles, centralDirectory, end]);
}

function buildXlsx(payload: SharedAnalyticsPayload) {
  const sheets = buildSheets(payload);
  const sheetDefinitions = sheets.map((sheet, index) => `<sheet name="${safeText(sheet.name)}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`).join('');
  const workbookRels = sheets.map((_, index) => `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${index + 1}.xml"/>`).join('');
  const overrides = sheets.map((_, index) => `<Override PartName="/xl/worksheets/sheet${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('');
  return createZip([{ path: '[Content_Types].xml', content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${overrides}</Types>` }, { path: '_rels/.rels', content: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>' }, { path: 'xl/workbook.xml', content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${sheetDefinitions}</sheets></workbook>` }, { path: 'xl/_rels/workbook.xml.rels', content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${workbookRels}<Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>` }, { path: 'xl/styles.xml', content: buildStylesXml() }, ...sheets.map((sheet, index) => ({ path: `xl/worksheets/sheet${index + 1}.xml`, content: buildWorksheetXml(sheet) }))]);
}

export function downloadAnalyticsXlsx(payload: SharedAnalyticsPayload) {
  downloadBlob(`flowtask-reporte-inteligente-${normalizeFilename(payload.workspaceName)}.xlsx`, new Blob([buildXlsx(payload)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
}

export function downloadAnalyticsCsv(payload: SharedAnalyticsPayload) {
  downloadAnalyticsXlsx(payload);
}

export function triggerAnalyticsPdf(shareUrl: string) {
  window.open(`${shareUrl}${shareUrl.includes('?') ? '&' : '?'}print=1`, '_blank', 'noopener,noreferrer');
}
