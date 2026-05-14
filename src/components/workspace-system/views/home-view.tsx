import type { CSSProperties } from "react";
import Link from "next/link";
import { BarChart3, CalendarClock, CheckCircle2, Columns3, FileArchive, FolderKanban, LayoutDashboard, ListChecks, PanelTop, Plus, Sparkles, Table2, TrendingUp, UsersRound } from "lucide-react";
import { getTaskProgress } from "@/lib/workspace-system/adapters";
import { WorkspaceMembersPermissionsCard } from "../workspace-members-permissions";
import type { WorkspaceActivityItem, WorkspaceBoardSummary, WorkspaceContext, WorkspaceFileSummary, WorkspaceMemberSummary, WorkspacePermissionSummary, WorkspaceProjectSummary, WorkspaceProjectViewPreference, WorkspaceTaskItem } from "@/lib/workspace-system/view-state";

function workspaceHref(params: Record<string, string | null | undefined>) {
  const next = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) next.set(key, value);
  }
  const query = next.toString();
  return query ? `/app/workspace?${query}` : "/app/workspace";
}

function isDone(status?: string | null) {
  return ["concluido", "completado"].includes(String(status ?? ""));
}

function isOverdue(task: WorkspaceTaskItem) {
  if (task.isOverdue) return true;
  if (!task.dueDate || isDone(task.status)) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(`${task.dueDate}T00:00:00`);
  return !Number.isNaN(due.getTime()) && due < today;
}

function formatShortDate(value?: string | null) {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("es", { day: "2-digit", month: "short" }).format(date);
}

function EmptyHomeCard({ title, text, actionHref, actionLabel }: { title: string; text: string; actionHref: string; actionLabel: string }) {
  return (
    <div className="ft-ws-home-empty-card">
      <div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
      <Link href={actionHref} className="ft-ws-home-link">{actionLabel}</Link>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, hint }: { icon: typeof TrendingUp; label: string; value: string | number; hint: string }) {
  return (
    <section className="ft-ws-home-metric-card">
      <div className="ft-ws-home-metric-icon"><Icon className="h-4 w-4" /></div>
      <div>
        <p>{label}</p>
        <b>{value}</b>
        <span>{hint}</span>
      </div>
    </section>
  );
}

export function HomeView({
  tasks,
  projects,
  boards,
  files,
  activity,
  projectViews,
  members,
  permissions,
  context,
}: {
  tasks: WorkspaceTaskItem[];
  projects: WorkspaceProjectSummary[];
  boards: WorkspaceBoardSummary[];
  files: WorkspaceFileSummary[];
  activity: WorkspaceActivityItem[];
  projectViews: WorkspaceProjectViewPreference[];
  members: WorkspaceMemberSummary[];
  permissions: WorkspacePermissionSummary;
  context: WorkspaceContext;
}) {
  const activeProjectId = context.projectId ?? null;
  const scopedBoards = activeProjectId ? boards.filter((board) => board.projectId === activeProjectId) : boards;
  const scopedFiles = activeProjectId ? files.filter((file) => file.projectId === activeProjectId || tasks.some((task) => task.id === file.taskId)) : files;
  const scopedActivity = activeProjectId ? activity.filter((item) => item.projectId === activeProjectId || item.entityId === activeProjectId) : activity;
  const progress = getTaskProgress(tasks);
  const importantTasks = tasks.filter((task) => String(task.priority).toLowerCase() === "alta").slice(0, 5);
  const overdueTasks = tasks.filter(isOverdue);
  const dueSoon = tasks.filter((task) => task.dueDate && !isDone(task.status)).sort((a, b) => String(a.dueDate).localeCompare(String(b.dueDate))).slice(0, 6);
  const done = tasks.filter((task) => isDone(task.status)).length;
  const activeViews = projectViews.slice(0, 5);
  const projectLabel = context.hasProjectFilter ? "Proyecto activo" : "Workspace activo";
  const homeHref = workspaceHref({ projectId: activeProjectId, space: context.activeFilters?.space ?? null, view: "home" });

  return (
    <div className="ft-ws-view ft-ws-home-grid">
      <section className="ft-ws-home-hero">
        <div className="min-w-0">
          <p className="ft-ws-home-eyebrow"><PanelTop className="h-4 w-4" /> Home operativo</p>
          <h2>{context.projectTitle ?? "Workspace"}</h2>
          <p className="ft-ws-home-hero-copy">Resumen vivo de tareas, vistas, archivos, pizarras y actividad del contexto actual.</p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="ft-ws-pill bg-emerald-50 text-emerald-700">{projectLabel}</span>
            <span className="ft-ws-pill bg-blue-50 text-blue-700">{context.spaceName ?? "Todo el workspace"}</span>
            <span className="ft-ws-pill bg-slate-100 text-slate-600">{context.mode === "organization" ? "Organización" : "Personal"}</span>
          </div>
        </div>
        <div className="ft-ws-home-progress-card">
          <div className="ft-ws-home-progress-ring" style={{ "--ft-ws-home-progress": `${progress * 3.6}deg` } as CSSProperties}>
            <b>{progress}%</b>
          </div>
          <p>{done} de {tasks.length} tareas cerradas</p>
          <Link href={workspaceHref({ projectId: activeProjectId, space: context.activeFilters?.space ?? null, view: "list" })}>Abrir lista</Link>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={ListChecks} label="Tareas" value={tasks.length} hint={`${done} completadas`} />
        <MetricCard icon={CalendarClock} label="Vencidas" value={overdueTasks.length} hint="requieren atención" />
        <MetricCard icon={LayoutDashboard} label="Pizarras" value={scopedBoards.length} hint="canvas conectados" />
        <MetricCard icon={FileArchive} label="Archivos" value={scopedFiles.length} hint="adjuntos visibles" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,.65fr)]">
        <section className="ft-ws-card p-5">
          <div className="ft-ws-home-section-head">
            <div>
              <p>Prioridad operativa</p>
              <h3>Tareas importantes y próximas fechas</h3>
            </div>
            <Link href={workspaceHref({ projectId: activeProjectId, space: context.activeFilters?.space ?? null, view: "board" })} className="ft-ws-home-link"><Columns3 className="h-4 w-4" /> Board</Link>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="space-y-3">
              <h4 className="ft-ws-home-subtitle">Importantes</h4>
              {importantTasks.length ? importantTasks.map((task) => (
                <article key={task.id} className="ft-ws-home-task-row">
                  <span className="ft-ws-home-task-dot bg-rose-400" />
                  <div className="min-w-0">
                    <b>{task.title}</b>
                    <p>{task.projectTitle ?? context.projectTitle ?? "Sin proyecto"}</p>
                  </div>
                  <span>{formatShortDate(task.dueDate)}</span>
                </article>
              )) : <EmptyHomeCard title="Sin importantes" text="Las tareas con prioridad alta aparecerán aquí." actionHref={workspaceHref({ projectId: activeProjectId, space: context.activeFilters?.space ?? null, view: "list" })} actionLabel="Ver tareas" />}
            </div>

            <div className="space-y-3">
              <h4 className="ft-ws-home-subtitle">Próximas fechas</h4>
              {dueSoon.length ? dueSoon.map((task) => (
                <article key={task.id} className="ft-ws-home-task-row">
                  <span className={isOverdue(task) ? "ft-ws-home-task-dot bg-amber-400" : "ft-ws-home-task-dot bg-emerald-400"} />
                  <div className="min-w-0">
                    <b>{task.title}</b>
                    <p>{task.status}</p>
                  </div>
                  <span>{formatShortDate(task.dueDate)}</span>
                </article>
              )) : <EmptyHomeCard title="Sin fechas próximas" text="Cuando existan fechas límite, aparecerán en esta zona." actionHref={workspaceHref({ projectId: activeProjectId, space: context.activeFilters?.space ?? null, view: "timeline" })} actionLabel="Abrir timeline" />}
            </div>
          </div>
        </section>

        <section className="ft-ws-card p-5">
          <div className="ft-ws-home-section-head">
            <div>
              <p>Accesos rápidos</p>
              <h3>Continuar trabajo</h3>
            </div>
          </div>
          <div className="mt-4 grid gap-3">
            <Link className="ft-ws-home-action" href={workspaceHref({ projectId: activeProjectId, space: context.activeFilters?.space ?? null, view: "list" })}><Plus className="h-4 w-4" /> Crear o revisar tareas</Link>
            <Link className="ft-ws-home-action" href={workspaceHref({ projectId: activeProjectId, space: context.activeFilters?.space ?? null, view: "table" })}><Table2 className="h-4 w-4" /> Abrir tabla operativa</Link>
            <Link className="ft-ws-home-action" href={workspaceHref({ projectId: activeProjectId, space: context.activeFilters?.space ?? null, view: "canvas" })}><LayoutDashboard className="h-4 w-4" /> Abrir canvas</Link>
            <Link className="ft-ws-home-action" href={workspaceHref({ projectId: activeProjectId, space: context.activeFilters?.space ?? null, view: "reports" })}><BarChart3 className="h-4 w-4" /> Ver reportes</Link>
          </div>
        </section>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="ft-ws-card p-5">
          <div className="ft-ws-home-section-head">
            <div><p>Colaboración</p><h3>Miembros y permisos</h3></div>
            <UsersRound className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-4">
            <WorkspaceMembersPermissionsCard members={members} permissions={permissions} />
          </div>
        </section>
        <section className="ft-ws-card p-5">
          <div className="ft-ws-home-section-head">
            <div><p>Permisos de trabajo</p><h3>Acciones disponibles</h3></div>
          </div>
          <div className="mt-4 grid gap-2">
            <span className={permissions.canCreateTask ? "ft-ws-access-pill" : "ft-ws-access-pill is-muted"}>Crear tareas: {permissions.canCreateTask ? "Activo" : "Bloqueado"}</span>
            <span className={permissions.canSaveViews ? "ft-ws-access-pill" : "ft-ws-access-pill is-muted"}>Guardar vistas: {permissions.canSaveViews ? "Activo" : "Bloqueado"}</span>
            <span className={permissions.canUploadFiles ? "ft-ws-access-pill" : "ft-ws-access-pill is-muted"}>Subir archivos: {permissions.canUploadFiles ? "Activo" : "Bloqueado"}</span>
            <span className={permissions.canManageSpaces ? "ft-ws-access-pill" : "ft-ws-access-pill is-muted"}>Gestionar espacios: {permissions.canManageSpaces ? "Activo" : "Bloqueado"}</span>
          </div>
        </section>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <section className="ft-ws-card p-5">
          <div className="ft-ws-home-section-head">
            <div><p>Vistas guardadas</p><h3>Configuración del proyecto</h3></div>
          </div>
          <div className="mt-4 space-y-2">
            {activeViews.length ? activeViews.map((view) => (
              <Link key={view.id} className="ft-ws-home-saved-view" href={workspaceHref({ projectId: view.projectId, space: context.activeFilters?.space ?? null, savedViewId: view.id })}>
                <span>{view.title}</span>
                <b>{view.isDefault ? "Default" : view.viewType}</b>
              </Link>
            )) : <EmptyHomeCard title="Sin vistas guardadas" text="Guardá una vista cuando quieras conservar filtros, orden y columnas." actionHref={homeHref} actionLabel="Guardar desde la barra" />}
          </div>
        </section>

        <section className="ft-ws-card p-5">
          <div className="ft-ws-home-section-head">
            <div><p>Pizarras y archivos</p><h3>Material conectado</h3></div>
            <Link href={workspaceHref({ projectId: activeProjectId, space: context.activeFilters?.space ?? null, view: "files" })} className="ft-ws-home-link">Archivos</Link>
          </div>
          <div className="mt-4 space-y-3">
            {scopedBoards.slice(0, 2).map((board) => <div key={board.id} className="ft-ws-home-resource"><LayoutDashboard className="h-4 w-4" /><span>{board.title}</span></div>)}
            {scopedFiles.slice(0, 3).map((file) => <a key={file.id} href={file.publicUrl ?? "#"} target={file.publicUrl ? "_blank" : undefined} rel="noreferrer" className="ft-ws-home-resource"><FileArchive className="h-4 w-4" /><span>{file.fileName}</span></a>)}
            {!scopedBoards.length && !scopedFiles.length ? <EmptyHomeCard title="Sin material" text="Subí archivos o conecta pizarras para centralizar el proyecto." actionHref={workspaceHref({ projectId: activeProjectId, space: context.activeFilters?.space ?? null, view: "files" })} actionLabel="Subir archivo" /> : null}
          </div>
        </section>

        <section className="ft-ws-card p-5">
          <div className="ft-ws-home-section-head">
            <div><p>Actividad e IA</p><h3>Señales recientes</h3></div>
            <Sparkles className="h-4 w-4 text-violet-500" />
          </div>
          <div className="mt-4 space-y-3">
            {scopedActivity.slice(0, 4).map((item) => (
              <div key={item.id} className="ft-ws-home-activity">
                <span>{formatShortDate(item.createdAt)}</span>
                <b>{item.title}</b>
                <p>{item.description ?? item.action}</p>
              </div>
            ))}
            {!scopedActivity.length ? <EmptyHomeCard title="Sin actividad reciente" text="Los movimientos del proyecto aparecerán aquí." actionHref={homeHref} actionLabel="Actualizar" /> : null}
            <div className="rounded-[18px] bg-violet-50 p-4 text-sm font-bold text-violet-700">IA contextual: {overdueTasks.length ? "hay tareas vencidas que conviene revisar primero." : importantTasks.length ? "conviene cerrar las prioridades altas antes de crear más trabajo." : "el contexto está ordenado para continuar."}</div>
          </div>
        </section>
      </div>
    </div>
  );
}
