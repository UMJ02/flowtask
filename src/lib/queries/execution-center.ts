import { getControlTowerSummary } from '@/lib/queries/control-tower';
import { getPlanningOverview } from '@/lib/queries/planning';
import { getReportsOverview } from '@/lib/queries/reports';
import { getRiskRadarSummary } from '@/lib/queries/risk-radar';
import { getWorkspaceIntelligenceSummary } from '@/lib/queries/workspace-intelligence';

export type ExecutionCenterSummary = {
  kpis: {
    executionScore: number;
    doNow: number;
    unblock: number;
    monitor: number;
    departmentsUnderPressure: number;
    overdueLoad: number;
  };
  doNow: Array<{
    title: string;
    detail: string;
    source: 'Control Tower' | 'Reports' | 'Intelligence';
    tone: 'critical' | 'attention' | 'stable';
  }>;
  unblock: Array<{
    title: string;
    detail: string;
    source: 'Planning' | 'Risk Radar' | 'Onboarding' | 'Intelligence';
    tone: 'critical' | 'attention' | 'stable';
  }>;
  monitor: Array<{
    title: string;
    detail: string;
    source: 'Planning' | 'Risk Radar' | 'Reports';
    tone: 'critical' | 'attention' | 'stable';
  }>;
  teamPulse: Array<{
    name: string;
    openTasks: number;
    activeProjects: number;
    nearTermItems: number;
    score: number;
    state: 'high' | 'medium' | 'stable';
  }>;
  recommendations: string[];
};

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function laneToneFromState(state: 'high' | 'medium' | 'stable'): 'critical' | 'attention' | 'stable' {
  return state === 'high' ? 'critical' : state === 'medium' ? 'attention' : 'stable';
}

export async function getExecutionCenterSummary(): Promise<ExecutionCenterSummary> {
  const [control, planning, risk, reports, intelligence] = await Promise.all([
    getControlTowerSummary(),
    getPlanningOverview(),
    getRiskRadarSummary(),
    getReportsOverview(),
    getWorkspaceIntelligenceSummary(),
  ]);

  const overdueLoad = reports.kpis.overdueTasks + reports.kpis.overdueProjects;
  const departmentsUnderPressure = planning.departmentCapacity.filter((item) => item.state !== 'stable').length;
  const baseExecution = 100 - risk.kpis.riskScore;
  const executionScore = clamp(
    Math.round(baseExecution * 0.35 + intelligence.kpis.completionRate * 0.25 + intelligence.kpis.readinessScore * 0.2 + Math.max(0, 100 - overdueLoad * 8) * 0.2),
  );

  const doNow: ExecutionCenterSummary['doNow'] = [
    ...control.focusNow.slice(0, 3).map((item) => ({
      title: item.title,
      detail: `${item.clientName} · ${item.type === 'task' ? 'Tarea' : 'Proyecto'} · ${item.dueLabel}`,
      source: 'Control Tower' as const,
      tone: mapControlTone(item.urgency),
    })),
    ...reports.focusTasks
      .filter((item) => item.urgency !== 'planned')
      .slice(0, 2)
      .map((item) => ({
        title: item.title,
        detail: `${item.clientName} · ${item.dueLabel} · ${item.status}`,
        source: 'Reports' as const,
        tone: (item.urgency === 'overdue' ? 'critical' : 'attention') as 'critical' | 'attention',
      })),
    ...intelligence.crossModulePriorities.slice(0, 1).map((item) => ({
      title: item.title,
      detail: item.detail,
      source: 'Intelligence' as const,
      tone: item.tone,
    })),
  ].slice(0, 6);

  const pendingOnboarding = intelligence.crossModulePriorities.find((item) => item.source === 'Onboarding');
  const unblock: ExecutionCenterSummary['unblock'] = [
    ...(risk.kpis.waitingTasks > 0
      ? [{
          title: 'Destrabar tareas en espera',
          detail: `${risk.kpis.waitingTasks} tarea(s) siguen en espera y están frenando flujo de ejecución.`,
          source: 'Risk Radar' as const,
          tone: (risk.kpis.waitingTasks >= 5 ? 'critical' : 'attention') as 'critical' | 'attention',
        }]
      : []),
    ...(planning.kpis.overdueOpenTasks > 0
      ? [{
          title: 'Mover vencimientos del horizonte próximo',
          detail: `${planning.kpis.overdueOpenTasks} tarea(s) vencida(s) están contaminando la planeación de 14 días.`,
          source: 'Planning' as const,
          tone: (planning.kpis.overdueOpenTasks >= 5 ? 'critical' : 'attention') as 'critical' | 'attention',
        }]
      : []),
    ...(pendingOnboarding
      ? [{
          title: 'Cerrar pendientes estructurales',
          detail: pendingOnboarding.detail,
          source: 'Onboarding' as const,
          tone: pendingOnboarding.tone,
        }]
      : []),
    ...intelligence.crossModulePriorities
      .filter((item) => item.source === 'Planning' || item.source === 'Risk Radar')
      .slice(0, 2)
      .map((item) => ({
        title: item.title,
        detail: item.detail,
        source: mapUnblockSource(item.source),
        tone: item.tone,
      })),
  ].slice(0, 5);

  const monitor: ExecutionCenterSummary['monitor'] = [
    ...planning.projectPipeline.slice(0, 2).map((item) => ({
      title: item.title,
      detail: `${item.clientName} · ${item.dueLabel} · ${item.status}`,
      source: 'Planning' as const,
      tone: mapProjectTone(item.urgency),
    })),
    ...risk.clientRisks.slice(0, 2).map((item) => ({
      title: item.name,
      detail: `${item.openTasks} tareas abiertas · ${item.activeProjects} proyectos activos · presión ${item.pressure}`,
      source: 'Risk Radar' as const,
      tone: item.tone,
    })),
    ...reports.projectWatchlist.slice(0, 2).map((item) => ({
      title: item.title,
      detail: `${item.clientName} · ${item.dueLabel} · ${item.status}`,
      source: 'Reports' as const,
      tone: mapProjectTone(item.urgency),
    })),
  ].slice(0, 6);

  const recommendations: string[] = [];
  if (doNow.length > 0) recommendations.push(`Hay ${doNow.length} frente(s) listos para ejecutar hoy sin esperar más contexto.`);
  if (risk.kpis.waitingTasks > 0) recommendations.push('La cola de tareas en espera ya pesa en la operación. Conviene limpiar bloqueos antes de abrir trabajo nuevo.');
  if (departmentsUnderPressure > 0) recommendations.push(`Hay ${departmentsUnderPressure} departamento(s) con presión media o alta; ajusta carga antes de comprometer fechas nuevas.`);
  if (executionScore >= 75) recommendations.push('La ejecución viene saludable. Usa esta vista para sostener ritmo y evitar que el riesgo se reactive.');
  if (!recommendations.length) recommendations.push('La vista está balanceada. Usa el centro de ejecución para mantener foco y seguimiento operativo.');

  return {
    kpis: {
      executionScore,
      doNow: doNow.length,
      unblock: unblock.length,
      monitor: monitor.length,
      departmentsUnderPressure,
      overdueLoad,
    },
    doNow,
    unblock,
    monitor,
    teamPulse: planning.departmentCapacity.slice(0, 6).map((item) => ({
      name: item.name,
      openTasks: item.openTasks,
      activeProjects: item.activeProjects,
      nearTermItems: item.nearTermItems,
      score: item.score,
      state: item.state,
    })),
    recommendations: recommendations.slice(0, 5),
  };
}

function mapControlTone(urgency: 'critical' | 'focus' | 'planned'): 'critical' | 'attention' | 'stable' {
  return urgency === 'critical' ? 'critical' : urgency === 'focus' ? 'attention' : 'stable';
}

function mapUnblockSource(source: 'Onboarding' | 'Planning' | 'Control Tower' | 'Risk Radar' | 'Reports'): 'Planning' | 'Risk Radar' {
  return source === 'Planning' ? 'Planning' : 'Risk Radar';
}

function mapProjectTone(urgency: 'overdue' | 'this_week' | 'next_week' | 'planned'): 'critical' | 'attention' | 'stable' {
  return urgency === 'overdue' ? 'critical' : urgency === 'this_week' ? 'attention' : 'stable';
}

export const executionToneLabel = (tone: 'critical' | 'attention' | 'stable') =>
  tone === 'critical' ? 'Crítico' : tone === 'attention' ? 'Atención' : 'Estable';

export const executionLaneTone = laneToneFromState;
