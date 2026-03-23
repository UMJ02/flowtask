import { getDashboardData } from '@/lib/queries/dashboard';
import { getProjects } from '@/lib/queries/projects';
import { getReportsOverview } from '@/lib/queries/reports';
import { getTasks } from '@/lib/queries/tasks';
import { getPlanningOverview } from '@/lib/queries/planning';
import { getControlTowerSummary } from '@/lib/queries/control-tower';
import { getRiskRadarSummary } from '@/lib/queries/risk-radar';
import { getWorkspaceIntelligenceSummary } from '@/lib/queries/workspace-intelligence';
import { getExecutionCenterSummary } from '@/lib/queries/execution-center';
import { getWorkspaceOperatingSystemSummary } from '@/lib/queries/workspace-operating-system';

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
      <p className="mt-2 text-3xl font-bold text-slate-900">{String(value)}</p>
    </div>
  );
}

function DataTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: Array<Array<string | number>>;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-4 py-3">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? rows.map((row, index) => (
            <tr key={index} className="border-t border-slate-200">
              {row.map((value, cellIndex) => (
                <td key={`${index}-${cellIndex}`} className="px-4 py-3">{String(value)}</td>
              ))}
            </tr>
          )) : (
            <tr className="border-t border-slate-200">
              <td className="px-4 py-6 text-slate-500" colSpan={headers.length}>Sin datos disponibles para este reporte.</td>
            </tr>
          )}
        </tbody>
      </table>
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

  const [dashboard, projects, tasks, operations, planning, controlTower, risk, intelligence, execution, workspaceOs] = await Promise.all([
    getDashboardData(),
    getProjects({}),
    getTasks({}),
    getReportsOverview(),
    getPlanningOverview(),
    getControlTowerSummary(),
    getRiskRadarSummary(),
    getWorkspaceIntelligenceSummary(),
    getExecutionCenterSummary(),
    getWorkspaceOperatingSystemSummary(),
  ]);

  const heading = {
    summary: 'Reporte general',
    projects: 'Reporte de proyectos',
    operations: 'Reporte operativo',
    executive: 'Reporte ejecutivo',
    planning: 'Reporte de planificación',
    control: 'Reporte control tower',
    risk: 'Reporte risk radar',
    intelligence: 'Reporte workspace intelligence',
    execution: 'Reporte execution center',
    os: 'Reporte workspace OS',
  }[type] || 'Reporte general';

  return (
    <main className="mx-auto max-w-5xl bg-white p-8 text-slate-900 print:p-4">
      <header className="border-b border-slate-200 pb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">FlowTask</p>
        <h1 className="mt-2 text-3xl font-bold">{heading}</h1>
        <p className="mt-2 text-sm text-slate-500">Generado para impresión o guardado como PDF.</p>
      </header>

      {type === 'execution' ? (
        <div className="mt-6 space-y-6">
          <section className="grid gap-4 md:grid-cols-4">
            <MetricCard label="Execution score" value={`${execution.kpis.executionScore}%`} />
            <MetricCard label="Do now" value={execution.kpis.doNow} />
            <MetricCard label="Unblock" value={execution.kpis.unblock} />
            <MetricCard label="Monitor" value={execution.kpis.monitor} />
          </section>
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Frentes de ejecución</h2>
            <DataTable
              headers={['Fuente', 'Frente', 'Detalle', 'Estado']}
              rows={[
                ...execution.doNow.map((item) => [item.source, item.title, item.detail, item.tone]),
                ...execution.unblock.map((item) => [item.source, item.title, item.detail, item.tone]),
                ...execution.monitor.map((item) => [item.source, item.title, item.detail, item.tone]),
              ]}
            />
          </section>
        </div>
      ) : type === 'os' ? (
        <div className="mt-6 space-y-6">
          <section className="grid gap-4 md:grid-cols-4">
            <MetricCard label="Operating score" value={`${workspaceOs?.kpis.operatingScore ?? 0}%`} />
            <MetricCard label="Readiness" value={`${workspaceOs?.kpis.readinessScore ?? 0}%`} />
            <MetricCard label="Execution" value={`${workspaceOs?.kpis.executionScore ?? 0}%`} />
            <MetricCard label="Risk" value={`${workspaceOs?.kpis.riskScore ?? 0}%`} />
          </section>
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Carriles del sistema</h2>
            <DataTable
              headers={['Carril', 'Valor', 'Detalle', 'Estado']}
              rows={(workspaceOs?.operatingLanes ?? []).map((item) => [item.label, item.value, item.detail, item.tone])}
            />
          </section>
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Prioridades cruzadas</h2>
            <DataTable
              headers={['Fuente', 'Prioridad', 'Detalle', 'Estado']}
              rows={(workspaceOs?.priorities ?? []).map((item) => [item.source, item.title, item.detail, item.tone])}
            />
          </section>
        </div>
      ) : type === 'risk' ? (
        <div className="mt-6 space-y-6">
          <section className="grid gap-4 md:grid-cols-4">
            <MetricCard label="Risk score" value={`${risk.kpis.riskScore}%`} />
            <MetricCard label="Tareas vencidas" value={risk.kpis.overdueTasks} />
            <MetricCard label="Proyectos vencidos" value={risk.kpis.overdueProjects} />
            <MetricCard label="Clientes en presión" value={risk.kpis.pressuredClients} />
          </section>
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Hotspots por departamento</h2>
            <DataTable
              headers={['Departamento', 'Tareas abiertas', 'Proyectos activos', 'Items cercanos', 'Estado']}
              rows={risk.hotspots.map((item) => [item.name, item.openTasks, item.activeProjects, item.nearTermItems, item.tone])}
            />
          </section>
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Clientes con presión</h2>
            <DataTable
              headers={['Cliente', 'Estado', 'Tareas', 'Proyectos', 'Presión']}
              rows={risk.clientRisks.map((item) => [item.name, item.status, item.openTasks, item.activeProjects, item.pressure])}
            />
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
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Foco inmediato</h2>
            <DataTable
              headers={['Tipo', 'Elemento', 'Cliente', 'Estado', 'Fecha']}
              rows={controlTower.focusNow.map((item) => [item.type, item.title, item.clientName, item.status, item.dueLabel])}
            />
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
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Capacidad por departamento</h2>
            <DataTable
              headers={['Departamento', 'Items cercanos', 'Tareas abiertas', 'Proyectos activos', 'Estado']}
              rows={planning.departmentCapacity.map((item) => [item.name, item.nearTermItems, item.openTasks, item.activeProjects, item.state])}
            />
          </section>
        </div>
      ) : type === 'intelligence' ? (
        <div className="mt-6 space-y-6">
          <section className="grid gap-4 md:grid-cols-4">
            <MetricCard label="Intelligence score" value={`${intelligence.kpis.intelligenceScore}%`} />
            <MetricCard label="Readiness" value={`${intelligence.kpis.readinessScore}%`} />
            <MetricCard label="Risk score" value={`${intelligence.kpis.riskScore}%`} />
            <MetricCard label="Ritmo de cierre" value={`${intelligence.kpis.completionRate}%`} />
          </section>
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Prioridades cruzadas</h2>
            <DataTable
              headers={['Fuente', 'Prioridad', 'Detalle', 'Estado']}
              rows={intelligence.crossModulePriorities.map((item) => [item.source, item.title, item.detail, item.tone])}
            />
          </section>
        </div>
      ) : type === 'operations' ? (
        <div className="mt-6 space-y-6">
          <section className="grid gap-4 md:grid-cols-4">
            <MetricCard label="Tareas activas" value={operations.kpis.activeTasks} />
            <MetricCard label="Tareas vencidas" value={operations.kpis.overdueTasks} />
            <MetricCard label="Para hoy" value={operations.kpis.dueToday} />
            <MetricCard label="Clientes activos" value={operations.kpis.clients} />
          </section>
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Radar de atención</h2>
            <DataTable
              headers={['Elemento', 'Cliente', 'Estado', 'Fecha']}
              rows={operations.focusTasks.map((item) => [item.title, item.clientName, item.status, item.dueLabel])}
            />
          </section>
        </div>
      ) : type === 'executive' ? (
        <div className="mt-6 space-y-6">
          <section className="grid gap-4 md:grid-cols-4">
            <MetricCard label="Tareas activas" value={operations.kpis.activeTasks} />
            <MetricCard label="Semana actual" value={operations.kpis.dueThisWeek} />
            <MetricCard label="En espera" value={operations.kpis.waitingTasks} />
            <MetricCard label="Proyectos vencidos" value={operations.kpis.overdueProjects} />
          </section>
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Capacidad por departamento</h2>
            <DataTable
              headers={['Departamento', 'Tareas', 'Proyectos', 'Items cercanos', 'Score']}
              rows={operations.departmentLoad.map((item) => [item.name, item.openTasks, item.activeProjects, item.nearTermItems, item.score])}
            />
          </section>
        </div>
      ) : type === 'projects' ? (
        <section className="mt-6 space-y-3">
          <h2 className="text-xl font-semibold">Proyectos</h2>
          <DataTable
            headers={['Proyecto', 'Cliente', 'Estado', 'Deadline', 'Modo']}
            rows={projects.map((project: ProjectRow) => [project.title, project.client_name || '-', project.status, project.due_date || '-', project.is_collaborative ? 'Colaborativo' : 'Personal'])}
          />
        </section>
      ) : (
        <div className="mt-6 space-y-6">
          <section className="grid gap-4 md:grid-cols-4">
            <MetricCard label="Tareas activas" value={dashboard?.activeTasks ?? 0} />
            <MetricCard label="Proyectos activos" value={dashboard?.activeProjects ?? 0} />
            <MetricCard label="Tareas concluidas" value={dashboard?.completedTasks ?? 0} />
            <MetricCard label="Proyectos colaborativos" value={dashboard?.collaborativeProjects ?? 0} />
          </section>
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Clientes con más carga</h2>
            <DataTable
              headers={['Cliente', 'Total', 'Tareas', 'Proyectos', 'Completados']}
              rows={(dashboard?.clientMetrics ?? []).map((item: ClientMetricRow) => [item.name, item.total, item.tasks ?? 0, item.projects ?? 0, item.completed ?? 0])}
            />
          </section>
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Tareas recientes</h2>
            <DataTable
              headers={['Tarea', 'Cliente', 'Estado', 'Deadline']}
              rows={tasks.slice(0, 12).map((task: TaskRow) => [task.title, task.client_name || '-', task.status, task.due_date || '-'])}
            />
          </section>
        </div>
      )}
    </main>
  );
}
