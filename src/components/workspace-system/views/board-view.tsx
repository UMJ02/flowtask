import { groupTasksByStatus } from "@/lib/workspace-system/adapters";
import type { WorkspaceTaskItem } from "@/lib/workspace-system/view-state";
import { PriorityBadge } from "../workspace-badges";

export function BoardView({ tasks }: { tasks: WorkspaceTaskItem[] }) {
  const grouped = groupTasksByStatus(tasks);
  const columns = [
    { label: "En curso", items: grouped.inProgress, color: "bg-emerald-500" },
    { label: "Pendiente", items: grouped.waiting, color: "bg-amber-500" },
    { label: "Completadas", items: grouped.completed, color: "bg-emerald-500" },
  ];

  return (
    <div className="grid gap-4 ft-ws-view xl:grid-cols-3">
      {columns.map((col) => (
        <section key={col.label} className="rounded-[24px] border border-[var(--ft-workspace-border)] bg-white p-4 shadow-[var(--ft-workspace-shadow)]">
          <header className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${col.color}`} /><b>{col.label}</b></div>
            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-500">{col.items.length}</span>
          </header>
          <div className="space-y-3">
            {col.items.length ? col.items.map((task) => (
              <article key={task.id} className="ft-ws-row rounded-[18px] border border-[var(--ft-workspace-border)] bg-slate-50 p-3 transition hover:bg-white hover:shadow-sm">
                <p className="text-sm font-extrabold text-slate-950">{task.title}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {(task.tags ?? []).slice(0, 2).map((tag) => <span key={tag} className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-slate-500 ring-1 ring-slate-100">{tag}</span>)}
                </div>
                <div className="mt-3 flex items-center justify-between"><PriorityBadge priority={task.priority} /><span className="text-xs font-bold text-slate-500">{task.dueDate ?? "Sin fecha"}</span></div>
              </article>
            )) : <p className="rounded-[18px] bg-slate-50 p-4 text-sm font-semibold text-slate-500">Sin tareas.</p>}
          </div>
        </section>
      ))}
    </div>
  );
}
