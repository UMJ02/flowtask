import { getExecutionCenterSummary } from '@/lib/queries/execution-center';
import { getWorkspaceIntelligenceSummary } from '@/lib/queries/workspace-intelligence';
import { getWorkspaceOnboardingSummary } from '@/lib/queries/onboarding';
import { getPlanningOverview } from '@/lib/queries/planning';
import { getControlTowerSummary } from '@/lib/queries/control-tower';
import { getRiskRadarSummary } from '@/lib/queries/risk-radar';

export type WorkspaceOperatingSystemSummary = {
  kpis: {
    operatingScore: number;
    readinessScore: number;
    executionScore: number;
    intelligenceScore: number;
    riskScore: number;
    activeSignals: number;
    priorities: number;
  };
  foundations: {
    organizationName: string;
    role: string;
    completed: number;
    total: number;
    score: number;
  };
  priorities: Array<{
    title: string;
    detail: string;
    source: 'Onboarding' | 'Planning' | 'Control Tower' | 'Risk Radar' | 'Intelligence' | 'Execution';
    tone: 'critical' | 'attention' | 'stable';
  }>;
  operatingLanes: Array<{
    label: string;
    value: number;
    detail: string;
    tone: 'critical' | 'attention' | 'stable';
  }>;
  recommendations: string[];
};

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

export async function getWorkspaceOperatingSystemSummary(): Promise<WorkspaceOperatingSystemSummary | null> {
  const [onboarding, planning, controlTower, risk, intelligence, execution] = await Promise.all([
    getWorkspaceOnboardingSummary(),
    getPlanningOverview(),
    getControlTowerSummary(),
    getRiskRadarSummary(),
    getWorkspaceIntelligenceSummary(),
    getExecutionCenterSummary(),
  ]);

  if (!onboarding) return null;

  const readinessScore = onboarding.score;
  const executionScore = execution.kpis.executionScore;
  const intelligenceScore = intelligence.kpis.intelligenceScore;
  const riskScore = risk.kpis.riskScore;
  const activeSignals =
    controlTower.kpis.activityEvents +
    intelligence.kpis.activeSignals +
    planning.kpis.dueThisWeek +
    risk.kpis.overdueTasks;

  const operatingScore = clamp(
    Math.round(
      readinessScore * 0.22 +
        executionScore * 0.28 +
        intelligenceScore * 0.24 +
        Math.max(0, 100 - riskScore) * 0.26,
    ),
  );

  const priorities: WorkspaceOperatingSystemSummary['priorities'] = [
    ...intelligence.crossModulePriorities.slice(0, 2).map((item) => ({
      title: item.title,
      detail: item.detail,
      source: (item.source === 'Reports' ? 'Intelligence' : item.source) as WorkspaceOperatingSystemSummary['priorities'][number]['source'],
      tone: item.tone,
    })),
    ...execution.doNow.slice(0, 2).map((item) => ({
      title: item.title,
      detail: item.detail,
      source: 'Execution' as const,
      tone: item.tone,
    })),
    ...risk.recommendations.slice(0, 1).map((item) => ({
      title: 'Reducir riesgo activo',
      detail: item,
      source: 'Risk Radar' as const,
      tone: (riskScore >= 65 ? 'critical' : 'attention') as WorkspaceOperatingSystemSummary['priorities'][number]['tone'],
    })),
    ...onboarding.recommendations.slice(0, 1).map((item) => ({
      title: 'Cerrar base estructural',
      detail: item,
      source: 'Onboarding' as const,
      tone: (onboarding.score < 70 ? 'attention' : 'stable') as WorkspaceOperatingSystemSummary['priorities'][number]['tone'],
    })),
  ].slice(0, 6);

  const operatingLanes: WorkspaceOperatingSystemSummary['operatingLanes'] = [
    {
      label: 'Base del workspace',
      value: onboarding.score,
      detail: `${onboarding.completed}/${onboarding.total} pasos cerrados`,
      tone: onboarding.score < 55 ? 'critical' : onboarding.score < 80 ? 'attention' : 'stable',
    },
    {
      label: 'Planeación próxima',
      value: planning.kpis.dueThisWeek + planning.kpis.dueNextWeek,
      detail: `${planning.kpis.overdueOpenTasks} vencidas impactando el horizonte`,
      tone: planning.kpis.overdueOpenTasks >= 5 ? 'critical' : planning.kpis.overdueOpenTasks > 0 ? 'attention' : 'stable',
    },
    {
      label: 'Ejecución inmediata',
      value: execution.kpis.doNow + execution.kpis.unblock,
      detail: `${execution.kpis.doNow} por ejecutar · ${execution.kpis.unblock} por destrabar`,
      tone: execution.kpis.doNow >= 5 || execution.kpis.unblock >= 4 ? 'critical' : execution.kpis.doNow > 0 || execution.kpis.unblock > 0 ? 'attention' : 'stable',
    },
    {
      label: 'Riesgo operativo',
      value: risk.kpis.overdueTasks + risk.kpis.overdueProjects,
      detail: `${risk.kpis.pressuredClients} cliente(s) bajo presión`,
      tone: riskScore >= 65 ? 'critical' : riskScore >= 40 ? 'attention' : 'stable',
    },
  ];

  const recommendations = [
    ...execution.recommendations.slice(0, 2),
    ...intelligence.recommendations.slice(0, 2),
    ...onboarding.recommendations.slice(0, 1),
  ].slice(0, 5);

  return {
    kpis: {
      operatingScore,
      readinessScore,
      executionScore,
      intelligenceScore,
      riskScore,
      activeSignals,
      priorities: priorities.length,
    },
    foundations: {
      organizationName: onboarding.organizationName,
      role: onboarding.role,
      completed: onboarding.completed,
      total: onboarding.total,
      score: onboarding.score,
    },
    priorities,
    operatingLanes,
    recommendations,
  };
}
