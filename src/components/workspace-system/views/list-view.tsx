import { groupTasksByStatus } from "@/lib/workspace-system/adapters";
import type { WorkspaceTaskItem } from "@/lib/workspace-system/view-state";
import { WorkspaceTaskInlineEditor } from "../workspace-task-inline-actions";

const groups = [
  { key: "inProgress", label: "EN CURSO", dot: "bg-emerald-500", header: "from-emerald-50" },
  { key: "waiting", label: "PENDIENTE", dot: "bg-amber-500", header: "from-amber-50" },
  { key: "completed", label: "COMPLETADAS", dot: "bg-emerald-500", header: "from-emerald-50" },
] as const;

export function ListView({ tasks }: { tasks: WorkspaceTaskItem[] }) {
  const grouped = groupTasksByStatus(tasks);
  return (
    <div className="space-y-4 ft-ws-view">
      {groups.map((group) => {
        const items = grouped[group.key] ?? [];
        const percent = group.key === "completed" ? 100 : items.length ? Math.round((items.filter((task) => ["concluido", "completado"].includes(task.status)).length / items.length) * 100) : 0;
        return (
          <section key={group.key} className="overflow-hidden rounded-[26px] border border-[var(--ft-workspace-border)] bg-white shadow-[var(--ft-workspace-shadow)]">
            <header className={`flex items-center justify-between border-b border-[var(--ft-workspace-border)] bg-gradient-to-r ${group.header} to-white px-5 py-4`}>
              <div className="flex items-center gap-3">
                <span className={`h-3 w-3 rounded-full ${group.dot}`} />
                <h2 className="text-base font-extrabold text-slate-900">{group.label}</h2>
                <span className="text-sm font-bold text-slate-500">{items.length} tareas</span>
              </div>
              <div className="flex items-center gap-3 text-sm font-bold text-slate-700">
                {percent}%
                <span className="h-2 w-28 overflow-hidden rounded-full bg-slate-100"><span className="block h-full rounded-full bg-emerald-400" style={{ width: `${percent}%` }} /></span>
              </div>
            </header>
            <div className="px-4 py-3">
              <div className="hidden grid-cols-[minmax(0,1.7fr)_150px_minmax(280px,.9fr)] px-3 py-2 text-xs font-bold text-slate-500 lg:grid">
                <span>Tarea</span><span>Responsable</span><span>Edición rápida</span>
              </div>
              {items.length ? items.map((task) => <WorkspaceTaskRow key={task.id} task={task} />) : <p className="rounded-[18px] bg-slate-50 p-4 text-sm font-semibold text-slate-500">No hay tareas en este grupo.</p>}
              <p className="mt-3 rounded-[16px] bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">Tip: ahora podés cambiar estado, prioridad y fecha directamente desde Lista sin abrir modal.</p>
            </div>
          </section>
        );
      })}
    </div>
  );
}

function WorkspaceTaskRow({ task }: { task: WorkspaceTaskItem }) {
  return (
    <article className="ft-ws-row ft-ws-interactive-row grid min-h-[68px] grid-cols-1 gap-3 rounded-[18px] border border-transparent px-3 py-3 lg:grid-cols-[minmax(0,1.7fr)_150px_minmax(280px,.9fr)] lg:items-center lg:gap-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-extrabold text-slate-950">{task.title}</p>
        <div className="mt-1 flex flex-wrap gap-1">
          {(task.tags ?? []).slice(0, 2).map((tag) => <span key={tag} className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700">{tag}</span>)}
          {task.projectTitle ? <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-500">{task.projectTitle}</span> : null}
        </div>
      </div>
      <span className="text-sm font-semibold text-slate-500">{task.assigneeName ?? "Sin asignar"}</span>
      <WorkspaceTaskInlineEditor task={task} />
    </article>
  );
}
