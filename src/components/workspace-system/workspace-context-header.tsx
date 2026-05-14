import { CalendarDays, CheckSquare, Command, Share2, Sparkles, Star, Users, Zap } from "lucide-react";
import type { WorkspaceContext, WorkspaceTaskItem } from "@/lib/workspace-system/view-state";
import { getTaskProgress } from "@/lib/workspace-system/adapters";

export function WorkspaceContextHeader({ context, tasks, onOpenCommandCenter }: { context: WorkspaceContext; tasks: WorkspaceTaskItem[]; onOpenCommandCenter?: () => void }) {
  const progress = getTaskProgress(tasks);
  const active = tasks.filter((task) => !["concluido", "completado"].includes(task.status)).length;
  return (
    <header className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-[var(--ft-workspace-muted)]">
          <span>{context.workspaceName}</span>
          <span>/</span>
          <span>{context.spaceName ?? "Operación"}</span>
          <span>/</span>
          <span className="text-[var(--ft-workspace-text)]">{context.projectTitle ?? "Workspace operativo"}</span>
        </div>
        <div className="mt-2 flex min-w-0 items-center gap-3">
          <h1 className="truncate text-[30px] font-extrabold tracking-[-.04em] text-[var(--ft-workspace-text)] md:text-[34px]">
            {context.projectTitle ?? "Workspace operativo"}
          </h1>
          <Star className="h-5 w-5 shrink-0 fill-amber-300 text-amber-400" />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm font-semibold text-[var(--ft-workspace-muted)]">
          <span className="ft-ws-pill bg-emerald-50 text-emerald-700">{context.mode === "personal" ? "Personal" : "Organización"}</span>
          <span className="inline-flex items-center gap-1"><Users className="h-4 w-4" /> {context.hasProjectFilter ? "Proyecto" : "Workspace"}</span>
          <span className="inline-flex items-center gap-1"><CheckSquare className="h-4 w-4" /> {tasks.length} tareas</span>
          <span className="inline-flex items-center gap-1"><CalendarDays className="h-4 w-4" /> {active} activas</span>
          <span className="inline-flex items-center gap-2"><span className="h-2 w-24 overflow-hidden rounded-full bg-slate-200"><span className="block h-full rounded-full bg-emerald-400" style={{ width: `${progress}%` }} /></span>{progress}%</span>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={onOpenCommandCenter} className="ft-ws-control h-11 px-4 text-sm font-bold"><Command className="h-4 w-4" /> Buscar</button>
        <button className="ft-ws-control h-11 px-4 text-sm font-bold"><Zap className="h-4 w-4" /> Automatizar</button>
        <button className="ft-ws-control h-11 px-4 text-sm font-bold"><Share2 className="h-4 w-4" /> Compartir</button>
        <button className="ft-ws-control h-11 px-4 text-sm font-bold"><Sparkles className="h-4 w-4" /> IA</button>
      </div>
    </header>
  );
}
