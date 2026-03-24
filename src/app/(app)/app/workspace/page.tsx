import Link from 'next/link';
import { ArrowRight, FolderKanban, LayoutGrid, ListChecks, Plus } from 'lucide-react';
import { TaskWorkspace } from '@/components/tasks/task-workspace';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { SectionHeader } from '@/components/ui/section-header';
import { WorkspaceQuickActions } from '@/components/workspace/quick-actions';
import { getClientDashboardItems } from '@/lib/queries/clients';
import { getDashboardData } from '@/lib/queries/dashboard';
import { getProjects } from '@/lib/queries/projects';

type ProjectRow = Awaited<ReturnType<typeof getProjects>>[number];
import { getTasks } from '@/lib/queries/tasks';
import { getWorkspaceIntelligenceSummary } from '@/lib/queries/workspace-intelligence';
import { projectDetailRoute, projectNewRoute, taskNewRoute } from '@/lib/navigation/routes';

function metricTone(value: number, type: 'danger' | 'attention' | 'neutral' = 'neutral') {
  if (type === 'danger') return value > 0 ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-100' : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100';
  if (type === 'attention') return value > 0 ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-100' : 'bg-slate-100 text-slate-700 ring-1 ring-slate-200';
  return 'bg-slate-100 text-slate-700 ring-1 ring-slate-200';
}

function formatDueDate(value?: string | null) {
  if (!value) return 'Sin fecha';
  try {
    return new Intl.DateTimeFormat('es-CR', { day: '2-digit', month: 'short' }).format(new Date(value));
  } catch {
    return 'Sin fecha';
  }
}

export default async function WorkspacePage() {
  const [data, tasks, projects, clientItems, intelligenceSummary] = await Promise.all([
    getDashboardData(),
    getTasks({}),
    getProjects({}),
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
    { label: 'Atrasadas', value: data.overdueTasks ?? 0, tone: 'danger' as const },
    { label: 'Para hoy', value: data.dueSoonTasks ?? 0, tone: 'attention' as const },
    { label: 'Activos', value: data.activeProjects ?? 0, tone: 'neutral' as const },
    { label: 'Bloqueadas', value: data.waitingTasks ?? 0, tone: 'attention' as const },
  ];

  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="Workspace"
        title="Tu espacio de trabajo"
        description="Entra, mira la pizarra y actúa sin perder tiempo."
        icon={<LayoutGrid className="h-5 w-5" />}
        actions={
          <>
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

      <Card className="bg-[linear-gradient(135deg,#052e16_0%,#0f172a_58%,#0f172a_100%)] text-white shadow-[0_24px_60px_rgba(15,23,42,0.25)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">Vista principal</p>
            <h2 className="mt-2 text-3xl font-bold">Empieza por lo importante</h2>
            <p className="mt-2 text-sm text-slate-300">Tu trabajo diario vive aquí. Crea, mueve y retoma sin saltar entre pantallas.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[26px] bg-white/10 px-4 py-3 ring-1 ring-white/10">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Tareas hoy</p>
              <p className="mt-2 text-3xl font-bold">{data.dueSoonTasks ?? 0}</p>
            </div>
            <div className="rounded-[26px] bg-white/10 px-4 py-3 ring-1 ring-white/10">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Proyectos activos</p>
              <p className="mt-2 text-3xl font-bold">{data.activeProjects ?? 0}</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          {boardTasks.length ? (
            <TaskWorkspace tasks={boardTasks} filters={{ view: 'kanban' }} />
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
        </div>

        <div className="space-y-4">
          <WorkspaceQuickActions />

          <Card>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Foco del día</p>
                <h3 className="mt-2 text-xl font-bold text-slate-900">Qué atender ahora</h3>
              </div>
              <Link href="/app/intelligence" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900">
                Ver insights <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {focus.map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${metricTone(item.value, item.tone)}`}>{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
            {intelligenceSummary?.recommendations?.[0] ? (
              <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                {intelligenceSummary.recommendations[0]}
              </div>
            ) : null}
          </Card>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
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
              <Link key={project.id} href={projectDetailRoute(project.id)} className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-emerald-200 hover:bg-emerald-50">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">{project.title}</p>
                  <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                    {project.status ?? 'Activo'}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  {project.client_name?.trim() || 'Sin cliente'} · {formatDueDate(project.due_date)}
                </p>
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
              <div key={client.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">{client.name}</p>
                  <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">{client.openProjects} proyectos</span>
                </div>
                <p className="mt-2 text-sm text-slate-500">{client.openTasks} tareas abiertas</p>
              </div>
            )) : <p className="text-sm text-slate-500">Todavía no hay clientes con actividad.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}
