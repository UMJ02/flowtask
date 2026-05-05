import type { SharedReportTaskItem, WorkspaceAnalyticsSummary } from '@/lib/queries/analytics';

export type SharedAnalyticsPayload = {
  workspaceName: string;
  generatedAtLabel: string;
  shareDigest: WorkspaceAnalyticsSummary['shareDigest'];
  reportModules: WorkspaceAnalyticsSummary['reportModules'];
  recommendations: string[];
};

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
    const parsed = JSON.parse(json) as Partial<SharedAnalyticsPayload>;
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

function reportRows(section: string, items: SharedReportTaskItem[]) {
  return items.map((item) => [
    section,
    item.title,
    item.createdAtLabel,
    item.deadlineLabel,
    item.statusLabel,
    item.clientLabel,
    item.priorityLabel,
    item.lastComment ?? 'Sin comentario registrado',
  ]);
}

function normalizeFilename(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'workspace';
}

export function getSharedReportTasks(payload: SharedAnalyticsPayload) {
  const allItems = [
    ...payload.reportModules.dayTasks,
    ...payload.reportModules.weeklyInProgress,
    ...payload.reportModules.waitingTasks,
  ];
  const seen = new Set<string>();
  return allItems.filter((item) => {
    const key = item.id || `${item.title}-${item.deadlineLabel}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function downloadAnalyticsCsv(payload: SharedAnalyticsPayload) {
  const rows: string[][] = [
    ['FlowTask · Reporte inteligente'],
    ['Workspace', payload.workspaceName],
    ['Generado', payload.generatedAtLabel],
    [''],
    ['Resumen ejecutivo', 'Valor'],
    ['Favoritos / prioridad alta', String(payload.shareDigest.priorityCount)],
    ['En proceso', String(payload.shareDigest.inProgressCount)],
    ['En espera', String(payload.shareDigest.waitingCount)],
    ['Concluidos', String(payload.shareDigest.completedCount)],
    ['Tareas incluidas en reporte', String(getSharedReportTasks(payload).length)],
    [''],
    ['Lectura inteligente'],
    ...(payload.shareDigest.shareSummary.length ? payload.shareDigest.shareSummary.map((item, index) => [`${index + 1}`, item]) : [['1', 'Sin resumen disponible']]),
    [''],
    ['Recomendaciones'],
    ...(payload.recommendations.length ? payload.recommendations.map((item, index) => [`${index + 1}`, item]) : [['1', 'Sin recomendaciones disponibles']]),
    [''],
    ['Módulo', 'Tarea', 'Fecha ingreso', 'Deadline', 'Estado', 'Cliente', 'Prioridad', 'Último comentario'],
    ...reportRows('Tareas del día', payload.reportModules.dayTasks),
    ...reportRows('Tareas en proceso semanal', payload.reportModules.weeklyInProgress),
    ...reportRows('Tareas en espera', payload.reportModules.waitingTasks),
    [''],
    ['Diccionario'],
    ['Módulo', 'Agrupación del reporte: tareas del día, tareas en proceso semanal o tareas en espera.'],
    ['Deadline', 'Fecha límite registrada para la tarea.'],
    ['Estado', 'Estado operativo actual de la tarea.'],
    ['Último comentario', 'Comentario más reciente disponible para seguimiento.'],
  ];

  const BOM = '﻿';
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(';'))
    .join('\r\n');

  downloadBlob(`flowtask-reporte-inteligente-${normalizeFilename(payload.workspaceName)}.csv`, new Blob([`${BOM}${csv}`], { type: 'text/csv;charset=utf-8;' }));
}

export function triggerAnalyticsPdf(shareUrl: string) {
  window.open(`${shareUrl}${shareUrl.includes('?') ? '&' : '?'}print=1`, '_blank', 'noopener,noreferrer');
}
