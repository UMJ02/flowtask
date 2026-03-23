import { format, isToday, parseISO, startOfToday } from 'date-fns';
import { getRecentActivitySummary } from '@/lib/queries/activity';
import { getClients } from '@/lib/queries/clients';
import { getProjects } from '@/lib/queries/projects';
import { getTasks } from '@/lib/queries/tasks';

export type ReportsOverview = {
  kpis: {
    activeTasks: number;
    overdueTasks: number;
    dueToday: number;
    activeProjects: number;
    clients: number;
    completionRate: number;
  };
  taskStatus: Array<{ label: string; value: string; count: number }>;
  projectStatus: Array<{ label: string; value: string; count: number }>;
  attentionClients: Array<{
    id: string;
    name: string;
    openTasks: number;
    openProjects: number;
    completedTasks: number;
    status: string;
  }>;
  focusTasks: Array<{
    id: string;
    title: string;
    dueLabel: string;
    clientName: string;
    status: string;
    urgency: 'overdue' | 'today' | 'planned';
  }>;
  activity: Awaited<ReturnType<typeof getRecentActivitySummary>>;
};

function toLabel(value?: string | null) {
  if (!value) return 'Sin estado';
  return value.replaceAll('_', ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function countByStatus(items: Array<{ status?: string | null }>) {
  const map = new Map<string, number>();
  for (const item of items) {
    const key = item.status?.trim() || 'sin_estado';
    map.set(key, (map.get(key) ?? 0) + 1);
  }

  return Array.from(map.entries())
    .map(([value, count]) => ({ value, count, label: toLabel(value) }))
    .sort((a, b) => b.count - a.count);
}

export async function getReportsOverview(): Promise<ReportsOverview> {
  const [tasks, projects, clients, activity] = await Promise.all([
    getTasks({}),
    getProjects({}),
    getClients(),
    getRecentActivitySummary(24),
  ]);

  const today = startOfToday();
  const activeTasks = tasks.filter((task) => task.status !== 'concluido');
  const overdueTasks = activeTasks.filter((task) => {
    if (!task.due_date) return false;
    try {
      return parseISO(task.due_date) < today;
    } catch {
      return false;
    }
  });
  const dueToday = activeTasks.filter((task) => {
    if (!task.due_date) return false;
    try {
      return isToday(parseISO(task.due_date));
    } catch {
      return false;
    }
  });

  const completionRate = tasks.length ? Math.round((tasks.filter((task) => task.status === 'concluido').length / tasks.length) * 100) : 0;

  const focusTasks = [...activeTasks]
    .sort((a, b) => {
      if (!a.due_date && !b.due_date) return 0;
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return a.due_date.localeCompare(b.due_date);
    })
    .slice(0, 6)
    .map((task) => {
      let urgency: 'overdue' | 'today' | 'planned' = 'planned';
      let dueLabel = 'Sin fecha';
      if (task.due_date) {
        try {
          const dueDate = parseISO(task.due_date);
          dueLabel = format(dueDate, 'dd/MM/yyyy');
          if (dueDate < today) urgency = 'overdue';
          else if (isToday(dueDate)) urgency = 'today';
        } catch {
          dueLabel = task.due_date;
        }
      }
      return {
        id: task.id,
        title: task.title,
        dueLabel,
        clientName: task.client_name || 'Sin cliente',
        status: task.status,
        urgency,
      };
    });

  const attentionClients = [...clients]
    .sort((a, b) => (b.openTasksCount + b.projectsCount) - (a.openTasksCount + a.projectsCount))
    .slice(0, 5)
    .map((client) => ({
      id: client.id,
      name: client.name,
      openTasks: client.openTasksCount,
      openProjects: client.projectsCount,
      completedTasks: client.completedTasksCount,
      status: client.status,
    }));

  return {
    kpis: {
      activeTasks: activeTasks.length,
      overdueTasks: overdueTasks.length,
      dueToday: dueToday.length,
      activeProjects: projects.filter((project) => project.status !== 'completado').length,
      clients: clients.length,
      completionRate,
    },
    taskStatus: countByStatus(tasks),
    projectStatus: countByStatus(projects),
    attentionClients,
    focusTasks,
    activity,
  };
}
