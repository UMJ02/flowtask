import type { AnalyticsFeedItem, SharedReportTaskItem, WorkspaceAnalyticsSummary } from '@/lib/queries/analytics';

export type SharedAnalyticsPayload = {
  workspaceName: string;
  generatedAtLabel: string;
  kpis: WorkspaceAnalyticsSummary['kpis'];
  pipeline: WorkspaceAnalyticsSummary['pipeline'];
  weeklyFocus: AnalyticsFeedItem[];
  projectPipeline: AnalyticsFeedItem[];
  recommendations: string[];
  shareDigest: WorkspaceAnalyticsSummary['shareDigest'];
  reportModules: WorkspaceAnalyticsSummary['reportModules'];
};

export function buildSharedAnalyticsPayload(summary: WorkspaceAnalyticsSummary): SharedAnalyticsPayload {
  return {
    workspaceName: summary.organizationName,
    generatedAtLabel: summary.generatedAtLabel,
    kpis: summary.kpis,
    pipeline: summary.pipeline,
    weeklyFocus: summary.weeklyFocus.slice(0, 8),
    projectPipeline: summary.projectPipeline.slice(0, 8),
    recommendations: summary.recommendations.slice(0, 4),
    shareDigest: summary.shareDigest,
    reportModules: summary.reportModules,
  };
}

function bytesToBase64(bytes: Uint8Array) {
  if (typeof window === 'undefined') {
    return Buffer.from(bytes).toString('base64');
  }

  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return window.btoa(binary);
}

function base64ToBytes(base64: string) {
  if (typeof window === 'undefined') {
    return new Uint8Array(Buffer.from(base64, 'base64'));
  }

  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
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
    const json = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(json) as SharedAnalyticsPayload;
    return parsed?.workspaceName ? parsed : null;
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

function reportRows(section: string, items: SharedReportTaskItem[]) {
  return items.map((item) => [
    section,
    item.title,
    item.createdAtLabel,
    item.deadlineLabel,
    item.statusLabel,
    item.clientLabel,
    item.priorityLabel,
    item.lastComment ?? '',
  ]);
}

export function downloadAnalyticsCsv(payload: SharedAnalyticsPayload) {
  const rows: string[][] = [
    ['Módulo', 'Tarea', 'Fecha ingreso', 'Deadline', 'Estado', 'Cliente', 'Prioridad', 'Último comentario'],
    ...reportRows('Tareas del día', payload.reportModules.dayTasks),
    ...reportRows('Tareas en proceso semanal', payload.reportModules.weeklyInProgress),
    ...reportRows('Tareas en espera', payload.reportModules.waitingTasks),
  ];

  rows.push(['', '', '', '', '', '', '', '']);
  rows.push(['Resumen', 'Valor', '', '', '', '', '', '']);
  rows.push(['Favoritos', String(payload.shareDigest.priorityCount), '', '', '', '', '', '']);
  rows.push(['En proceso', String(payload.shareDigest.inProgressCount), '', '', '', '', '', '']);
  rows.push(['En espera', String(payload.shareDigest.waitingCount), '', '', '', '', '', '']);
  rows.push(['Concluidos', String(payload.shareDigest.completedCount), '', '', '', '', '', '']);

  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(','))
    .join('\n');

  downloadBlob('flowtask-reporte-compartido.csv', new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
}

export function triggerAnalyticsPdf(shareUrl: string) {
  window.open(`${shareUrl}${shareUrl.includes('?') ? '&' : '?'}print=1`, '_blank', 'noopener,noreferrer');
}
