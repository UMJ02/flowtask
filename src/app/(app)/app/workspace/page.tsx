import Link from 'next/link';
import { ArrowRight, BrainCircuit, FolderKanban, LayoutGrid, ListChecks, Plus } from 'lucide-react';
import { TaskWorkspace } from '@/components/tasks/task-workspace';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { SectionHeader } from '@/components/ui/section-header';
import { getRecentActivitySummary } from '@/lib/queries/activity';
import { getClientDashboardItems } from '@/lib/queries/clients';
import { getDashboardData } from '@/lib/queries/dashboard';
import { getProjects } from '@/lib/queries/projects';
import { getTasks } from '@/lib/queries/tasks';
import { getWorkspaceIntelligenceSummary } from '@/lib/queries/workspace-intelligence';
import { projectDetailRoute, projectNewRoute, taskNewRoute } from '@/lib/navigation/routes';

function metricTone(value: number, type: 'danger' | 'attention' | 'neutral' = 'neutral') {
  if (type === 'danger') return value > 0 ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-100' : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100';
  if (type === 'attention') return value > 0 ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-100' : 'bg-slate-100 text-slate-700 ring-1 ring-slate-200';
  return 'bg-slate-100 text-slate-700 ring-1 ring-slate-200';
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
        title="No pudimos abrir tu workspace"
        description="Falta el contexto del espacio de trabajo. Revisa tu sesión e inténtalo otra vez."
        action={
          <Link href="/login">
            <Button>Ir al acceso</Button>
          </Link>
        }
      />
    );
  }

  const topProjects = projects.slice(0, 4);
  const topClients = clientItems.slice(0, 4);
  const focus = [
    { label: 'Atrasadas', value: data.overdueTasks ?? 0, tone: 'danger' as const },
    { label: 'Para hoy', value: data.dueSoonTasks ?? 0, tone: 'attention' as const },
    { label: 'Proyectos activos', value: data.activeProjects ?? 0, tone: 'neutral' as const },
    { label: 'Bloqueadas', value: data.waitingTasks ?? 0, tone: 'attention' as const },
  ];

  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="Workspace"
        title="Tu tablero"
        description="Entra, mira lo importante y trabaja. Aquí están tu pizarra, acciones rápidas y el pulso más útil del día."
        icon={<LayoutGrid className="h-5 w-5" />}
        actions={
          <>
            <Link href={taskNewRoute()}>
              <Button>
                <Plus className="h-4 w-4" /> Nueva tarea
              </Button>
            </Link>
            <Link href={projectNewRoute()}>
              <Button variant="secondary">
                <FolderKanban className="h-4 w-4" /> Nuevo proyecto
              </Button>
            </Link>
          </>
        }
      />

      <Card className="bg-[linear-gradient(135deg,#052e16_0%,#0f172a_58%,#0f172a_100%)] text-white shadow-[0_24px_60px_rgba(15,23,42,0.25)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">Espacio principal</p>
            <h2 className="mt-2 text-3xl font-bold">Haz lo importante primero</h2>
            <p className="mt-2 text-sm text-slate-300">Tu trabajo diario vive aquí. Usa la pizarra para mover tareas y las acciones rápidas para crear sin salirte del flujo.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[26px] bg-white/10 px-4 py-3 ring-1 ring-white/10">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Tareas activas</p>
              <p className="mt-2 text-3xl font-bold">{data.activeTasks ?? 0}</p>
            </div>
            <div className="rounded-[26px] bg-white/10 px-4 py-3 ring-1 ring-white/10">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Terminadas</p>
              <p className="mt-2 text-3xl font-bold">{data.completedTasks ?? 0}</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          {tasks.length ? (
            <TaskWorkspace tasks={tasks.slice(0, 24)} filters={{ view: 'kanban' }} />
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
          <Card>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Acciones rápidas</p>
                <h3 className="mt-2 text-xl font-bold text-slate-900">Empieza sin rodeos</h3>
                <p className="mt-1 text-sm text-slate-500">Lo más usado, sin abrir módulos extra.</p>
              </div>
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                <Plus className="h-5 w-5" />
              </span>
            </div>
            <div className="mt-5 grid gap-3">
              <Link href={taskNewRoute()} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-emerald-200 hover:bg-emerald-50">
                <p className="text-sm font-semibold text-slate-900">Nueva tarea</p>
                <p className="mt-1 text-sm text-slate-500">Agrega algo pendiente y ponlo a moverse de inmediato.</p>
              </Link>
              <Link href={projectNewRoute()} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-emerald-200 hover:bg-emerald-50">
                <p className="text-sm font-semibold text-slate-900">Nuevo proyecto</p>
                <p className="mt-1 text-sm text-slate-500">Crea una base nueva con equipo, fechas y cliente.</p>
              </Link>
              <Link href="/app/intelligence" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-emerald-200 hover:bg-emerald-50">
                <p className="text-sm font-semibold text-slate-900">Ver intelligence</p>
                <p className="mt-1 text-sm text-slate-500">Lee riesgos, capacidad y foco desde una sola vista.</p>
              </Link>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Foco de hoy</p>
                <h3 className="mt-2 text-xl font-bold text-slate-900">Lo que más importa</h3>
              </div>
              <Link href="/app/intelligence" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900">
                Ver más <ArrowRight className="h-4 w-4" />
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

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Proyectos</p>
              <h3 className="mt-2 text-xl font-bold text-slate-900">Sigue el avance</h3>
            </div>
            <Link href="/app/projects" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900">
              Ver todos <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-5 grid gap-3">
            {topProjects.length ? topProjects.map((project) => (
              <Link key={project.id} href={projectDetailRoute(project.id)} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-emerald-200 hover:bg-emerald-50">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{project.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{project.client_name || 'Sin cliente'}</p>
                  </div>
                  <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">{project.status}</span>
                </div>
              </Link>
            )) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">Aún no hay proyectos activos.</div>
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Clientes</p>
              <h3 className="mt-2 text-xl font-bold text-slate-900">Dónde está la carga</h3>
            </div>
            <Link href="/app/clients" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900">
              Ver todos <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-5 grid gap-3">
            {topClients.length ? topClients.map((client) => (
              <div key={client.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{client.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{client.openProjects} proyecto(s) · {client.openTasks} tarea(s)</p>
                  </div>
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${metricTone(client.overdueTasks, 'danger')}`}>{client.overdueTasks} vencida(s)</span>
                </div>
              </div>
            )) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">Aún no hay clientes con movimiento reciente.</div>
            )}
          </div>
        </Card>
      </div>

      <RecentActivity summary={activitySummary} />

      <Card>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Abajo del tablero</p>
            <h3 className="mt-2 text-xl font-bold text-slate-900">Métricas que sí ayudan</h3>
            <p className="mt-1 text-sm text-slate-500">Pocas, claras y listas para decidir rápido.</p>
          </div>
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
            <BrainCircuit className="h-5 w-5" />
          </span>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-5">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"><p className="text-xs uppercase tracking-[0.16em] text-slate-500">Tareas hoy</p><p className="mt-2 text-2xl font-bold text-slate-900">{data.dueSoonTasks ?? 0}</p></div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"><p className="text-xs uppercase tracking-[0.16em] text-slate-500">Bloqueos</p><p className="mt-2 text-2xl font-bold text-slate-900">{data.waitingTasks ?? 0}</p></div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"><p className="text-xs uppercase tracking-[0.16em] text-slate-500">Proyectos activos</p><p className="mt-2 text-2xl font-bold text-slate-900">{data.activeProjects ?? 0}</p></div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"><p className="text-xs uppercase tracking-[0.16em] text-slate-500">Clientes activos</p><p className="mt-2 text-2xl font-bold text-slate-900">{clientItems.length}</p></div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"><p className="text-xs uppercase tracking-[0.16em] text-slate-500">En equipo</p><p className="mt-2 text-2xl font-bold text-slate-900">{data.collaborativeProjects ?? 0}</p></div>
        </div>
      </Card>
    </div>
  );
}
