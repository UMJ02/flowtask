import { cache } from 'react';
import { getRecentActivitySummary } from '@/lib/queries/activity';
import { getDashboardData } from '@/lib/queries/dashboard';
import { getOrganizationContext } from '@/lib/queries/organization';
import { getUsageEventMetrics } from '@/lib/queries/observability';
import { getWorkspaceOnboardingSummary } from '@/lib/queries/onboarding';
import { getReportsOverview } from '@/lib/queries/reports';
import { getRiskRadarSummary } from '@/lib/queries/risk-radar';

export type AnalyticsTone = 'critical' | 'attention' | 'stable';

export type AnalyticsFeedItem = {
  id: string;
  title: string;
  meta: string;
  statusLabel: string;
  tone: AnalyticsTone;
  source: 'Tasks' | 'Projects' | 'Clients' | 'Workspace';
};

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
  weeklyFocus: AnalyticsFeedItem[];
  projectPipeline: AnalyticsFeedItem[];
  shareDigest: {
    priorityCount: number;
    inProgressCount: number;
    waitingCount: number;
    completedCount: number;
    deadlineItems: Array<Pick<AnalyticsFeedItem, 'id' | 'title' | 'meta' | 'statusLabel' | 'tone' | 'source'>>;
    shareSummary: string[];
  };
  recommendations: string[];
};

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function statusLabel(value?: string | null) {
  if (!value) return 'Sin estado';
  return value.replaceAll('_', ' ').replace(/\b\w/g, (char) => char.toUpperCase());
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

  const weeklyFocus: WorkspaceAnalyticsSummary['weeklyFocus'] = reports.focusTasks.map((item) => ({
    id: item.id,
    title: item.title,
    meta: `${item.clientName} · ${item.dueLabel}`,
    statusLabel: statusLabel(item.status),
    tone: item.urgency === 'overdue' ? 'critical' : item.urgency === 'today' ? 'attention' : 'stable',
    source: 'Tasks',
  }));

  const projectPipeline: WorkspaceAnalyticsSummary['projectPipeline'] = reports.projectWatchlist.map((item) => ({
    id: item.id,
    title: item.title,
    meta: `${item.clientName} · ${item.dueLabel}`,
    statusLabel: statusLabel(item.status),
    tone: item.urgency === 'overdue' ? 'critical' : item.urgency === 'this_week' ? 'attention' : 'stable',
    source: 'Projects',
  }));

  const completedTasksCount = reports.taskStatus.find((item) => item.value === 'concluido')?.count ?? 0;
  const completedProjectsCount = reports.projectStatus.find((item) => item.value === 'completado')?.count ?? 0;
  const completedCount = completedTasksCount + completedProjectsCount;
  const inProgressCount = Math.max(0, reports.kpis.activeTasks + reports.kpis.activeProjects - reports.kpis.waitingTasks);
  const priorityCount = weeklyFocus.filter((item) => item.tone !== 'stable').length || Math.min(weeklyFocus.length, 3);
  const deadlineItems = [...weeklyFocus, ...projectPipeline]
    .filter((item) => !item.meta.includes('Sin fecha'))
    .slice(0, 6)
    .map(({ id, title, meta, statusLabel, tone, source }) => ({ id, title, meta, statusLabel, tone, source }));

  const recommendations: string[] = [];
  if (overdueLoad > 0) recommendations.push(`Tienes ${overdueLoad} elementos vencidos abiertos. Conviene limpiarlos antes de abrir más trabajo.`);
  if (reports.kpis.dueThisWeek > 0) recommendations.push(`${reports.kpis.dueThisWeek} tarea(s) vencen esta semana. Úsalas como foco principal del equipo.`);
  if (risk.kpis.pressuredClients > 0) recommendations.push(`${risk.kpis.pressuredClients} cliente(s) muestran presión operativa. Revisa seguimiento y capacidad.`);
  if ((dashboard?.dueSoonTasks ?? 0) > 0) recommendations.push(`${dashboard?.dueSoonTasks ?? 0} tarea(s) vencen en los próximos 3 días y merecen revisión anticipada.`);
  if (activityLast48h <= 2) recommendations.push('La actividad reciente está baja. Vale la pena reactivar seguimiento, comentarios y cierre de pendientes.');
  if (usage.supportEvents > 0) recommendations.push('Hubo actividad de soporte reciente. Úsala como señal para reforzar estabilidad y documentación interna.');
  if (!recommendations.length) recommendations.push('El workspace viene estable. Esta vista te sirve para sostener ritmo y anticipar desvíos antes de que crezcan.');

  const shareSummary: string[] = [
    `${priorityCount} prioridad(es) activas listas para seguimiento ejecutivo.`,
    `${inProgressCount} frente(s) siguen en movimiento entre tareas y proyectos.`,
    `${reports.kpis.waitingTasks} elemento(s) están en espera y conviene destrabarlos.`,
    `${completedCount} elemento(s) ya quedaron concluidos y sirven como señal de avance.`,
  ];

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
    weeklyFocus,
    projectPipeline,
    shareDigest: {
      priorityCount,
      inProgressCount,
      waitingCount: reports.kpis.waitingTasks,
      completedCount,
      deadlineItems,
      shareSummary,
    },
    recommendations: recommendations.slice(0, 5),
  };
});
