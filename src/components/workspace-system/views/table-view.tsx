import type { WorkspaceTaskItem } from "@/lib/workspace-system/view-state";
import { PriorityBadge, StatusBadge } from "../workspace-badges";

export function TableView({ tasks }: { tasks: WorkspaceTaskItem[] }) {
  return (
    <section className="rounded-[26px] border border-[var(--ft-workspace-border)] bg-white p-5 shadow-[var(--ft-workspace-shadow)] ft-ws-view">
      <header className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div><h2 className="text-xl font-extrabold">Tabla operativa</h2><p className="text-sm text-slate-500">Edita tareas y registros sin salir del proyecto.</p></div>
        <button className="ft-ws-control h-10 px-4 text-sm font-bold">+ Nueva fila</button>
      </header>
      <div className="overflow-x-auto rounded-[18px] border border-[var(--ft-workspace-border)]">
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead className="bg-slate-50 text-left text-xs font-extrabold uppercase tracking-[.12em] text-slate-500">
            <tr><th className="p-3">Tarea</th><th>Estado</th><th>Responsable</th><th>Prioridad</th><th>Fecha límite</th><th>Progreso</th></tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id} className="border-t border-[var(--ft-workspace-border)] hover:bg-slate-50">
                <td className="p-3 font-bold text-slate-950">{task.title}</td>
                <td><StatusBadge status={task.status} /></td>
                <td className="font-semibold text-slate-500">{task.assigneeName ?? "Sin asignar"}</td>
                <td><PriorityBadge priority={task.priority} /></td>
                <td className={task.dueDate ? "font-bold text-rose-500" : "font-bold text-slate-400"}>{task.dueDate ?? "-"}</td>
                <td><span className="block h-2 w-24 rounded-full bg-slate-100"><span className="block h-full w-1/2 rounded-full bg-emerald-400" /></span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
