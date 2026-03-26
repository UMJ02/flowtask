import Link from 'next/link';
import { FolderKanban, LayoutGrid, ListChecks, PanelTop, Plus } from 'lucide-react';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { TaskWorkspace } from '@/components/tasks/task-workspace';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { SectionHeader } from '@/components/ui/section-header';
import { WorkspaceQuickActions } from '@/components/workspace/quick-actions';
import { FocusDrawer } from '@/components/workspace/focus-drawer';
import { getRecentActivitySummary } from '@/lib/queries/activity';
import { getClientDashboardItems } from '@/lib/queries/clients';
import { getDashboardData } from '@/lib/queries/dashboard';
import { getProjects } from '@/lib/queries/projects';
import { getTasks } from '@/lib/queries/tasks';
import { getWorkspaceIntelligenceSummary } from '@/lib/queries/workspace-intelligence';
import { projectDetailRoute, projectNewRoute, taskNewRoute } from '@/lib/navigation/routes';

type ProjectRow = Awaited<ReturnType<typeof getProjects>>[number];


function formatDueDate(value?: string | null) {
  if (!value) return 'Sin fecha';
  try {
    return new Intl.DateTimeFormat('es-CR', { day: '2-digit', month: 'short' }).format(new Date(value));
  } catch {
    return 'Sin fecha';
  }
}

export default async function WorkspacePage() {
  const [data, tasks, projects, activitySummary, clientItems, intelligenceSummary] = await Promise.all([
    getDashboardData(),
    getTasks({}),
    getProjects({}),
    getRecentActivitySummary(8),
    getClientDashboardItems(),
    getWorkspaceIntelligenceSummary(),
  ]);

  if (!data) {
    return (
      <ErrorState
        title="No pudimos abrir el workspace"
        description="Falta el contexto del espacio de trabajo. Revisa tu sesión e inténtalo otra vez."
        action={
          <Link href="/login">
            <Button>Ir al acceso</Button>
          </Link>
        }
      />
    );
  }

  const boardTasks = tasks.slice(0, 24);
  const topProjects = projects.slice(0, 4);
  const topClients = clientItems.slice(0, 4);
  const focus = [
    { label: 'Atrasadas', value: data.overdueTasks ?? 0, tone: 'danger' as const, helper: 'requieren mover hoy' },
    { label: 'Para hoy', value: data.dueSoonTasks ?? 0, tone: 'attention' as const, helper: 'cierre del día' },
    { label: 'Activos', value: data.activeProjects ?? 0, tone: 'neutral' as const, helper: 'proyectos vigentes' },
    { label: 'Bloqueadas', value: data.waitingTasks ?? 0, tone: 'attention' as const, helper: 'necesitan destrabe' },
  ];

  const activityCounts = activitySummary?.counts;
  const topStats = [
    { label: 'Movimientos', value: activityCounts?.total ?? 0 },
    { label: 'Tareas', value: activityCounts?.tasks ?? 0 },
    { label: 'Proyectos', value: activityCounts?.projects ?? 0 },
    { label: 'Avisos', value: (activityCounts?.comments ?? 0) + (activityCounts?.reminders ?? 0) },
  ];

  return (
    <div className="page-grid">
      <SectionHeader
        eyebrow="Workspace"
        title="Tu espacio de trabajo"
        description="Retoma contexto, decide rápido y mueve trabajo sin brincar entre módulos."
        icon={<LayoutGrid className="h-5 w-5" />}
        actions={
          <>
            <Link href="/app/dashboard?view=board">
              <Button variant="secondary">
                <PanelTop className="h-4 w-4" /> Pizarra
              </Button>
            </Link>
            <Link href={taskNewRoute()}>
              <Button>
                <Plus className="h-4 w-4" /> Tarea
              </Button>
            </Link>
            <Link href={projectNewRoute()}>
              <Button variant="secondary">
                <FolderKanban className="h-4 w-4" /> Proyecto
              </Button>
            </Link>
          </>
        }
      />

      <Card className="bg-[linear-gradient(135deg,#063b2c_0%,#0f172a_58%,#0b1533_100%)] px-5 py-5 text-white shadow-[0_18px_40px_rgba(15,23,42,0.16)] md:px-6">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(760px,860px)] xl:items-center">
          <div className="max-w-[44rem]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">Vista principal</p>
            <h2 className="mt-2 max-w-xl text-[1.7rem] font-bold leading-tight tracking-tight md:text-[1.9rem]">Empieza por lo importante</h2>
            <p className="prose-balance mt-2 max-w-2xl text-sm leading-6 text-slate-300">Tu trabajo diario vive aquí. Mira prioridades, retoma actividad y ejecuta sin abrir cuatro pantallas para decidir.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:justify-self-end">
            {topStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-[2rem] border border-white/10 bg-white/10 px-4 py-4 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-sm xl:min-w-[162px] xl:px-5"
              >
                <div className="flex min-h-[122px] flex-col items-center justify-center gap-3">
                  <p className="max-w-[11ch] text-center text-[10px] font-semibold uppercase leading-[1.22] tracking-[0.05em] text-slate-300 sm:text-[10.5px] xl:max-w-[10ch] xl:text-[10.5px]">{stat.label}</p>
                  <p className="text-[1.9rem] font-bold leading-none tabular-nums text-white md:text-[2rem]">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="relative">
        {boardTasks.length ? (
          <TaskWorkspace tasks={boardTasks} />
        ) : (
          <EmptyState
            title="Todavía no hay tareas"
            description="Crea tu primera tarea y empieza a usar el tablero como centro de trabajo."
            icon={<ListChecks className="h-6 w-6" />}
            action={
              <Link href={taskNewRoute()}>
                <Button>Crear tarea</Button>
              </Link>
            }
          />
        )}

        <FocusDrawer focus={focus} recommendation={intelligenceSummary?.recommendations?.[0] ?? null} />
      </div>

      <WorkspaceQuickActions />

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Actividad reciente</p>
              <h3 className="mt-2 text-xl font-bold text-slate-900">Lo último que pasó</h3>
              <p className="mt-1 text-sm text-slate-500">Úsalo para retomar contexto sin abrir varias pantallas.</p>
            </div>
          </div>
          <div className="mt-4">
            <RecentActivity summary={activitySummary} />
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Proyectos</p>
                <h3 className="mt-2 text-xl font-bold text-slate-900">Activos ahora</h3>
              </div>
              <Link href="/app/projects" className="text-sm font-semibold text-slate-700 hover:text-slate-900">Ver todos</Link>
            </div>
            <div className="mt-4 space-y-3">
              {topProjects.length ? topProjects.map((project: ProjectRow) => (
                <Link key={project.id} href={projectDetailRoute(project.id)} className="block rounded-lg border border-slate-200 bg-slate-50/70 px-4 py-4 transition hover:border-emerald-200 hover:bg-emerald-50/70">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-sm font-semibold text-slate-900">{project.title}</p>
                      <p className="mt-2 text-sm leading-5 text-slate-500">{project.client_name?.trim() || 'Sin cliente'} · {formatDueDate(project.due_date)}</p>
                    </div>
                    <span className="inline-flex shrink-0 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                      {project.status ?? 'Activo'}
                    </span>
                  </div>
                </Link>
              )) : <p className="text-sm text-slate-500">Todavía no hay proyectos activos.</p>}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Clientes</p>
                <h3 className="mt-2 text-xl font-bold text-slate-900">Carga por cliente</h3>
              </div>
              <Link href="/app/clients" className="text-sm font-semibold text-slate-700 hover:text-slate-900">Ver todos</Link>
            </div>
            <div className="mt-4 space-y-3">
              {topClients.length ? topClients.map((client) => (
                <Link key={client.id} href={`/app/clients/${client.id}`} className="block rounded-lg border border-slate-200 bg-slate-50/70 px-4 py-4 transition hover:border-emerald-200 hover:bg-emerald-50/70">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-sm font-semibold text-slate-900">{client.name}</p>
                      <p className="mt-2 text-sm text-slate-500">{client.activeProjects} proyectos activos · {client.overdueTasksCount} vencidas</p>
                    </div>
                    <span className="inline-flex shrink-0 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">{client.openTasks} tareas</span>
                  </div>
                </Link>
              )) : <p className="text-sm text-slate-500">Todavía no hay clientes con actividad.</p>}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
