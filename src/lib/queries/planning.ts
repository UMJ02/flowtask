import { addDays, differenceInCalendarDays, format, parseISO, startOfDay } from 'date-fns';
import { getProjects } from '@/lib/queries/projects';
import { getTasks } from '@/lib/queries/tasks';
import { getClients } from '@/lib/queries/clients';

type TaskRow = Awaited<ReturnType<typeof getTasks>>[number];
type ProjectRow = Awaited<ReturnType<typeof getProjects>>[number];
type ClientRow = Awaited<ReturnType<typeof getClients>>[number];

type DepartmentReference =
  | { code?: string | null; name?: string | null }
  | Array<{ code?: string | null; name?: string | null }>
  | null
  | undefined;

export type PlanningOverview = {
  kpis: {
    dueThisWeek: number;
    dueNextWeek: number;
    overdueOpenTasks: number;
    activeProjects: number;
    collaborativeProjects: number;
    activeClients: number;
  };
  dueBuckets: Array<{
    label: string;
    count: number;
    tone: 'critical' | 'focus' | 'planned' | 'backlog';
  }>;
  departmentCapacity: Array<{
    name: string;
    nearTermItems: number;
    activeProjects: number;
    openTasks: number;
    score: number;
    state: 'high' | 'medium' | 'stable';
  }>;
  weeklyFocus: Array<{
    id: string;
    title: string;
    clientName: string;
    status: string;
    dueLabel: string;
    daysLeft: number | null;
    urgency: 'overdue' | 'today' | 'this_week' | 'next_week' | 'planned';
  }>;
  projectPipeline: Array<{
    id: string;
    title: string;
    clientName: string;
    status: string;
    dueLabel: string;
    isCollaborative: boolean;
    urgency: 'overdue' | 'this_week' | 'next_week' | 'planned';
  }>;
  clientMomentum: Array<{
    id: string;
    name: string;
    openTasks: number;
    openProjects: number;
    upcomingItems: number;
    status: string;
  }>;
  recommendations: string[];
};

function getDepartmentName(reference: DepartmentReference) {
  const department = Array.isArray(reference) ? reference[0] : reference;
  return department?.name?.trim() || department?.code?.trim() || 'Sin departamento';
}

function isOpenTask(task: TaskRow) {
  return task.status !== 'concluido';
}

function isActiveProject(project: ProjectRow) {
  return project.status !== 'completado';
}

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

function getTaskUrgency(task: TaskRow, today: Date, nextWeekEnd: Date): PlanningOverview['weeklyFocus'][number]['urgency'] {
  const dueDate = parseDate(task.due_date);
  if (!dueDate) return 'planned';
  const diff = differenceInCalendarDays(dueDate, today);
  if (diff < 0) return 'overdue';
  if (diff === 0) return 'today';
  if (diff <= 7) return 'this_week';
  if (dueDate <= nextWeekEnd) return 'next_week';
  return 'planned';
}

function getProjectUrgency(project: ProjectRow, today: Date, nextWeekEnd: Date): PlanningOverview['projectPipeline'][number]['urgency'] {
  const dueDate = parseDate(project.due_date);
  if (!dueDate) return 'planned';
  const diff = differenceInCalendarDays(dueDate, today);
  if (diff < 0) return 'overdue';
  if (diff <= 7) return 'this_week';
  if (dueDate <= nextWeekEnd) return 'next_week';
  return 'planned';
}

export async function getPlanningOverview(): Promise<PlanningOverview> {
  const [tasks, projects, clients] = await Promise.all([getTasks({}), getProjects({}), getClients()]);

  const typedTasks: TaskRow[] = tasks;
  const typedProjects: ProjectRow[] = projects;
  const typedClients: ClientRow[] = clients;

  const today = startOfDay(new Date());
  const weekEnd = addDays(today, 7);
  const nextWeekEnd = addDays(today, 14);

  const openTasks = typedTasks.filter(isOpenTask);
  const activeProjects = typedProjects.filter(isActiveProject);

  const dueThisWeek = openTasks.filter((task) => {
    const dueDate = parseDate(task.due_date);
    return dueDate ? dueDate <= weekEnd && dueDate >= today : false;
  }).length;

  const dueNextWeek = openTasks.filter((task) => {
    const dueDate = parseDate(task.due_date);
    return dueDate ? dueDate > weekEnd && dueDate <= nextWeekEnd : false;
  }).length;

  const overdueOpenTasks = openTasks.filter((task) => {
    const dueDate = parseDate(task.due_date);
    return dueDate ? dueDate < today : false;
  }).length;

  const dueBuckets: PlanningOverview['dueBuckets'] = [
    { label: 'Vencido', count: overdueOpenTasks, tone: 'critical' },
    { label: 'Esta semana', count: dueThisWeek, tone: 'focus' },
    { label: 'Próxima semana', count: dueNextWeek, tone: 'planned' },
    { label: 'Sin fecha', count: openTasks.filter((task) => !task.due_date).length, tone: 'backlog' },
  ];

  const departmentMap = new Map<string, { name: string; nearTermItems: number; activeProjects: number; openTasks: number; score: number; state: 'high' | 'medium' | 'stable' }>();

  for (const task of openTasks) {
    const departmentName = getDepartmentName(task.departments);
    const current = departmentMap.get(departmentName) ?? { name: departmentName, nearTermItems: 0, activeProjects: 0, openTasks: 0, score: 0, state: 'stable' as const };
    current.openTasks += 1;
    const dueDate = parseDate(task.due_date);
    if (dueDate && dueDate <= nextWeekEnd) current.nearTermItems += 1;
    departmentMap.set(departmentName, current);
  }

  for (const project of activeProjects) {
    const departmentName = getDepartmentName(project.departments);
    const current = departmentMap.get(departmentName) ?? { name: departmentName, nearTermItems: 0, activeProjects: 0, openTasks: 0, score: 0, state: 'stable' as const };
    current.activeProjects += 1;
    const dueDate = parseDate(project.due_date);
    if (dueDate && dueDate <= nextWeekEnd) current.nearTermItems += 1;
    departmentMap.set(departmentName, current);
  }

  const departmentCapacity = Array.from(departmentMap.values())
    .map((item) => {
      const score = item.nearTermItems * 2 + item.openTasks + item.activeProjects;
      const state: 'high' | 'medium' | 'stable' = score >= 10 ? 'high' : score >= 6 ? 'medium' : 'stable';
      return { ...item, score, state };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  const weeklyFocus = [...openTasks]
    .sort((a, b) => {
      const aDate = parseDate(a.due_date);
      const bDate = parseDate(b.due_date);
      if (!aDate && !bDate) return 0;
      if (!aDate) return 1;
      if (!bDate) return -1;
      return aDate.getTime() - bDate.getTime();
    })
    .slice(0, 8)
    .map((task) => {
      const dueDate = parseDate(task.due_date);
      const daysLeft = dueDate ? differenceInCalendarDays(dueDate, today) : null;
      return {
        id: task.id,
        title: task.title,
        clientName: task.client_name || 'Sin cliente',
        status: task.status,
        dueLabel: formatDueLabel(task.due_date),
        daysLeft,
        urgency: getTaskUrgency(task, today, nextWeekEnd),
      };
    });

  const projectPipeline = [...activeProjects]
    .sort((a, b) => {
      const aDate = parseDate(a.due_date);
      const bDate = parseDate(b.due_date);
      if (!aDate && !bDate) return 0;
      if (!aDate) return 1;
      if (!bDate) return -1;
      return aDate.getTime() - bDate.getTime();
    })
    .slice(0, 8)
    .map((project) => ({
      id: project.id,
      title: project.title,
      clientName: project.client_name || 'Sin cliente',
      status: project.status,
      dueLabel: formatDueLabel(project.due_date),
      isCollaborative: Boolean(project.is_collaborative),
      urgency: getProjectUrgency(project, today, nextWeekEnd),
    }));

  const clientMomentum = [...typedClients]
    .map((client) => {
      const relatedOpenTasks = openTasks.filter((task) => task.client_name === client.name).length;
      const relatedProjects = activeProjects.filter((project) => project.client_name === client.name).length;
      const relatedUpcoming = openTasks.filter((task) => task.client_name === client.name).filter((task) => {
        const dueDate = parseDate(task.due_date);
        return dueDate ? dueDate <= nextWeekEnd : false;
      }).length;
      return {
        id: client.id,
        name: client.name,
        openTasks: relatedOpenTasks,
        openProjects: relatedProjects,
        upcomingItems: relatedUpcoming,
        status: client.status,
      };
    })
    .sort((a, b) => b.upcomingItems - a.upcomingItems || b.openTasks + b.openProjects - (a.openTasks + a.openProjects))
    .slice(0, 6);

  const recommendations: string[] = [];
  if (overdueOpenTasks > 0) recommendations.push(`Hay ${overdueOpenTasks} tareas vencidas abiertas. Conviene resolverlas antes de abrir nuevas prioridades.`);
  if (departmentCapacity[0]?.state === 'high') recommendations.push(`El departamento ${departmentCapacity[0].name} está con presión alta para los próximos 14 días.`);
  if (openTasks.filter((task) => !task.due_date).length > 0) recommendations.push('Existen tareas sin fecha. Asignar fechas mejora mucho la lectura de capacidad.');
  if (clientMomentum[0]?.upcomingItems) recommendations.push(`El cliente ${clientMomentum[0].name} concentra más entregables próximos; vale la pena revisar su frente primero.`);
  if (!recommendations.length) recommendations.push('La planificación viene balanceada. Puedes usar esta vista para sostener el ritmo semanal sin sobrecargar al equipo.');

  return {
    kpis: {
      dueThisWeek,
      dueNextWeek,
      overdueOpenTasks,
      activeProjects: activeProjects.length,
      collaborativeProjects: activeProjects.filter((project) => project.is_collaborative).length,
      activeClients: typedClients.length,
    },
    dueBuckets,
    departmentCapacity,
    weeklyFocus,
    projectPipeline,
    clientMomentum,
    recommendations,
  };
}
