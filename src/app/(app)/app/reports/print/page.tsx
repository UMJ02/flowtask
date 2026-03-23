import { getDashboardData } from '@/lib/queries/dashboard';
import { getProjects } from '@/lib/queries/projects';
import { getReportsOverview } from '@/lib/queries/reports';
import { getTasks } from '@/lib/queries/tasks';
import { getPlanningOverview } from '@/lib/queries/planning';
import { getControlTowerSummary } from '@/lib/queries/control-tower';
import { getRiskRadarSummary } from '@/lib/queries/risk-radar';

type PrintPageParams = {
  type?: string;
};

type ProjectRow = Awaited<ReturnType<typeof getProjects>>[number];
type TaskRow = Awaited<ReturnType<typeof getTasks>>[number];
type ClientMetricRow = NonNullable<Awaited<ReturnType<typeof getDashboardData>>>['clientMetrics'][number];

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold">{String(value)}</p>
    </div>
  );
}

export default async function ReportsPrintPage({
  searchParams,
}: {
  searchParams?: Promise<PrintPageParams>;
}) {
  const params = (await searchParams) ?? {};
  const type = params.type || 'summary';

  const [dashboard, projects, tasks, operations, planning, controlTower, risk] = await Promise.all([
    getDashboardData(),
    getProjects({}),
    getTasks({}),
    getReportsOverview(),
    getPlanningOverview(),
    getControlTowerSummary(),
    getRiskRadarSummary(),
  ]);

  const heading =
    type === 'projects'
      ? 'Reporte de proyectos'
      : type === 'operations'
        ? 'Reporte operativo'
        : type === 'executive'
          ? 'Reporte ejecutivo'
          : type === 'planning'
            ? 'Reporte de planificación'
            : type === 'control'
              ? 'Reporte control tower'
              : type === 'risk'
                ? 'Reporte risk radar'
                : 'Reporte general';

  return (
    <main className="mx-auto max-w-5xl bg-white p-8 text-slate-900 print:p-4">
      <header className="border-b border-slate-200 pb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">FlowTask</p>
        <h1 className="mt-2 text-3xl font-bold">{heading}</h1>
        <p className="mt-2 text-sm text-slate-500">Generado para impresión o guardado como PDF.</p>
      </header>

      {type === 'risk' ? (
        <div className="mt-6 space-y-6">
          <section className="grid gap-4 md:grid-cols-4">
            <MetricCard label="Risk score" value={`${risk.kpis.riskScore}%`} />
            <MetricCard label="Tareas vencidas" value={risk.kpis.overdueTasks} />
            <MetricCard label="Proyectos vencidos" value={risk.kpis.overdueProjects} />
            <MetricCard label="Clientes en presión" value={risk.kpis.pressuredClients} />
          </section>

          <section>
            <h2 className="text-xl font-semibold">Hotspots por departamento</h2>
            <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Departamento</th>
                    <th className="px-4 py-3">Tareas abiertas</th>
                    <th className="px-4 py-3">Proyectos activos</th>
                    <th className="px-4 py-3">Items cercanos</th>
                    <th className="px-4 py-3">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {risk.hotspots.map((item) => (
                    <tr key={item.name} className="border-t border-slate-200">
                      <td className="px-4 py-3">{item.name}</td>
                      <td className="px-4 py-3">{item.openTasks}</td>
                      <td className="px-4 py-3">{item.activeProjects}</td>
                      <td className="px-4 py-3">{item.nearTermItems}</td>
                      <td className="px-4 py-3">{item.tone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Clientes con presión</h2>
            <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Cliente</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3">Tareas</th>
                    <th className="px-4 py-3">Proyectos</th>
                    <th className="px-4 py-3">Presión</th>
                  </tr>
                </thead>
                <tbody>
                  {risk.clientRisks.map((item) => (
                    <tr key={item.id} className="border-t border-slate-200">
                      <td className="px-4 py-3">{item.name}</td>
                      <td className="px-4 py-3">{item.status}</td>
                      <td className="px-4 py-3">{item.openTasks}</td>
                      <td className="px-4 py-3">{item.activeProjects}</td>
                      <td className="px-4 py-3">{item.pressure}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      ) : type === 'control' ? (
        <div className="mt-6 space-y-6">
          <section className="grid gap-4 md:grid-cols-4">
            <MetricCard label="Tareas activas" value={controlTower.kpis.activeTasks} />
            <MetricCard label="Proyectos activos" value={controlTower.kpis.activeProjects} />
            <MetricCard label="Tareas vencidas" value={controlTower.kpis.overdueTasks} />
            <MetricCard label="Señales recientes" value={controlTower.kpis.activityEvents} />
          </section>

          <section>
            <h2 className="text-xl font-semibold">Foco inmediato</h2>
            <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Tipo</th>
                    <th className="px-4 py-3">Elemento</th>
                    <th className="px-4 py-3">Cliente</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {controlTower.focusNow.map((item) => (
                    <tr key={`${item.type}-${item.id}`} className="border-t border-slate-200">
                      <td className="px-4 py-3">{item.type}</td>
                      <td className="px-4 py-3">{item.title}</td>
                      <td className="px-4 py-3">{item.clientName}</td>
                      <td className="px-4 py-3">{item.status}</td>
                      <td className="px-4 py-3">{item.dueLabel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      ) : type === 'planning' ? (
        <div className="mt-6 space-y-6">
          <section className="grid gap-4 md:grid-cols-4">
            <MetricCard label="Esta semana" value={planning.kpis.dueThisWeek} />
            <MetricCard label="Próxima semana" value={planning.kpis.dueNextWeek} />
            <MetricCard label="Tareas vencidas" value={planning.kpis.overdueOpenTasks} />
            <MetricCard label="Proyectos activos" value={planning.kpis.activeProjects} />
          </section>

          <section>
            <h2 className="text-xl font-semibold">Capacidad por departamento</h2>
            <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Departamento</th>
                    <th className="px-4 py-3">Items cercanos</th>
                    <th className="px-4 py-3">Tareas abiertas</th>
                    <th className="px-4 py-3">Proyectos activos</th>
                    <th className="px-4 py-3">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {planning.departmentCapacity.map((item) => (
                    <tr key={item.name} className="border-t border-slate-200">
                      <td className="px-4 py-3">{item.name}</td>
                      <td className="px-4 py-3">{item.nearTermItems}</td>
                      <td className="px-4 py-3">{item.openTasks}</td>
                      <td className="px-4 py-3">{item.activeProjects}</td>
                      <td className="px-4 py-3">{item.state}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      ) : type === 'executive' ? (
        <div className="mt-6 space-y-6">
          <section className="grid gap-4 md:grid-cols-4">
            <MetricCard label="Ritmo de cierre" value={`${operations.kpis.completionRate}%`} />
            <MetricCard label="Semana actual" value={operations.kpis.dueThisWeek} />
            <MetricCard label="En espera" value={operations.kpis.waitingTasks} />
            <MetricCard label="Proyectos vencidos" value={operations.kpis.overdueProjects} />
          </section>

          <section>
            <h2 className="text-xl font-semibold">Watchlist de proyectos</h2>
            <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Proyecto</th>
                    <th className="px-4 py-3">Cliente</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3">Urgencia</th>
                  </tr>
                </thead>
                <tbody>
                  {operations.projectWatchlist.map((project) => (
                    <tr key={project.id} className="border-t border-slate-200">
                      <td className="px-4 py-3">{project.title}</td>
                      <td className="px-4 py-3">{project.clientName}</td>
                      <td className="px-4 py-3">{project.status}</td>
                      <td className="px-4 py-3">{project.dueLabel}</td>
                      <td className="px-4 py-3">{project.urgency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      ) : type === 'operations' ? (
        <div className="mt-6 space-y-6">
          <section className="grid gap-4 md:grid-cols-4">
            <MetricCard label="Tareas activas" value={operations.kpis.activeTasks} />
            <MetricCard label="Vencidas" value={operations.kpis.overdueTasks} />
            <MetricCard label="Para hoy" value={operations.kpis.dueToday} />
            <MetricCard label="Clientes activos" value={operations.kpis.clients} />
          </section>

          <section>
            <h2 className="text-xl font-semibold">Clientes con más carga</h2>
            <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Cliente</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3">Tareas abiertas</th>
                    <th className="px-4 py-3">Proyectos activos</th>
                    <th className="px-4 py-3">Cerradas</th>
                  </tr>
                </thead>
                <tbody>
                  {operations.attentionClients.map((item) => (
                    <tr key={item.id} className="border-t border-slate-200">
                      <td className="px-4 py-3">{item.name}</td>
                      <td className="px-4 py-3">{item.status}</td>
                      <td className="px-4 py-3">{item.openTasks}</td>
                      <td className="px-4 py-3">{item.openProjects}</td>
                      <td className="px-4 py-3">{item.completedTasks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      ) : type === 'projects' ? (
        <section className="mt-6 space-y-3">
          <h2 className="text-xl font-semibold">Proyectos</h2>
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3">Proyecto</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Deadline</th>
                  <th className="px-4 py-3">Modo</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project: ProjectRow) => (
                  <tr key={project.id} className="border-t border-slate-200">
                    <td className="px-4 py-3">{project.title}</td>
                    <td className="px-4 py-3">{project.client_name || '-'}</td>
                    <td className="px-4 py-3">{project.status}</td>
                    <td className="px-4 py-3">{project.due_date || '-'}</td>
                    <td className="px-4 py-3">{project.is_collaborative ? 'Colaborativo' : 'Personal'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <div className="mt-6 space-y-6">
          <section className="grid gap-4 md:grid-cols-4">
            <MetricCard label="Tareas activas" value={dashboard?.activeTasks ?? 0} />
            <MetricCard label="Proyectos activos" value={dashboard?.activeProjects ?? 0} />
            <MetricCard label="Tareas concluidas" value={dashboard?.completedTasks ?? 0} />
            <MetricCard label="Proyectos colaborativos" value={dashboard?.collaborativeProjects ?? 0} />
          </section>

          <section>
            <h2 className="text-xl font-semibold">Clientes con más carga</h2>
            <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Cliente</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Tareas</th>
                    <th className="px-4 py-3">Proyectos</th>
                    <th className="px-4 py-3">Completados</th>
                  </tr>
                </thead>
                <tbody>
                  {(dashboard?.clientMetrics ?? []).map((item: ClientMetricRow) => (
                    <tr key={item.name} className="border-t border-slate-200">
                      <td className="px-4 py-3">{item.name}</td>
                      <td className="px-4 py-3">{item.total}</td>
                      <td className="px-4 py-3">{item.tasks}</td>
                      <td className="px-4 py-3">{item.projects}</td>
                      <td className="px-4 py-3">{item.completed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Tareas recientes</h2>
            <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Tarea</th>
                    <th className="px-4 py-3">Cliente</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3">Deadline</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.slice(0, 12).map((task: TaskRow) => (
                    <tr key={task.id} className="border-t border-slate-200">
                      <td className="px-4 py-3">{task.title}</td>
                      <td className="px-4 py-3">{task.client_name || '-'}</td>
                      <td className="px-4 py-3">{task.status}</td>
                      <td className="px-4 py-3">{task.due_date || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
