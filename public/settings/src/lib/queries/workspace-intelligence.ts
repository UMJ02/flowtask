import { getControlTowerSummary } from '@/lib/queries/control-tower';
import { getPlanningOverview } from '@/lib/queries/planning';
import { getRecentActivitySummary } from '@/lib/queries/activity';
import { getReportsOverview } from '@/lib/queries/reports';
import { getRiskRadarSummary } from '@/lib/queries/risk-radar';
import { getWorkspaceOnboardingSummary } from '@/lib/queries/onboarding';

export type WorkspaceIntelligenceSummary = {
  kpis: {
    intelligenceScore: number;
    readinessScore: number;
    riskScore: number;
    completionRate: number;
    activeSignals: number;
    overdueLoad: number;
  };
  executiveSignals: Array<{
    label: string;
    value: number;
    tone: 'critical' | 'attention' | 'stable';
    description: string;
  }>;
  crossModulePriorities: Array<{
    title: string;
    detail: string;
    source: 'Onboarding' | 'Planning' | 'Control Tower' | 'Risk Radar' | 'Reports';
    tone: 'critical' | 'attention' | 'stable';
  }>;
  watchlist: Array<{
    title: string;
    meta: string;
    source: 'Projects' | 'Clients' | 'Tasks';
    tone: 'critical' | 'attention' | 'stable';
  }>;
  recommendations: string[];
};

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

export async function getWorkspaceIntelligenceSummary(): Promise<WorkspaceIntelligenceSummary> {
  const [onboarding, planning, control, risk, reports, activity] = await Promise.all([
    getWorkspaceOnboardingSummary(),
    getPlanningOverview(),
    getControlTowerSummary(),
    getRiskRadarSummary(),
    getReportsOverview(),
    getRecentActivitySummary(12),
  ]);

  const readinessScore = onboarding?.score ?? 0;
  const riskScore = risk.kpis.riskScore;
  const completionRate = reports.kpis.completionRate;
  const activeSignals = control.kpis.activityEvents + planning.kpis.dueThisWeek + risk.kpis.pressuredClients;
  const overdueLoad = reports.kpis.overdueTasks + reports.kpis.overdueProjects;
  const intelligenceScore = clamp(
    Math.round(readinessScore * 0.35 + completionRate * 0.35 + (100 - riskScore) * 0.3),
  );

  const executiveSignals: WorkspaceIntelligenceSummary['executiveSignals'] = [
    {
      label: 'Readiness',
      value: readinessScore,
      tone: readinessScore >= 75 ? 'stable' : readinessScore >= 45 ? 'attention' : 'critical',
      description: 'Qué tan lista está la base operativa del workspace.',
    },
    {
      label: 'Risk score',
      value: riskScore,
      tone: riskScore >= 65 ? 'critical' : riskScore >= 35 ? 'attention' : 'stable',
      description: 'Señal combinada de vencimientos, espera y presión por cliente.',
    },
    {
      label: 'Ritmo de cierre',
      value: completionRate,
      tone: completionRate >= 70 ? 'stable' : completionRate >= 45 ? 'attention' : 'critical',
      description: 'Porcentaje de tareas cerradas dentro del total disponible.',
    },
    {
      label: 'Carga vencida',
      value: overdueLoad,
      tone: overdueLoad >= 8 ? 'critical' : overdueLoad >= 3 ? 'attention' : 'stable',
      description: 'Tareas y proyectos vencidos que siguen abiertos.',
    },
  ];

  const crossModulePriorities: WorkspaceIntelligenceSummary['crossModulePriorities'] = [];

  const pendingOnboardingSteps = onboarding ? Math.max(onboarding.total - onboarding.completed, 0) : 0;

  if (onboarding && pendingOnboardingSteps > 0) {
    crossModulePriorities.push({
      title: 'Cerrar básicos del workspace',
      detail: `${pendingOnboardingSteps} paso(s) de onboarding siguen pendientes y afectan consistencia operativa.`,
      source: 'Onboarding',
      tone: pendingOnboardingSteps >= 4 ? 'attention' : 'stable',
    });
  }

  if (planning.kpis.overdueOpenTasks > 0) {
    crossModulePriorities.push({
      title: 'Mover vencimientos fuera del bloque crítico',
      detail: `${planning.kpis.overdueOpenTasks} tarea(s) vencida(s) están presionando la planeación de los próximos 14 días.`,
      source: 'Planning',
      tone: planning.kpis.overdueOpenTasks >= 5 ? 'critical' : 'attention',
    });
  }

  if (control.focusNow[0]) {
    crossModulePriorities.push({
      title: 'Resolver foco inmediato',
      detail: `${control.focusNow[0].title} aparece como elemento prioritario de ejecución en Control Tower.`,
      source: 'Control Tower',
      tone: control.focusNow[0].urgency === 'critical' ? 'critical' : 'attention',
    });
  }

  if (risk.projectRisks[0]) {
    crossModulePriorities.push({
      title: 'Bajar exposición de proyectos',
      detail: `${risk.projectRisks[0].title} encabeza el watchlist de riesgo por fecha o presión operativa.`,
      source: 'Risk Radar',
      tone: risk.projectRisks[0].urgency,
    });
  }

  if (reports.focusTasks[0]) {
    crossModulePriorities.push({
      title: 'Ajustar foco semanal del equipo',
      detail: `${reports.focusTasks[0].title} aparece en el foco de reportes y debe entrar al bloque principal de seguimiento.`,
      source: 'Reports',
      tone: reports.focusTasks[0].urgency === 'overdue' ? 'critical' : reports.focusTasks[0].urgency === 'today' ? 'attention' : 'stable',
    });
  }

  const watchlist = [
    ...risk.projectRisks.slice(0, 2).map((item) => ({
      title: item.title,
      meta: `${item.clientName} · ${item.dueLabel}`,
      source: 'Projects' as const,
      tone: item.urgency,
    })),
    ...risk.clientRisks.slice(0, 2).map((item) => ({
      title: item.name,
      meta: `${item.openTasks} tareas abiertas · ${item.activeProjects} proyectos activos`,
      source: 'Clients' as const,
      tone: item.tone,
    })),
    ...reports.focusTasks.slice(0, 2).map((item) => ({
      title: item.title,
      meta: `${item.clientName} · ${item.dueLabel}`,
      source: 'Tasks' as const,
      tone: item.urgency === 'overdue' ? 'critical' : item.urgency === 'today' ? 'attention' : 'stable',
    })),
  ].slice(0, 6) as WorkspaceIntelligenceSummary['watchlist'];

  const recommendations: string[] = [];
  if (riskScore >= 65) recommendations.push('El riesgo operativo está alto. Conviene revisar vencimientos y clientes con presión antes de abrir trabajo nuevo.');
  if (readinessScore < 70) recommendations.push('Todavía faltan básicos del workspace. Cerrar onboarding mejora estabilidad y visibilidad del equipo.');
  if (completionRate < 55) recommendations.push('El ritmo de cierre está bajo. Vale la pena reducir trabajo en espera y limpiar el backlog prioritario.');
  if (activity.counts.total > 0) recommendations.push(`Hubo ${activity.counts.total} eventos recientes; usa esa actividad para validar bloqueos y próximos movimientos.`);
  if (!recommendations.length) recommendations.push('El workspace viene balanceado. Esta vista te sirve para sostener ritmo y anticipar desviaciones.');

  return {
    kpis: {
      intelligenceScore,
      readinessScore,
      riskScore,
      completionRate,
      activeSignals,
      overdueLoad,
    },
    executiveSignals,
    crossModulePriorities: crossModulePriorities.slice(0, 5),
    watchlist,
    recommendations: recommendations.slice(0, 5),
  };
}
