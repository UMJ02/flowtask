import { endOfWeek, format, isWithinInterval, parseISO, startOfToday, addDays } from 'date-fns';
import { getClients } from '@/lib/queries/clients';
import { getProjects } from '@/lib/queries/projects';
import { getTasks } from '@/lib/queries/tasks';

type TaskRow = Awaited<ReturnType<typeof getTasks>>[number];
type ProjectRow = Awaited<ReturnType<typeof getProjects>>[number];
type ClientRow = Awaited<ReturnType<typeof getClients>>[number];

type DepartmentReference =
  | { code?: string | null; name?: string | null }
  | Array<{ code?: string | null; name?: string | null }>
  | null
  | undefined;

function formatDateLabel(value?: string | null) {
  if (!value) return 'Sin fecha';
  try {
    return format(parseISO(value), 'dd/MM/yyyy');
  } catch {
    return value;
  }
}

function getDepartmentName(reference: DepartmentReference) {
  const department = Array.isArray(reference) ? reference[0] : reference;
  return department?.name?.trim() || department?.code?.trim() || 'Sin departamento';
}

function getTaskUrgency(task: TaskRow, today: Date, nextWeekEnd: Date): 'critical' | 'attention' | 'stable' {
  if (task.status === 'en_espera') return 'stable';
  if (!task.due_date) return 'stable';
  try {
    const dueDate = parseISO(task.due_date);
    if (dueDate < today) return 'critical';
    if (isWithinInterval(dueDate, { start: today, end: nextWeekEnd })) return 'attention';
  } catch {
    return 'stable';
  }

  return 'stable';
}

function getProjectUrgency(project: ProjectRow, today: Date, nextWeekEnd: Date): 'critical' | 'attention' | 'stable' {
  if (!project.due_date) return 'stable';
  try {
    const dueDate = parseISO(project.due_date);
    if (dueDate < today) return 'critical';
    if (isWithinInterval(dueDate, { start: today, end: nextWeekEnd })) return 'attention';
  } catch {
    return 'stable';
  }

  return 'stable';
}

export type RiskRadarSummary = {
  kpis: {
    riskScore: number;
    overdueTasks: number;
    overdueProjects: number;
    waitingTasks: number;
    pressuredClients: number;
  };
  riskBuckets: Array<{
    label: string;
    count: number;
    tone: 'critical' | 'attention' | 'stable';
  }>;
  hotspots: Array<{
    name: string;
    openTasks: number;
    activeProjects: number;
    nearTermItems: number;
    tone: 'critical' | 'attention' | 'stable';
  }>;
  projectRisks: Array<{
    id: string;
    title: string;
    clientName: string;
    status: string;
    dueLabel: string;
    urgency: 'critical' | 'attention' | 'stable';
  }>;
  clientRisks: Array<{
    id: string;
    name: string;
    status: string;
    openTasks: number;
    activeProjects: number;
    pressure: number;
    tone: 'critical' | 'attention' | 'stable';
  }>;
  recommendations: string[];
};

export async function getRiskRadarSummary(): Promise<RiskRadarSummary> {
  const [tasks, projects, clients] = await Promise.all([getTasks({}), getProjects({}), getClients()]);

  const typedTasks: TaskRow[] = tasks;
  const typedProjects: ProjectRow[] = projects;
  const typedClients: ClientRow[] = clients;

  const today = startOfToday();
  const nextWeekEnd = endOfWeek(addDays(today, 7), { weekStartsOn: 1 });
  const activeTasks = typedTasks.filter((task) => task.status !== 'concluido');
  const activeProjects = typedProjects.filter((project) => project.status !== 'completado');

  const overdueTasks = activeTasks.filter((task) => getTaskUrgency(task, today, nextWeekEnd) === 'critical');
  const attentionTasks = activeTasks.filter((task) => getTaskUrgency(task, today, nextWeekEnd) === 'attention');
  const waitingTasks = activeTasks.filter((task) => task.status === 'en_espera');
  const overdueProjects = activeProjects.filter((project) => getProjectUrgency(project, today, nextWeekEnd) === 'critical');
  const attentionProjects = activeProjects.filter((project) => getProjectUrgency(project, today, nextWeekEnd) === 'attention');

  const departmentMap = new Map<string, { name: string; openTasks: number; activeProjects: number; nearTermItems: number }>();
  for (const task of activeTasks) {
    const name = getDepartmentName(task.departments);
    const current = departmentMap.get(name) ?? { name, openTasks: 0, activeProjects: 0, nearTermItems: 0 };
    current.openTasks += 1;
    if (getTaskUrgency(task, today, nextWeekEnd) !== 'stable') current.nearTermItems += 1;
    departmentMap.set(name, current);
  }
  for (const project of activeProjects) {
    const name = getDepartmentName(project.departments);
    const current = departmentMap.get(name) ?? { name, openTasks: 0, activeProjects: 0, nearTermItems: 0 };
    current.activeProjects += 1;
    if (getProjectUrgency(project, today, nextWeekEnd) !== 'stable') current.nearTermItems += 1;
    departmentMap.set(name, current);
  }

  const hotspots = Array.from(departmentMap.values())
    .map((item) => ({
      ...item,
      tone: (item.nearTermItems >= 6 ? 'critical' : item.nearTermItems >= 3 ? 'attention' : 'stable') as 'critical' | 'attention' | 'stable',
    }))
    .sort((a, b) => b.nearTermItems - a.nearTermItems || b.openTasks + b.activeProjects - (a.openTasks + a.activeProjects))
    .slice(0, 6);

  const clientRisks = [...typedClients]
    .map((client) => {
      const pressure = client.openTasksCount * 2 + client.projectsCount;
      const tone = (pressure >= 8 ? 'critical' : pressure >= 4 ? 'attention' : 'stable') as 'critical' | 'attention' | 'stable';
      return {
        id: client.id,
        name: client.name,
        status: client.status,
        openTasks: client.openTasksCount,
        activeProjects: client.projectsCount,
        pressure,
        tone,
      };
    })
    .filter((client) => client.pressure > 0)
    .sort((a, b) => b.pressure - a.pressure)
    .slice(0, 6);

  const projectRisks = [...activeProjects]
    .map((project) => ({
      id: project.id,
      title: project.title,
      clientName: project.client_name || 'Sin cliente',
      status: project.status,
      dueLabel: formatDateLabel(project.due_date),
      urgency: getProjectUrgency(project, today, nextWeekEnd),
    }))
    .sort((a, b) => {
      const rank = { critical: 0, attention: 1, stable: 2 } as const;
      return rank[a.urgency] - rank[b.urgency];
    })
    .slice(0, 6);

  const riskScoreBase = overdueTasks.length * 8 + overdueProjects.length * 10 + waitingTasks.length * 4 + clientRisks.filter((item) => item.tone !== 'stable').length * 6;
  const riskScore = Math.max(0, Math.min(100, riskScoreBase));

  const recommendations: string[] = [];
  if (overdueTasks.length > 0) recommendations.push(`Resolver ${overdueTasks.length} tarea(s) vencida(s) para bajar presión operativa inmediata.`);
  if (overdueProjects.length > 0) recommendations.push(`Revisar ${overdueProjects.length} proyecto(s) vencido(s) con cliente o responsable principal.`);
  if (waitingTasks.length > 0) recommendations.push(`Mover ${waitingTasks.length} tarea(s) en espera para evitar bloqueo acumulado.`);
  if (hotspots[0]?.tone === 'critical') recommendations.push(`El departamento ${hotspots[0].name} concentra la mayor señal de riesgo y merece revisión hoy.`);
  if (!recommendations.length) recommendations.push('La operación está controlada. Aprovecha para limpiar backlog y cerrar pendientes de bajo riesgo.');

  return {
    kpis: {
      riskScore,
      overdueTasks: overdueTasks.length,
      overdueProjects: overdueProjects.length,
      waitingTasks: waitingTasks.length,
      pressuredClients: clientRisks.filter((item) => item.tone !== 'stable').length,
    },
    riskBuckets: [
      { label: 'Crítico', count: overdueTasks.length + overdueProjects.length, tone: 'critical' },
      { label: 'Atención', count: attentionTasks.length + attentionProjects.length + waitingTasks.length, tone: 'attention' },
      { label: 'Estable', count: Math.max(0, activeTasks.length + activeProjects.length - (overdueTasks.length + overdueProjects.length + attentionTasks.length + attentionProjects.length)), tone: 'stable' },
    ],
    hotspots,
    projectRisks,
    clientRisks,
    recommendations,
  };
}
