import { getExecutionCenterSummary } from '@/lib/queries/execution-center';
import { getReportsOverview } from '@/lib/queries/reports';
import { getRiskRadarSummary } from '@/lib/queries/risk-radar';
import { getWorkspaceIntelligenceSummary } from '@/lib/queries/workspace-intelligence';
import { getWorkspaceOperatingSystemSummary } from '@/lib/queries/workspace-operating-system';

export type ExecutiveSuiteSummary = {
  kpis: {
    executiveScore: number;
    operatingScore: number;
    executionScore: number;
    riskScore: number;
    intelligenceScore: number;
    activeDecisions: number;
    watchlistSize: number;
  };
  decisionBoard: Array<{
    title: string;
    detail: string;
    source: 'Workspace OS' | 'Execution Center' | 'Risk Radar' | 'Intelligence';
    tone: 'critical' | 'attention' | 'stable';
  }>;
  governanceWatchlist: Array<{
    title: string;
    owner: string;
    detail: string;
    source: 'Project' | 'Client' | 'Task';
    tone: 'critical' | 'attention' | 'stable';
  }>;
  weeklyCadence: Array<{
    label: string;
    value: string;
    detail: string;
  }>;
  recommendations: string[];
};

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

export async function getExecutiveSuiteSummary(): Promise<ExecutiveSuiteSummary | null> {
  const [workspaceOs, execution, risk, intelligence, reports] = await Promise.all([
    getWorkspaceOperatingSystemSummary(),
    getExecutionCenterSummary(),
    getRiskRadarSummary(),
    getWorkspaceIntelligenceSummary(),
    getReportsOverview(),
  ]);

  if (!workspaceOs) return null;

  const executiveScore = clamp(
    Math.round(
      workspaceOs.kpis.operatingScore * 0.3 +
        execution.kpis.executionScore * 0.24 +
        intelligence.kpis.intelligenceScore * 0.24 +
        Math.max(0, 100 - risk.kpis.riskScore) * 0.22,
    ),
  );

  const decisionBoard: ExecutiveSuiteSummary['decisionBoard'] = [
    ...workspaceOs.priorities.slice(0, 2).map((item) => ({
      title: item.title,
      detail: item.detail,
      source: 'Workspace OS' as const,
      tone: item.tone,
    })),
    ...execution.doNow.slice(0, 2).map((item) => ({
      title: item.title,
      detail: item.detail,
      source: 'Execution Center' as const,
      tone: item.tone,
    })),
    ...risk.recommendations.slice(0, 1).map((item) => ({
      title: 'Reducir presión operativa',
      detail: item,
      source: 'Risk Radar' as const,
      tone: risk.kpis.riskScore >= 65 ? 'critical' : 'attention',
    })),
    ...intelligence.crossModulePriorities.slice(0, 1).map((item) => ({
      title: item.title,
      detail: item.detail,
      source: 'Intelligence' as const,
      tone: item.tone,
    })),
  ].slice(0, 6);

  const governanceWatchlist: ExecutiveSuiteSummary['governanceWatchlist'] = [
    ...reports.projectWatchlist.slice(0, 3).map((item) => ({
      title: item.title,
      owner: item.clientName,
      detail: `${item.status} · ${item.dueLabel}`,
      source: 'Project' as const,
      tone: item.urgency === 'overdue' ? 'critical' : item.urgency === 'this_week' ? 'attention' : 'stable',
    })),
    ...risk.clientRisks.slice(0, 2).map((item) => ({
      title: item.name,
      owner: 'Cliente',
      detail: `${item.openTasks} tareas abiertas · ${item.activeProjects} proyectos activos · presión ${item.pressure}`,
      source: 'Client' as const,
      tone: item.tone,
    })),
    ...reports.focusTasks.slice(0, 2).map((item) => ({
      title: item.title,
      owner: item.clientName,
      detail: `${item.status} · ${item.dueLabel}`,
      source: 'Task' as const,
      tone: item.urgency === 'overdue' ? 'critical' : item.urgency === 'focus' ? 'attention' : 'stable',
    })),
  ].slice(0, 7);

  const weeklyCadence: ExecutiveSuiteSummary['weeklyCadence'] = [
    {
      label: 'Operating score',
      value: `${workspaceOs.kpis.operatingScore}%`,
      detail: `${workspaceOs.kpis.priorities} prioridad(es) activas en la capa maestra.`,
    },
    {
      label: 'Execution score',
      value: `${execution.kpis.executionScore}%`,
      detail: `${execution.kpis.doNow} do now · ${execution.kpis.unblock} unblock · ${execution.kpis.monitor} monitor.`,
    },
    {
      label: 'Risk load',
      value: `${risk.kpis.riskScore}%`,
      detail: `${risk.kpis.overdueTasks} tareas vencidas · ${risk.kpis.pressuredClients} cliente(s) bajo presión.`,
    },
    {
      label: 'Completion rate',
      value: `${intelligence.kpis.completionRate}%`,
      detail: `${reports.kpis.completedTasks} tareas completadas y ${reports.kpis.completedProjects} proyectos cerrados.`,
    },
  ];

  const recommendations: string[] = [];
  if (decisionBoard.length > 0) recommendations.push(`Hay ${decisionBoard.length} decisión(es) activas para resolver esta semana con foco ejecutivo.`);
  if (risk.kpis.riskScore >= 60) recommendations.push('El riesgo operativo está alto. Conviene revisar vencimientos antes de comprometer nuevas fechas.');
  if (execution.kpis.unblock > 0) recommendations.push(`Quedaron ${execution.kpis.unblock} bloqueo(s) detectados; destrabarlos mejora ejecución más rápido que abrir trabajo nuevo.`);
  if (workspaceOs.kpis.operatingScore >= 75 && intelligence.kpis.intelligenceScore >= 70) recommendations.push('La base ejecutiva está saludable. Usa esta vista para sostener ritmo y anticipar desviaciones.');
  if (!recommendations.length) recommendations.push('La operación está balanceada. Usa el executive suite como tablero semanal de decisiones y gobierno.');

  return {
    kpis: {
      executiveScore,
      operatingScore: workspaceOs.kpis.operatingScore,
      executionScore: execution.kpis.executionScore,
      riskScore: risk.kpis.riskScore,
      intelligenceScore: intelligence.kpis.intelligenceScore,
      activeDecisions: decisionBoard.length,
      watchlistSize: governanceWatchlist.length,
    },
    decisionBoard,
    governanceWatchlist,
    weeklyCadence,
    recommendations: recommendations.slice(0, 5),
  };
}
