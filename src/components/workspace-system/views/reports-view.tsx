import type { ReportsOverview } from "@/lib/queries/reports";
import { getTaskProgress } from "@/lib/workspace-system/adapters";
import type { WorkspaceTaskItem } from "@/lib/workspace-system/view-state";
import { WorkspaceEmptyState } from "../workspace-empty-state";

export function ReportsView({ reports, tasks }: { reports: ReportsOverview | null; tasks: WorkspaceTaskItem[] }) {
  const progress = getTaskProgress(tasks);
  const done = tasks.filter((task) => ["concluido", "completado"].includes(task.status)).length;
  const inProgress = tasks.filter((task) => ["en_proceso", "produccion", "revision"].includes(task.status)).length;
  const pending = tasks.filter((task) => ["en_espera", "pendiente"].includes(task.status)).length;
  return (
    <section className="rounded-[26px] border border-[var(--ft-workspace-border)] bg-white p-5 shadow-[var(--ft-workspace-shadow)] ft-ws-view">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><h2 className="text-xl font-extrabold">Reportes del workspace</h2><select className="ft-ws-control h-10 px-3 text-sm font-bold"><option>Este mes</option></select></div>
      {!tasks.length ? <div className="mb-5"><WorkspaceEmptyState icon="tasks" tone="blue" title="Reportes sin tareas visibles" description="Los reportes del workspace se activan cuando existan tareas dentro del proyecto o espacio seleccionado." actionHref="/app/workspace?view=list" actionLabel="Crear o revisar tareas" /></div> : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="Progreso general" value={`${progress}%`} helper="Según tareas visibles" />
        <Metric label="Tareas completadas" value={done} helper={`${reports?.kpis.completionRate ?? progress}% global`} />
        <Metric label="En curso" value={inProgress} helper="Trabajo activo" />
        <Metric label="Pendientes" value={pending} helper="En espera o pendiente" />
      </div>
      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <div className="rounded-[20px] border border-[var(--ft-workspace-border)] p-4"><h3 className="font-extrabold">Avance por estado</h3><p className="mt-2 text-sm font-semibold text-slate-500">Conectado a tareas reales del contexto actual.</p></div>
        <div className="rounded-[20px] border border-[var(--ft-workspace-border)] p-4"><h3 className="font-extrabold">Carga de trabajo</h3><p className="mt-2 text-sm font-semibold text-slate-500">Base lista para integrar carga por responsable.</p></div>
      </div>
    </section>
  );
}

function Metric({ label, value, helper }: { label: string; value: string | number; helper: string }) {
  return (
    <div className="rounded-[20px] border border-[var(--ft-workspace-border)] bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-[.12em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-black text-slate-950">{value}</p>
      <p className="mt-1 text-xs font-semibold text-emerald-600">{helper}</p>
    </div>
  );
}
