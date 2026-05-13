import type { WorkspaceTaskItem } from "@/lib/workspace-system/view-state";

export function CanvasView({ tasks }: { tasks: WorkspaceTaskItem[] }) {
  return (
    <section className="relative min-h-[520px] overflow-hidden rounded-[26px] border border-[var(--ft-workspace-border)] bg-slate-50 shadow-[var(--ft-workspace-shadow)] ft-ws-view">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,.42)_1px,transparent_0)] [background-size:22px_22px]" />
      <div className="absolute left-4 top-4 z-10 rounded-[20px] border border-[var(--ft-workspace-border)] bg-white p-2 shadow-sm">
        {["S", "N", "T", "#", "→"].map((tool) => <button key={tool} className="mb-2 grid h-10 w-10 place-items-center rounded-[14px] text-sm font-black text-slate-600 transition hover:bg-emerald-50">{tool}</button>)}
      </div>
      <div className="relative z-10 mx-auto mt-20 grid max-w-[760px] gap-4 md:grid-cols-3">
        <div className="rounded-[18px] border border-blue-200 bg-blue-50 p-4"><b>Objetivo</b><p className="mt-1 text-sm text-slate-500">Centralizar operación del proyecto</p></div>
        <div className="rounded-[18px] border border-emerald-200 bg-emerald-50 p-4"><b>Proyecto</b><p className="mt-1 text-sm text-slate-500">{tasks.length} tareas conectadas</p></div>
        <div className="rounded-[18px] border border-amber-200 bg-amber-50 p-4"><b>Canales</b><p className="mt-1 text-sm text-slate-500">Tareas, reportes y pizarras</p></div>
      </div>
      <div className="absolute bottom-4 right-4 z-10 rounded-full border border-[var(--ft-workspace-border)] bg-white px-4 py-2 text-xs font-extrabold text-slate-500 shadow-sm">Canvas listo para conectar BoardPage</div>
    </section>
  );
}
