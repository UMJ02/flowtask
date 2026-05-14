import type { CSSProperties } from "react";
import { AlertTriangle, CalendarClock, CheckCircle2, CircleDot, FileArchive, Flag, Gauge, Paperclip, Sparkles, TrendingUp } from "lucide-react";
import { getTaskProgress } from "@/lib/workspace-system/adapters";
import { WorkspaceActivityTimeline } from "./workspace-activity-timeline";
import { WorkspaceMembersPermissionsCard } from "./workspace-members-permissions";
import { WorkspaceNotificationsAutomationPanel } from "./workspace-notifications-automation";
import { WorkspaceHealthPanel, WorkspaceEmptyState } from "./workspace-empty-state";
import type { WorkspaceActivityItem, WorkspaceContext, WorkspaceFileSummary, WorkspaceMemberSummary, WorkspacePermissionSummary, WorkspaceNotificationSummary, WorkspacePersistenceGuardStatus, WorkspaceProjectSummary, WorkspaceProjectViewPreference, WorkspaceTaskItem } from "@/lib/workspace-system/view-state";

function isOverdue(task: WorkspaceTaskItem) {
  if (task.isOverdue) return true;
  if (!task.dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(`${task.dueDate}T00:00:00`);
  return !Number.isNaN(due.getTime()) && due < today && !["concluido", "completado"].includes(task.status);
}

function formatShortDate(value?: string | null) {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("es", { day: "2-digit", month: "short" }).format(date);
}


export function WorkspaceRightPanel({
  tasks,
  projects,
  files,
  activity,
  projectViews,
  members,
  permissions,
  persistenceStatus,
  notifications,
  context,
}: {
  tasks: WorkspaceTaskItem[];
  projects: WorkspaceProjectSummary[];
  files: WorkspaceFileSummary[];
  activity: WorkspaceActivityItem[];
  projectViews: WorkspaceProjectViewPreference[];
  members: WorkspaceMemberSummary[];
  permissions: WorkspacePermissionSummary;
  persistenceStatus: WorkspacePersistenceGuardStatus;
  notifications: WorkspaceNotificationSummary;
  context: WorkspaceContext;
}) {
  const progress = getTaskProgress(tasks);
  const completed = tasks.filter((task) => ["concluido", "completado"].includes(task.status)).length;
  const waiting = tasks.filter((task) => ["en_espera", "pendiente"].includes(task.status)).length;
  const inProgress = tasks.filter((task) => ["en_proceso", "produccion", "revision"].includes(task.status)).length;
  const overdue = tasks.filter(isOverdue).length;
  const dueToday = tasks.filter((task) => task.isDueToday).length;
  const important = tasks.filter((task) => task.priority === "alta").length;
  const dueSoon = tasks.filter((task) => task.dueDate).sort((a, b) => String(a.dueDate).localeCompare(String(b.dueDate))).slice(0, 5);
  const recentFiles = files.slice(0, 4);
  const recentActivity = activity.slice(0, 5);
  const persistedViews = projectViews.length;
  const focusSignal = overdue > 0 ? "Revisar vencidas" : important > 0 ? "Priorizar importantes" : recentFiles.length > 0 ? "Revisar archivos recientes" : dueToday > 0 ? "Cerrar tareas de hoy" : "Workspace saludable";

  return (
    <aside className="ft-ws-right-panel space-y-4">
      <section className="ft-ws-card p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-[.18em] text-emerald-600">Panel contextual</p>
            <h3 className="mt-1 truncate font-extrabold text-[var(--ft-workspace-text)]">{context.projectTitle ?? "Workspace"}</h3>
            <p className="mt-1 truncate text-xs font-bold text-slate-500">{context.workspaceName} · {context.spaceName}</p>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black text-emerald-700">Live</span>
        </div>

        <div className="mt-5 grid grid-cols-[96px_minmax(0,1fr)] items-center gap-4">
          <div className="ft-ws-progress-ring" style={{ "--ft-ws-progress": `${progress * 3.6}deg` } as CSSProperties}>
            <span>{progress}%</span>
          </div>
          <div className="space-y-2 text-sm font-bold text-[var(--ft-workspace-muted)]">
            <p className="flex items-center gap-2"><CircleDot className="h-4 w-4 text-emerald-500" /> {inProgress} en curso</p>
            <p className="flex items-center gap-2"><CalendarClock className="h-4 w-4 text-amber-500" /> {waiting} pendientes</p>
            <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> {completed} completadas</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <div className="ft-ws-mini-metric"><Flag className="h-4 w-4 text-rose-500" /><b>{important}</b><span>Importantes</span></div>
        <div className="ft-ws-mini-metric"><AlertTriangle className="h-4 w-4 text-amber-500" /><b>{overdue}</b><span>Vencidas</span></div>
        <div className="ft-ws-mini-metric"><Paperclip className="h-4 w-4 text-blue-500" /><b>{files.length}</b><span>Archivos</span></div>
        <div className="ft-ws-mini-metric"><Gauge className="h-4 w-4 text-violet-500" /><b>{projects.length}</b><span>Proyectos</span></div>
      </section>

      <WorkspaceHealthPanel
        persistenceStatus={persistenceStatus}
        permissions={permissions}
        counts={{ tasks: tasks.length, projects: projects.length, spaces: context.spaceId ? 1 : 0, boards: 0, files: files.length, views: projectViews.length, activity: activity.length }}
      />

      <WorkspaceMembersPermissionsCard members={members} permissions={permissions} />


      <section className="ft-ws-card p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-extrabold text-[var(--ft-workspace-text)]">Persistencia Workspace</h3>
          <span className={persistenceStatus.enabled ? "text-xs font-bold text-emerald-600" : "text-xs font-bold text-amber-600"}>{persistenceStatus.status}</span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="ft-ws-mini-metric"><b>{persistedViews}</b><span>Vistas guardadas</span></div>
          <div className="ft-ws-mini-metric"><b>{context.activeSavedView ? "Activa" : context.hasProjectFilter ? "Proyecto" : "Workspace"}</b><span>Contexto</span></div>
        </div>
        <div className="ft-ws-migration-guard mt-3" data-ready={persistenceStatus.enabled ? "true" : "false"}>
          <p>{persistenceStatus.message}</p>
          <p className="mt-1">workspace_spaces: {persistenceStatus.workspaceSpacesReady ? "OK" : "fallback"} · project_views: {persistenceStatus.projectViewsReady ? "OK" : "guardado bloqueado"} · workspace_space_projects: {persistenceStatus.projectSpaceLinksReady ? "OK" : "pendiente"}</p>
          <p className="mt-1">{context.activeSavedView ? `Vista activa: ${context.activeSavedView.title}` : "Sin vista guardada activa"} · {context.activeFilters?.defaultApplied ? "default aplicado" : "configuración manual"}</p>
        </div>
      </section>


      <WorkspaceNotificationsAutomationPanel tasks={tasks} files={files} activity={activity} notifications={notifications} />

      <section className="ft-ws-card p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-extrabold text-[var(--ft-workspace-text)]">Línea de actividad</h3>
          <span className="text-xs font-bold text-emerald-600">{recentActivity.length} movimientos</span>
        </div>
        <div className="mt-4">
          <WorkspaceActivityTimeline activity={recentActivity} compact />
        </div>
      </section>

      <section className="ft-ws-card p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-extrabold text-[var(--ft-workspace-text)]">Archivos recientes</h3>
          <FileArchive className="h-4 w-4 text-blue-500" />
        </div>
        <div className="mt-4 space-y-2">
          {recentFiles.length ? recentFiles.map((file) => (
            <a key={file.id} href={file.publicUrl ?? "#"} target={file.publicUrl ? "_blank" : undefined} rel="noreferrer" className="ft-ws-file-mini-card">
              <Paperclip className="h-4 w-4 text-blue-500" />
              <span className="min-w-0 flex-1 truncate text-sm font-black text-slate-800">{file.fileName}</span>
              <span className="text-xs font-bold text-slate-500">{formatShortDate(file.createdAt)}</span>
            </a>
          )) : <WorkspaceEmptyState compact icon="files" title="Sin archivos recientes" description="Los adjuntos del proyecto aparecerán aquí cuando se suban desde Archivos." actionHref="/app/workspace?view=files" actionLabel="Abrir Archivos" />}
        </div>
      </section>

      <section className="ft-ws-card p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-extrabold text-[var(--ft-workspace-text)]">Próximos vencimientos</h3>
          <span className="text-xs font-bold text-emerald-600">Datos reales</span>
        </div>
        <div className="mt-4 space-y-3">
          {dueSoon.length ? dueSoon.map((task) => (
            <div key={task.id} className="rounded-[16px] border border-slate-100 bg-slate-50/70 px-3 py-2 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="truncate font-bold text-slate-700">{task.title}</span>
                <b className="shrink-0 text-xs text-rose-500">{task.dueDate}</b>
              </div>
              <p className="mt-1 truncate text-xs font-semibold text-slate-500">{task.projectTitle ?? context.projectTitle ?? "Sin proyecto"}</p>
            </div>
          )) : <WorkspaceEmptyState compact icon="tasks" title="Sin vencimientos próximos" description="Agregá fechas a tareas para que aparezcan en este panel." actionHref="/app/workspace?view=timeline" actionLabel="Abrir Timeline" />}
        </div>
      </section>

      <section className="ft-ws-card p-5">
        <h3 className="flex items-center gap-2 font-extrabold text-[var(--ft-workspace-text)]"><Sparkles className="h-4 w-4 text-violet-500" /> IA contextual</h3>
        <div className="mt-3 space-y-2">
          <div className="rounded-[18px] bg-violet-50 p-4 text-sm font-semibold text-violet-700"><TrendingUp className="mr-2 inline h-4 w-4" /> Señal principal: {focusSignal}.</div>
          <div className="rounded-[18px] bg-amber-50 p-4 text-sm font-semibold text-amber-700"><AlertTriangle className="mr-2 inline h-4 w-4" /> {context.mode === "organization" ? "Valida actividad y archivos del equipo antes de automatizar." : "Este modo usa solo datos personales del usuario activo."}</div>
          <div className="rounded-[18px] bg-slate-50 p-4 text-sm font-semibold text-slate-600">{activity.length} movimientos y {files.length} archivos visibles en este contexto.</div>
        </div>
      </section>
    </aside>
  );
}
