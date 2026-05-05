import { readFileSync } from 'node:fs';
const analyticsShare = readFileSync('src/lib/share/analytics-share.ts', 'utf8');
const landing = readFileSync('src/components/shared/shared-analytics-landing.tsx', 'utf8');
const pkg = readFileSync('package.json', 'utf8');
const required = [
  ['dependency-free XLSX writer', 'function buildXlsx(payload: SharedAnalyticsPayload)'],
  ['xlsx download function', 'export function downloadAnalyticsXlsx(payload: SharedAnalyticsPayload)'],
  ['csv alias kept safe', 'export function downloadAnalyticsCsv(payload: SharedAnalyticsPayload)'],
  ['xlsx mime type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  ['Reporte sheet', "name: 'Reporte'"],
  ['Tareas exportadas sheet', "name: 'Tareas exportadas'"],
  ['Resumen sheet', "name: 'Resumen'"],
  ['Diccionario sheet', "name: 'Diccionario'"],
  ['landing centered width', 'max-w-[1180px]'],
  ['landing bottom actions', 'Exportar reporte'],
];
const failures = required.filter(([, marker]) => !analyticsShare.includes(marker) && !landing.includes(marker)).map(([label]) => label);
if (pkg.includes('exceljs')) failures.push('exceljs dependency should not be present');
if (landing.includes('Resumen del reporte') || landing.includes('lg:grid-cols-[minmax(0,1fr)_320px]')) failures.push('landing side summary panel should be removed');
if (failures.length) {
  console.error('[verify:v58.19.7] FAIL');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log('[verify:v58.19.7] OK — XLSX real sin dependencias nuevas, landing pública centrada y acciones al final.');
