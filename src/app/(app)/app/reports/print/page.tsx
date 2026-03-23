import { getDashboardData } from "@/lib/queries/dashboard";
import { getProjects } from "@/lib/queries/projects";
import { getTasks } from "@/lib/queries/tasks";
import { getReportsOverview } from "@/lib/queries/reports";

export default async function ReportsPrintPage({
  searchParams,
}: {
  searchParams?: Promise<{ type?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const type = params.type || "summary";
  const [dashboard, projects, tasks, operations] = await Promise.all([
    getDashboardData(),
    getProjects({}),
    getTasks({}),
    getReportsOverview(),
  ]);

  return (
    <main className="mx-auto max-w-5xl bg-white p-8 text-slate-900 print:p-4">
      <header className="border-b border-slate-200 pb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">FlowTask</p>
        <h1 className="mt-2 text-3xl font-bold">Reporte {type === "projects" ? "de proyectos" : "general"}</h1>
        <p className="mt-2 text-sm text-slate-500">Generado para impresión o guardado como PDF.</p>
      </header>

      {type === "operations" ? (
        <div className="mt-6 space-y-6">
          <section className="grid gap-4 md:grid-cols-4">
            {[
              ["Tareas activas", operations.kpis.activeTasks],
              ["Vencidas", operations.kpis.overdueTasks],
              ["Para hoy", operations.kpis.dueToday],
              ["Clientes activos", operations.kpis.clients],
            ].map(([label, value]) => (
              <div key={String(label)} className="rounded-2xl border border-slate-200 p-4">
                <p className="text-sm text-slate-500">{label}</p>
                <p className="mt-2 text-3xl font-bold">{String(value)}</p>
              </div>
            ))}
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

          <section>
            <h2 className="text-xl font-semibold">Tareas foco</h2>
            <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Tarea</th>
                    <th className="px-4 py-3">Cliente</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3">Urgencia</th>
                  </tr>
                </thead>
                <tbody>
                  {operations.focusTasks.map((task) => (
                    <tr key={task.id} className="border-t border-slate-200">
                      <td className="px-4 py-3">{task.title}</td>
                      <td className="px-4 py-3">{task.clientName}</td>
                      <td className="px-4 py-3">{task.status}</td>
                      <td className="px-4 py-3">{task.dueLabel}</td>
                      <td className="px-4 py-3">{task.urgency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      ) : type === "projects" ? (
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
                {projects.map((project: any) => (
                  <tr key={project.id} className="border-t border-slate-200">
                    <td className="px-4 py-3">{project.title}</td>
                    <td className="px-4 py-3">{project.client_name || "-"}</td>
                    <td className="px-4 py-3">{project.status}</td>
                    <td className="px-4 py-3">{project.due_date || "-"}</td>
                    <td className="px-4 py-3">{project.is_collaborative ? "Colaborativo" : "Personal"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <div className="mt-6 space-y-6">
          <section className="grid gap-4 md:grid-cols-4">
            {[
              ["Tareas activas", dashboard?.activeTasks ?? 0],
              ["Proyectos activos", dashboard?.activeProjects ?? 0],
              ["Tareas concluidas", dashboard?.completedTasks ?? 0],
              ["Proyectos colaborativos", dashboard?.collaborativeProjects ?? 0],
            ].map(([label, value]) => (
              <div key={String(label)} className="rounded-2xl border border-slate-200 p-4">
                <p className="text-sm text-slate-500">{label}</p>
                <p className="mt-2 text-3xl font-bold">{String(value)}</p>
              </div>
            ))}
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
                  {(dashboard?.clientMetrics ?? []).map((item: any) => (
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
                  {tasks.slice(0, 12).map((task: any) => (
                    <tr key={task.id} className="border-t border-slate-200">
                      <td className="px-4 py-3">{task.title}</td>
                      <td className="px-4 py-3">{task.client_name || "-"}</td>
                      <td className="px-4 py-3">{task.status}</td>
                      <td className="px-4 py-3">{task.due_date || "-"}</td>
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
