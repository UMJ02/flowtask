import { AlertTriangle, CalendarClock, CheckCircle2, CircleDot, Sparkles } from "lucide-react";
import { getTaskProgress } from "@/lib/workspace-system/adapters";
import type { WorkspaceProjectSummary, WorkspaceTaskItem } from "@/lib/workspace-system/view-state";

export function WorkspaceRightPanel({ tasks, projects }: { tasks: WorkspaceTaskItem[]; projects: WorkspaceProjectSummary[] }) {
  const progress = getTaskProgress(tasks);
  const completed = tasks.filter((task) => ["concluido", "completado"].includes(task.status)).length;
  const waiting = tasks.filter((task) => ["en_espera", "pendiente"].includes(task.status)).length;
  const inProgress = tasks.filter((task) => ["en_proceso", "produccion", "revision"].includes(task.status)).length;
  const dueSoon = tasks.filter((task) => task.dueDate).slice(0, 4);
  const important = tasks.filter((task) => task.priority === "alta").length;

  return (
    <aside className="space-y-4">
      <section className="ft-ws-card p-5">
        <h3 className="font-extrabold text-[var(--ft-workspace-text)]">Resumen del proyecto</h3>
        <div className="mt-4 flex items-center gap-4">
          <div className="grid h-24 w-24 place-items-center rounded-full border-[10px] border-emerald-400 bg-emerald-50 text-center">
            <b className="text-xl text-slate-950">{progress}%</b>
          </div>
          <div className="space-y-2 text-sm font-bold text-[var(--ft-workspace-muted)]">
            <p className="flex items-center gap-2"><CircleDot className="h-4 w-4 text-emerald-500" /> {inProgress} en curso</p>
            <p className="flex items-center gap-2"><CalendarClock className="h-4 w-4 text-amber-500" /> {waiting} pendientes</p>
            <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> {completed} completadas</p>
          </div>
        </div>
      </section>

      <section className="ft-ws-card p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-extrabold text-[var(--ft-workspace-text)]">Próximos vencimientos</h3>
          <span className="text-xs font-bold text-emerald-600">Ver calendario</span>
        </div>
        <div className="mt-4 space-y-3">
          {dueSoon.length ? dueSoon.map((task) => (
            <p key={task.id} className="flex items-center justify-between gap-3 text-sm">
              <span className="truncate font-semibold text-slate-700">{task.title}</span>
              <b className="shrink-0 text-xs text-rose-500">{task.dueDate}</b>
            </p>
          )) : <p className="text-sm font-semibold text-slate-500">No hay fechas próximas en este contexto.</p>}
        </div>
      </section>

      <section className="ft-ws-card p-5">
        <h3 className="flex items-center gap-2 font-extrabold text-[var(--ft-workspace-text)]"><Sparkles className="h-4 w-4 text-violet-500" /> IA contextual</h3>
        <div className="mt-3 space-y-2">
          <div className="rounded-[18px] bg-violet-50 p-4 text-sm font-semibold text-violet-700">{important} tareas importantes detectadas en este workspace.</div>
          <div className="rounded-[18px] bg-amber-50 p-4 text-sm font-semibold text-amber-700"><AlertTriangle className="mr-2 inline h-4 w-4" /> Revisa carga por proyecto antes de automatizar.</div>
          <div className="rounded-[18px] bg-slate-50 p-4 text-sm font-semibold text-slate-600">{projects.length} proyectos visibles en el contexto actual.</div>
        </div>
      </section>
    </aside>
  );
}
