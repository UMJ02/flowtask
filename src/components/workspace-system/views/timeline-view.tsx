import type { WorkspaceTaskItem } from "@/lib/workspace-system/view-state";
import { WorkspaceEmptyState } from "../workspace-empty-state";

export function TimelineView({ tasks }: { tasks: WorkspaceTaskItem[] }) {
  const visible = tasks.filter((task) => task.dueDate).slice(0, 10);
  return (
    <section className="rounded-[26px] border border-[var(--ft-workspace-border)] bg-white p-5 shadow-[var(--ft-workspace-shadow)] ft-ws-view">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div><h2 className="text-xl font-extrabold">Timeline del proyecto</h2><p className="text-sm text-slate-500">Fechas clave conectadas a tareas reales.</p></div>
        <div className="flex w-fit rounded-full border border-[var(--ft-workspace-border)] p-1 text-sm font-bold"><button className="rounded-full bg-emerald-500 px-3 py-1.5 text-white">Mes</button><button className="px-3 py-1.5 text-slate-500">Semana</button></div>
      </div>
      <div className="overflow-hidden rounded-[20px] border border-[var(--ft-workspace-border)]">
        <div className="grid grid-cols-[180px_1fr] border-b border-[var(--ft-workspace-border)] bg-slate-50 text-xs font-bold text-slate-500"><div className="p-3">Tarea</div><div className="grid grid-cols-10">{Array.from({ length: 10 }).map((_, i) => <span key={i} className="border-l border-[var(--ft-workspace-border)] p-3">{i + 1}</span>)}</div></div>
        {visible.length ? visible.map((task, i) => (
          <div key={task.id} className="grid grid-cols-[180px_1fr] items-center border-b border-[var(--ft-workspace-border)] last:border-b-0">
            <div className="truncate p-3 text-sm font-bold">{task.title}</div>
            <div className="relative h-12 border-l border-[var(--ft-workspace-border)]"><span className="absolute top-3 h-6 rounded-full bg-emerald-50 ring-1 ring-emerald-200" style={{ left: `${(i % 6) * 9}%`, width: "28%" }} /></div>
          </div>
        )) : <div className="p-4"><WorkspaceEmptyState compact icon="tasks" title="Timeline sin fechas" description="Agregá fechas límite a las tareas para construir el timeline del proyecto." actionHref="/app/workspace?view=table" actionLabel="Editar fechas" /></div>}
      </div>
    </section>
  );
}
