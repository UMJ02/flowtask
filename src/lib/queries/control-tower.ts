import { isTaskOverdue } from "@/lib/tasks/status";
import { format, parseISO, startOfDay, differenceInCalendarDays } from 'date-fns';
import { getClients } from '@/lib/queries/clients';
import { getPlanningOverview } from '@/lib/queries/planning';
import { getProjects } from '@/lib/queries/projects';
import { getRecentActivitySummary } from '@/lib/queries/activity';
import { getTasks } from '@/lib/queries/tasks';

type TaskRow = Awaited<ReturnType<typeof getTasks>>[number];
type ProjectRow = Awaited<ReturnType<typeof getProjects>>[number];
type ClientRow = Awaited<ReturnType<typeof getClients>>[number];

export type ControlTowerSummary = {
  kpis: {
    activeTasks: number;
    activeProjects: number;
    overdueTasks: number;
    atRiskProjects: number;
    activeClients: number;
    activityEvents: number;
  };
  focusNow: Array<{
    id: string;
    title: string;
    type: 'task' | 'project';
    clientName: string;
    status: string;
    dueLabel: string;
    urgency: 'critical' | 'focus' | 'planned';
  }>;
  executionLanes: Array<{
    label: string;
    count: number;
    tone: 'critical' | 'focus' | 'stable';
  }>;
  clientSignals: Array<{
    id: string;
    name: string;
    openTasks: number;
    activeProjects: number;
    nearTermItems: number;
    status: string;
  }>;
  recommendations: string[];
};

function parseDate(value?: string | null) {
  if (!value) return null;
  try {
    return startOfDay(parseISO(value));
  } catch {
    return null;
  }
}

function formatDueLabel(value?: string | null) {
  const parsed = parseDate(value);
  if (!parsed) return 'Sin fecha';
  return format(parsed, 'dd/MM/yyyy');
}

function isOpenTask(task: TaskRow) {
  return task.status !== 'concluido';
}

function isActiveProject(project: ProjectRow) {
  return project.status !== 'completado';
}

export async function getControlTowerSummary(): Promise<ControlTowerSummary> {
  const [tasks, projects, clients, planning, activitySummary] = await Promise.all([
    getTasks({}),
    getProjects({}),
    getClients(),
    getPlanningOverview(),
    getRecentActivitySummary(16),
  ]);

  const typedTasks: TaskRow[] = tasks;
  const typedProjects: ProjectRow[] = projects;
  const typedClients: ClientRow[] = clients;

  const today = startOfDay(new Date());
  const openTasks = typedTasks.filter(isOpenTask);
  const activeProjects = typedProjects.filter(isActiveProject);

  const overdueTasks = openTasks.filter((task) => {
    const dueDate = parseDate(task.due_date);
    return dueDate ? dueDate < today : false;
  });

  const atRiskProjects = activeProjects.filter((project) => {
    const dueDate = parseDate(project.due_date);
    return dueDate ? differenceInCalendarDays(dueDate, today) <= 7 : false;
  });

  const focusNow: ControlTowerSummary['focusNow'] = [
    ...overdueTasks.slice(0, 4).map((task) => ({
      id: task.id,
      title: task.title,
      type: 'task' as const,
      clientName: task.client_name || 'Sin cliente',
      status: task.status,
      dueLabel: formatDueLabel(task.due_date),
      urgency: 'critical' as const,
    })),
    ...atRiskProjects.slice(0, 4).map((project) => ({
      id: project.id,
      title: project.title,
      type: 'project' as const,
      clientName: project.client_name || 'Sin cliente',
      status: project.status,
      dueLabel: formatDueLabel(project.due_date),
      urgency: 'focus' as const,
    })),
  ]
    .sort((a, b) => (a.urgency === 'critical' && b.urgency !== 'critical' ? -1 : 0))
    .slice(0, 8);

  const clientSignals = typedClients
    .map((client) => {
      const openTasksForClient = openTasks.filter((task) => task.client_name === client.name).length;
      const activeProjectsForClient = activeProjects.filter((project) => project.client_name === client.name).length;
      const nearTermItems = openTasks.filter((task) => task.client_name === client.name).filter((task) => {
        const dueDate = parseDate(task.due_date);
        return dueDate ? differenceInCalendarDays(dueDate, today) <= 7 : false;
      }).length;

      return {
        id: client.id,
        name: client.name,
        openTasks: openTasksForClient,
        activeProjects: activeProjectsForClient,
        nearTermItems,
        status: client.status,
      };
    })
    .sort((a, b) => b.nearTermItems - a.nearTermItems || b.openTasks + b.activeProjects - (a.openTasks + a.activeProjects))
    .slice(0, 6);

  const executionLanes: ControlTowerSummary['executionLanes'] = [
    { label: 'Crítico ahora', count: overdueTasks.length, tone: overdueTasks.length ? 'critical' : 'stable' },
    { label: 'Próximos 7 días', count: planning.kpis.dueThisWeek, tone: planning.kpis.dueThisWeek ? 'focus' : 'stable' },
    { label: 'Carga estable', count: Math.max(openTasks.length - overdueTasks.length - planning.kpis.dueThisWeek, 0), tone: 'stable' },
  ];

  const recommendations: string[] = [];
  if (overdueTasks.length > 0) recommendations.push(`Hay ${overdueTasks.length} tareas vencidas. Conviene moverlas al primer bloque de ejecución.`);
  if (atRiskProjects.length > 0) recommendations.push(`Tienes ${atRiskProjects.length} proyectos con fecha cercana o vencida. Revisa dependencias y responsables.`);
  if (clientSignals[0]?.nearTermItems) recommendations.push(`El cliente ${clientSignals[0].name} concentra más entregables inmediatos; vale la pena revisarlo primero.`);
  if (activitySummary.counts.comments > 0) recommendations.push(`Se registraron ${activitySummary.counts.comments} eventos de comentarios recientes. Revisa si dejaron cambios pendientes.`);
  if (!recommendations.length) recommendations.push('La operación viene balanceada. Usa esta vista como punto de control antes de abrir módulos más detallados.');

  return {
    kpis: {
      activeTasks: openTasks.length,
      activeProjects: activeProjects.length,
      overdueTasks: overdueTasks.length,
      atRiskProjects: atRiskProjects.length,
      activeClients: typedClients.length,
      activityEvents: activitySummary.counts.total,
    },
    focusNow,
    executionLanes,
    clientSignals,
    recommendations,
  };
}
