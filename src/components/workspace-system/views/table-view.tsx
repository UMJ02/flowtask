import type { WorkspaceTaskItem } from "@/lib/workspace-system/view-state";
import { WorkspaceTaskInlineEditor } from "../workspace-task-inline-actions";

export function TableView({ tasks }: { tasks: WorkspaceTaskItem[] }) {
  return (
    <section className="rounded-[26px] border border-[var(--ft-workspace-border)] bg-white p-5 shadow-[var(--ft-workspace-shadow)] ft-ws-view">
      <header className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div><h2 className="text-xl font-extrabold">Tabla operativa</h2><p className="text-sm text-slate-500">Edita estado, prioridad y fecha sin salir del workspace.</p></div>
        <span className="rounded-full bg-emerald-50 px-3 py-2 text-xs font-black uppercase tracking-[.12em] text-emerald-700">Inline real</span>
      </header>
      <div className="overflow-x-auto rounded-[18px] border border-[var(--ft-workspace-border)]">
        <table className="w-full min-w-[900px] border-collapse text-sm">
          <thead className="bg-slate-50 text-left text-xs font-extrabold uppercase tracking-[.12em] text-slate-500">
            <tr><th className="p-3">Tarea</th><th>Responsable</th><th>Proyecto</th><th>Edición rápida</th></tr>
          </thead>
          <tbody>
            {tasks.length ? tasks.map((task) => (
              <tr key={task.id} className="border-t border-[var(--ft-workspace-border)] hover:bg-slate-50">
                <td className="p-3 font-bold text-slate-950">{task.title}</td>
                <td className="font-semibold text-slate-500">{task.assigneeName ?? "Sin asignar"}</td>
                <td className="font-semibold text-slate-500">{task.projectTitle ?? "Sin proyecto"}</td>
                <td className="py-2 pr-3"><WorkspaceTaskInlineEditor task={task} /></td>
              </tr>
            )) : (
              <tr><td colSpan={4} className="p-5 text-sm font-semibold text-slate-500">No hay tareas para editar en este contexto.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
