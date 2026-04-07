import { cache } from 'react';
import { getRecentActivitySummary } from '@/lib/queries/activity';
import { getDashboardData } from '@/lib/queries/dashboard';
import { getOrganizationContext } from '@/lib/queries/organization';
import { getUsageEventMetrics } from '@/lib/queries/observability';
import { getWorkspaceOnboardingSummary } from '@/lib/queries/onboarding';
import { getReportsOverview } from '@/lib/queries/reports';
import { getRiskRadarSummary } from '@/lib/queries/risk-radar';

export type AnalyticsTone = 'critical' | 'attention' | 'stable';

export type WorkspaceAnalyticsSummary = {
  organizationName: string;
  generatedAtLabel: string;
  kpis: {
    healthScore: number;
    intelligenceScore: number;
    readinessScore: number;
    completionRate: number;
    adoptionScore: number;
    activityLast48h: number;
  };
  pipeline: {
    activeTasks: number;
    dueThisWeek: number;
    waitingTasks: number;
    activeProjects: number;
    clients: number;
    overdueLoad: number;
  };
  adoption: {
    loginEvents: number;
    projectEvents: number;
    taskEvents: number;
    supportEvents: number;
  };
  highlights: Array<{
    label: string;
    value: string;
    detail: string;
    tone: AnalyticsTone;
  }>;
  watchlist: Array<{
    title: string;
    meta: string;
    tone: AnalyticsTone;
    source: 'Tasks' | 'Projects' | 'Clients' | 'Workspace';
  }>;
  recommendations: string[];
};

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function toneFromValue(value: number, thresholds: { critical: number; attention: number }, inverse = false): AnalyticsTone {
  if (!inverse) {
    if (value >= thresholds.critical) return 'critical';
    if (value >= thresholds.attention) return 'attention';
    return 'stable';
  }

  if (value <= thresholds.critical) return 'critical';
  if (value <= thresholds.attention) return 'attention';
  return 'stable';
}

export const getWorkspaceAnalyticsSummary = cache(async (): Promise<WorkspaceAnalyticsSummary | null> => {
  const organizationContext = await getOrganizationContext();
  const activeOrganizationId = organizationContext?.activeOrganization?.id ?? null;

  const [dashboard, reports, risk, onboarding, usage, activity] = await Promise.all([
    getDashboardData(),
    getReportsOverview(),
    getRiskRadarSummary(),
    getWorkspaceOnboardingSummary(),
    getUsageEventMetrics(activeOrganizationId),
    getRecentActivitySummary(10),
  ]);

  const readinessScore = onboarding?.score ?? 0;
  const completionRate = reports.kpis.completionRate;
  const riskScore = risk.kpis.riskScore;
  const overdueLoad = reports.kpis.overdueTasks + reports.kpis.overdueProjects;
  const activityLast48h = activity.counts.total;
  const adoptionScore = clamp(Math.round(usage.loginEvents * 8 + usage.projectEvents * 6 + usage.taskEvents * 4 + activityLast48h * 2));
  const intelligenceScore = clamp(Math.round(readinessScore * 0.3 + completionRate * 0.35 + (100 - riskScore) * 0.35));
  const healthScore = clamp(
    Math.round(
      completionRate * 0.4 +
        readinessScore * 0.25 +
        (100 - riskScore) * 0.2 +
        Math.max(0, 100 - overdueLoad * 8) * 0.15,
    ),
  );

  const highlights: WorkspaceAnalyticsSummary['highlights'] = [
    {
      label: 'Salud operativa',
      value: `${healthScore}%`,
      detail: 'Cruza ejecución, preparación, riesgo y carga vencida para darte una lectura rápida del workspace.',
      tone: toneFromValue(healthScore, { critical: 45, attention: 70 }, true),
    },
    {
      label: 'Ritmo de cierre',
      value: `${completionRate}%`,
      detail: 'Mide el porcentaje de tareas concluidas contra el volumen total actual del workspace.',
      tone: toneFromValue(completionRate, { critical: 45, attention: 70 }, true),
    },
    {
      label: 'Carga crítica',
      value: `${overdueLoad}`,
      detail: 'Suma tareas y proyectos vencidos que siguen abiertos y merecen foco inmediato.',
      tone: toneFromValue(overdueLoad, { critical: 8, attention: 3 }),
    },
    {
      label: 'Adopción reciente',
      value: `${adoptionScore}%`,
      detail: 'Refleja movimiento de login, cambios en proyectos, tareas y actividad reciente de las últimas 48 horas.',
      tone: toneFromValue(adoptionScore, { critical: 35, attention: 60 }, true),
    },
  ];

  const taskWatchlist: WorkspaceAnalyticsSummary['watchlist'] = reports.focusTasks.slice(0, 2).map((item) => ({
    title: item.title,
    meta: `${item.clientName} · ${item.dueLabel}`,
    tone: item.urgency === 'overdue' ? 'critical' : item.urgency === 'today' ? 'attention' : 'stable',
    source: 'Tasks',
  }));

  const projectWatchlist: WorkspaceAnalyticsSummary['watchlist'] = risk.projectRisks.slice(0, 2).map((item) => ({
    title: item.title,
    meta: `${item.clientName} · ${item.dueLabel}`,
    tone: item.urgency,
    source: 'Projects',
  }));

  const clientWatchlist: WorkspaceAnalyticsSummary['watchlist'] = risk.clientRisks.slice(0, 2).map((item) => ({
    title: item.name,
    meta: `${item.openTasks} tareas abiertas · ${item.activeProjects} proyectos activos`,
    tone: item.tone,
    source: 'Clients',
  }));

  const watchlist: WorkspaceAnalyticsSummary['watchlist'] = [...taskWatchlist, ...projectWatchlist, ...clientWatchlist].slice(0, 6);

  const recommendations: string[] = [];
  if (overdueLoad > 0) recommendations.push(`Tienes ${overdueLoad} elementos vencidos abiertos. Conviene limpiarlos antes de abrir más trabajo.`);
  if (reports.kpis.dueThisWeek > 0) recommendations.push(`${reports.kpis.dueThisWeek} tarea(s) vencen esta semana. Úsalas como foco principal del equipo.`);
  if (risk.kpis.pressuredClients > 0) recommendations.push(`${risk.kpis.pressuredClients} cliente(s) muestran presión operativa. Revisa seguimiento y capacidad.`);
  if ((dashboard?.dueSoonTasks ?? 0) > 0) recommendations.push(`${dashboard?.dueSoonTasks ?? 0} tarea(s) vencen en los próximos 3 días y merecen revisión anticipada.`);
  if (activityLast48h <= 2) recommendations.push('La actividad reciente está baja. Vale la pena reactivar seguimiento, comentarios y cierre de pendientes.');
  if (usage.supportEvents > 0) recommendations.push('Hubo actividad de soporte reciente. Úsala como señal para reforzar estabilidad y documentación interna.');
  if (!recommendations.length) recommendations.push('El workspace viene estable. Esta vista te sirve para sostener ritmo y anticipar desvíos antes de que crezcan.');

  return {
    organizationName: organizationContext?.activeOrganization?.name ?? 'Workspace personal',
    generatedAtLabel: new Date().toLocaleString('es-CR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    kpis: {
      healthScore,
      intelligenceScore,
      readinessScore,
      completionRate,
      adoptionScore,
      activityLast48h,
    },
    pipeline: {
      activeTasks: reports.kpis.activeTasks,
      dueThisWeek: reports.kpis.dueThisWeek,
      waitingTasks: reports.kpis.waitingTasks,
      activeProjects: reports.kpis.activeProjects,
      clients: reports.kpis.clients,
      overdueLoad,
    },
    adoption: usage,
    highlights,
    watchlist,
    recommendations: recommendations.slice(0, 5),
  };
});
