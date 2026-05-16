"use client";

// v58.27.2.1 — Workspace Pro Layout Simplification + Interaction Cleanup
// Focus: one navigation source, one primary CTA, compact content, technical/debug UI hidden from the normal workspace.

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Activity,
  BarChart3,
  CalendarDays,
  Command,
  Files,
  Folder,
  Home,
  LayoutGrid,
  ListChecks,
  Menu,
  MoreHorizontal,
  PanelRightOpen,
  Plus,
  Search,
  Share2,
  Sparkles,
  Table2,
  X,
} from "lucide-react";
import type { ReportsOverview } from "@/lib/queries/reports";
import type {
  WorkspaceActivityItem,
  WorkspaceBoardSummary,
  WorkspaceContext,
  WorkspaceFileSummary,
  WorkspaceMemberSummary,
  WorkspaceNotificationSummary,
  WorkspacePermissionSummary,
  WorkspacePersistenceGuardStatus,
  WorkspaceProjectSpaceAssignment,
  WorkspaceProjectSummary,
  WorkspaceProjectViewPreference,
  WorkspaceSpaceSummary,
  WorkspaceTaskItem,
  WorkspaceViewId,
} from "@/lib/workspace-system/view-state";
import { PriorityBadge, StatusBadge } from "@/components/workspace-system/workspace-badges";
import { WorkspaceTaskInlineEditor } from "@/components/workspace-system/workspace-task-inline-actions";
import { WorkspaceQuickCreate } from "@/components/workspace-system/workspace-quick-create";
import { WorkspaceSavedViewsManager } from "@/components/workspace-system/workspace-saved-views-manager";
import { WorkspaceSpacesManager } from "@/components/workspace-system/workspace-spaces-manager";
import { WorkspaceCommandCenter } from "@/components/workspace-system/workspace-command-center";
import { WorkspaceSharePanel } from "@/components/workspace-system/workspace-share-panel";
import { WorkspaceRecoveryPanel } from "@/components/workspace-system/workspace-recovery-panel";
import { WorkspaceEmptyState } from "@/components/workspace-system/workspace-empty-state";

type WorkspaceProPageProps = {
  activeView: WorkspaceViewId;
  tasks: WorkspaceTaskItem[];
  projects: WorkspaceProjectSummary[];
  spaces: WorkspaceSpaceSummary[];
  reports: ReportsOverview | null;
  boards: WorkspaceBoardSummary[];
  files: WorkspaceFileSummary[];
  activity: WorkspaceActivityItem[];
  projectViews: WorkspaceProjectViewPreference[];
  projectSpaceAssignments: WorkspaceProjectSpaceAssignment[];
  members: WorkspaceMemberSummary[];
  permissions: WorkspacePermissionSummary;
  persistenceStatus: WorkspacePersistenceGuardStatus;
  notifications: WorkspaceNotificationSummary;
  context: WorkspaceContext;
};

const viewItems: Array<{ id: WorkspaceViewId; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: "home", label: "Home", icon: Home },
  { id: "list", label: "Lista", icon: ListChecks },
  { id: "board", label: "Board", icon: LayoutGrid },
  { id: "timeline", label: "Timeline", icon: CalendarDays },
  { id: "table", label: "Tabla", icon: Table2 },
  { id: "canvas", label: "Canvas", icon: Sparkles },
  { id: "files", label: "Archivos", icon: Files },
  { id: "reports", label: "Reportes", icon: BarChart3 },
];

function isDone(status?: string | null) {
  return ["concluido", "completado", "done", "hecho"].includes(String(status ?? "").toLowerCase());
}

function isWaiting(status?: string | null) {
  return ["en_espera", "pendiente", "waiting"].includes(String(status ?? "").toLowerCase());
}

function formatDate(value?: string | null) {
  if (!value) return "Sin fecha";
  return value.slice(0, 10);
}

function initials(value?: string | null) {
  const text = (value ?? "FT").trim();
  return text
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "FT";
}

function toneForSpace(index: number) {
  const tones = ["#2563EB", "#111827", "#7C3AED", "#0F766E", "#B45309", "#BE123C"];
  return tones[index % tones.length];
}

export function WorkspaceProPage(props: WorkspaceProPageProps) {
  const {
    activeView,
    tasks,
    projects,
    spaces,
    reports,
    boards,
    files,
    activity,
    projectViews,
    projectSpaceAssignments,
    members,
    permissions,
    persistenceStatus,
    notifications,
    context,
  } = props;
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [savedViewsOpen, setSavedViewsOpen] = useState(false);
  const [spacesManagerOpen, setSpacesManagerOpen] = useState(false);
  const [commandCenterOpen, setCommandCenterOpen] = useState(false);
  const [sharePanelOpen, setSharePanelOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const done = tasks.filter((task) => isDone(task.status)).length;
  const important = tasks.filter((task) => String(task.priority ?? "").toLowerCase() === "alta").length;
  const overdue = tasks.filter((task) => task.isOverdue).length;
  const today = tasks.filter((task) => task.isDueToday).length;
  const progress = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const activeProjectTitle = context.projectTitle ?? "Workspace";
  const statusParam = context.activeFilters?.status ?? "todos";

  function setWorkspaceParam(key: string, value: string, emptyValue = "") {
    const next = new URLSearchParams(searchParams.toString());
    if (value === emptyValue) next.delete(key);
    else next.set(key, value);
    if (key !== "savedViewId") next.delete("savedViewId");
    router.replace(`/app/workspace?${next.toString()}`, { scroll: false });
    router.refresh();
  }

  function openView(view: WorkspaceViewId) {
    setWorkspaceParam("view", view, "home");
  }

  return (
    <div className="ws-pro-shell grid h-screen min-h-screen grid-cols-1 overflow-hidden lg:grid-cols-[248px_minmax(0,1fr)]">
      <WorkspaceSharePanel open={sharePanelOpen} onOpenChange={setSharePanelOpen} context={context} members={members} permissions={permissions} projectViews={projectViews} />
      <WorkspaceCommandCenter
        open={commandCenterOpen}
        onOpenChange={setCommandCenterOpen}
        context={context}
        tasks={tasks}
        projects={projects}
        spaces={spaces}
        boards={boards}
        files={files}
        projectViews={projectViews}
        permissions={permissions}
        onQuickCreate={() => permissions.canCreateTask && setShowQuickCreate(true)}
      />

      <aside className="hidden min-h-0 border-r border-slate-200 bg-white lg:block">
        <WorkspaceProSidebar context={context} spaces={spaces} projects={projects} onOpenCommand={() => setCommandCenterOpen(true)} onOpenSpaces={() => setSpacesManagerOpen(true)} />
      </aside>

      {mobileSidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" aria-label="Cerrar navegación" className="absolute inset-0 bg-slate-950/30 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[min(88vw,304px)] border-r border-slate-200 bg-white shadow-2xl">
            <WorkspaceProSidebar context={context} spaces={spaces} projects={projects} onOpenCommand={() => { setCommandCenterOpen(true); setMobileSidebarOpen(false); }} onOpenSpaces={() => setSpacesManagerOpen(true)} />
          </div>
        </div>
      ) : null}

      {showQuickCreate ? (
        <WorkspaceProSheet title="Nueva tarea" onClose={() => setShowQuickCreate(false)}>
          <WorkspaceQuickCreate context={context} projects={projects} onClose={() => setShowQuickCreate(false)} />
        </WorkspaceProSheet>
      ) : null}
      {spacesManagerOpen ? (
        <WorkspaceProSheet title="Espacios" onClose={() => setSpacesManagerOpen(false)} wide>
          <WorkspaceSpacesManager context={context} spaces={spaces} projects={projects} assignments={projectSpaceAssignments} persistenceStatus={persistenceStatus} permissions={permissions} onClose={() => setSpacesManagerOpen(false)} />
        </WorkspaceProSheet>
      ) : null}
      {savedViewsOpen ? (
        <WorkspaceProSheet title="Vistas guardadas" onClose={() => setSavedViewsOpen(false)} wide>
          <WorkspaceSavedViewsManager activeView={activeView} context={context} projectViews={projectViews} persistenceStatus={persistenceStatus} permissions={permissions} onClose={() => setSavedViewsOpen(false)} />
        </WorkspaceProSheet>
      ) : null}

      <main className="min-w-0 overflow-hidden bg-[#F7F8FA]">
        <div className="flex h-full min-h-0 flex-col">
          <header className="border-b border-slate-200 bg-white px-4 py-3 md:px-6">
            <div className="flex items-center gap-2 lg:hidden">
              <button type="button" className="ws-pro-icon-button" onClick={() => setMobileSidebarOpen(true)} aria-label="Abrir navegación"><Menu className="h-4 w-4" /></button>
              <button type="button" className="ws-pro-search-trigger flex-1" onClick={() => setCommandCenterOpen(true)}><Search className="h-4 w-4" /> Buscar</button>
              <button type="button" className="ws-pro-icon-button" onClick={() => setRightPanelOpen(true)} aria-label="Abrir inspector"><PanelRightOpen className="h-4 w-4" /></button>
            </div>

            <div className="mt-3 flex flex-col gap-3 lg:mt-0 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0">
                <div className="flex min-w-0 items-center gap-1.5 text-xs font-medium text-slate-500">
                  <span className="truncate">{context.workspaceName}</span><span>/</span><span className="truncate">{context.spaceName ?? "Sin espacio"}</span>
                </div>
                <div className="mt-1 flex min-w-0 items-center gap-2">
                  <h1 className="truncate text-[20px] font-semibold tracking-[-0.03em] text-slate-950 md:text-[24px]">{activeProjectTitle}</h1>
                  <span className="ws-pro-status-dot">Activa</span>
                  {permissions.isReadOnly ? <span className="ws-pro-muted-pill">Solo lectura</span> : null}
                </div>
                <p className="mt-1 text-sm text-slate-500">{tasks.length} tareas · {progress}% avance</p>
              </div>

              <div className="relative flex shrink-0 flex-wrap items-center gap-2">
                <button type="button" className="ws-pro-search-trigger hidden w-[210px] lg:inline-flex" onClick={() => setCommandCenterOpen(true)}><Command className="h-4 w-4" /> Buscar <span className="ml-auto text-[11px] text-slate-400">⌘K</span></button>
                <button type="button" disabled={!permissions.canCreateTask} className="ws-pro-primary-button disabled:cursor-not-allowed disabled:opacity-50" onClick={() => setShowQuickCreate(true)}><Plus className="h-4 w-4" /> Nueva tarea</button>
                <button type="button" className="ws-pro-secondary-button" onClick={() => setSharePanelOpen(true)}><Share2 className="h-4 w-4" /> Compartir</button>
                <button type="button" className="ws-pro-icon-button" onClick={() => setMoreOpen((value) => !value)} aria-label="Más acciones"><MoreHorizontal className="h-4 w-4" /></button>
                {moreOpen ? (
                  <div className="ws-pro-menu absolute right-0 top-11 z-20 w-56">
                    <button type="button" onClick={() => { setRightPanelOpen(true); setMoreOpen(false); }}>Abrir inspector</button>
                    <button type="button" onClick={() => { setSavedViewsOpen(true); setMoreOpen(false); }}>Vistas guardadas</button>
                    <button type="button" onClick={() => { setSpacesManagerOpen(true); setMoreOpen(false); }}>Gestionar espacios</button>
                    <Link href="/app/dashboard">Dashboard clásico</Link>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="mt-3 flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
              <WorkspaceProTabs activeView={activeView} projectViews={projectViews} onOpenView={openView} />
              <div className="flex items-center gap-2">
                <select className="ws-pro-select" value={statusParam} onChange={(event) => setWorkspaceParam("status", event.target.value, "todos")}>
                  <option value="todos">Todos</option><option value="en_proceso">En proceso</option><option value="produccion">Producción</option><option value="en_espera">En espera</option><option value="pendiente">Pendiente</option><option value="concluido">Concluido</option>
                </select>
              </div>
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-hidden">
            <section className="h-full min-w-0 overflow-y-auto px-4 py-5 ws-pro-page-scroll md:px-6 lg:px-8">
              {context.invalidProjectId ? <WorkspaceRecoveryPanel reason="invalid-project" title="Proyecto no disponible" description="El proyecto solicitado no pertenece al espacio activo o ya no está disponible." context={context} persistenceStatus={persistenceStatus} permissions={permissions} /> : null}
              {context.invalidSavedViewId ? <div className="mb-4"><WorkspaceRecoveryPanel reason="invalid-saved-view" title="Vista guardada no disponible" description="La vista solicitada ya no existe para este proyecto." context={context} persistenceStatus={persistenceStatus} permissions={permissions} /></div> : null}
              <WorkspaceProMainView activeView={activeView} tasks={tasks} projects={projects} boards={boards} files={files} activity={activity} projectViews={projectViews} reports={reports} context={context} important={important} overdue={overdue} today={today} progress={progress} />
            </section>
          </div>
        </div>
      </main>

      {rightPanelOpen ? (
        <WorkspaceProInspector onClose={() => setRightPanelOpen(false)}>
          <WorkspaceProRightPanel tasks={tasks} projects={projects} files={files} activity={activity} boards={boards} members={members} notifications={notifications} progress={progress} important={important} overdue={overdue} today={today} />
        </WorkspaceProInspector>
      ) : null}
    </div>
  );
}

function WorkspaceProSidebar({ context, spaces, projects, onOpenCommand, onOpenSpaces }: { context: WorkspaceContext; spaces: WorkspaceSpaceSummary[]; projects: WorkspaceProjectSummary[]; onOpenCommand: () => void; onOpenSpaces: () => void; }) {
  const recentProjects = projects.slice(0, 8);
  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <div className="border-b border-slate-200 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-slate-950 text-xs font-semibold text-white">FT</div>
          <div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-950">FlowTask</p><p className="truncate text-xs text-slate-500">{context.mode === "organization" ? "Organización" : "Personal"}</p></div>
        </div>
        <button type="button" onClick={onOpenCommand} className="mt-4 flex h-9 w-full items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-left text-sm text-slate-500 transition hover:border-slate-300 hover:bg-white"><Search className="h-4 w-4" /> Buscar<span className="ml-auto text-[11px] text-slate-400">⌘K</span></button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 ws-pro-hide-scrollbar">
        <SidebarSection title="Principal">
          <Link href="/app/workspace" className="ws-pro-sidebar-row"><Home className="h-3.5 w-3.5 text-slate-400" /> Workspace</Link>
          <Link href="/app/tasks" className="ws-pro-sidebar-row"><ListChecks className="h-3.5 w-3.5 text-slate-400" /> Mi trabajo</Link>
          <Link href="/app/notifications" className="ws-pro-sidebar-row"><Activity className="h-3.5 w-3.5 text-slate-400" /> Inbox</Link>
        </SidebarSection>
        <SidebarSection title="Espacios" action={<button type="button" onClick={onOpenSpaces} className="text-slate-400 transition hover:text-slate-900"><Plus className="h-3.5 w-3.5" /></button>}>
          {(spaces.length ? spaces : [{ id: "general", name: "General", slug: "general", source: "general", taskCount: 0, projectCount: 0 } satisfies WorkspaceSpaceSummary]).slice(0, 8).map((space, index) => (
            <Link key={space.id} href={`/app/workspace?space=${space.slug}`} className={context.spaceId === space.slug ? "ws-pro-sidebar-row-active" : "ws-pro-sidebar-row"}><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: space.color ?? toneForSpace(index) }} /><span className="truncate">{space.name}</span><span className="ml-auto text-[11px] text-slate-400">{space.projectCount}</span></Link>
          ))}
        </SidebarSection>
        <SidebarSection title="Proyectos">
          {recentProjects.length ? recentProjects.map((project) => (
            <Link key={project.id} href={`/app/workspace?projectId=${project.id}`} className={context.projectId === project.id ? "ws-pro-sidebar-row-active" : "ws-pro-sidebar-row"}><Folder className="h-3.5 w-3.5 text-slate-400" /><span className="truncate">{project.title}</span></Link>
          )) : <p className="px-2 py-2 text-xs text-slate-400">Sin proyectos visibles</p>}
        </SidebarSection>
        <SidebarSection title="Sistema">
          <Link href="/app/boards" className="ws-pro-sidebar-row"><LayoutGrid className="h-3.5 w-3.5 text-slate-400" /> Pizarras</Link>
          <Link href="/app/reports" className="ws-pro-sidebar-row"><BarChart3 className="h-3.5 w-3.5 text-slate-400" /> Reportes</Link>
        </SidebarSection>
      </div>
      <div className="border-t border-slate-200 p-3"><Link href="/app/dashboard" className="ws-pro-sidebar-row"><Home className="h-3.5 w-3.5 text-slate-400" /> Dashboard clásico</Link></div>
    </div>
  );
}

function SidebarSection({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return <div className="mb-5"><div className="mb-1.5 flex items-center justify-between px-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400"><span>{title}</span>{action}</div><div className="space-y-0.5">{children}</div></div>;
}

function WorkspaceProTabs({ activeView, projectViews, onOpenView }: { activeView: WorkspaceViewId; projectViews: WorkspaceProjectViewPreference[]; onOpenView: (view: WorkspaceViewId) => void }) {
  const persistedTypes = new Set(projectViews.map((view) => view.viewType));
  return (
    <div className="flex items-center gap-1 overflow-x-auto ws-pro-hide-scrollbar">
      {viewItems.map((view) => { const Icon = view.icon; const active = activeView === view.id; return <button key={view.id} type="button" onClick={() => onOpenView(view.id)} className={active ? "ws-pro-tab-active" : "ws-pro-tab"}><Icon className="h-3.5 w-3.5" />{view.label}{persistedTypes.has(view.id) ? <span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> : null}</button>; })}
    </div>
  );
}

function WorkspaceProMainView({ activeView, tasks, projects, boards, files, activity, projectViews, reports, context, important, overdue, today, progress }: { activeView: WorkspaceViewId; tasks: WorkspaceTaskItem[]; projects: WorkspaceProjectSummary[]; boards: WorkspaceBoardSummary[]; files: WorkspaceFileSummary[]; activity: WorkspaceActivityItem[]; projectViews: WorkspaceProjectViewPreference[]; reports: ReportsOverview | null; context: WorkspaceContext; important: number; overdue: number; today: number; progress: number; }) {
  if (activeView === "home") return <WorkspaceProHome tasks={tasks} boards={boards} files={files} activity={activity} projectViews={projectViews} important={important} overdue={overdue} today={today} progress={progress} context={context} />;
  if (activeView === "list") return <WorkspaceProList tasks={tasks} />;
  if (activeView === "board") return <WorkspaceProBoard tasks={tasks} />;
  if (activeView === "timeline") return <WorkspaceProTimeline tasks={tasks} />;
  if (activeView === "table") return <WorkspaceProTable tasks={tasks} />;
  if (activeView === "canvas") return <WorkspaceProCanvas boards={boards} />;
  if (activeView === "files") return <WorkspaceProFiles files={files} boards={boards} />;
  return <WorkspaceProReports tasks={tasks} reports={reports} progress={progress} />;
}

function WorkspaceProHome({ tasks, boards, files, activity, projectViews, important, overdue, today, progress, context }: { tasks: WorkspaceTaskItem[]; boards: WorkspaceBoardSummary[]; files: WorkspaceFileSummary[]; activity: WorkspaceActivityItem[]; projectViews: WorkspaceProjectViewPreference[]; important: number; overdue: number; today: number; progress: number; context: WorkspaceContext; }) {
  const upcoming = tasks.filter((task) => task.dueDate && !isDone(task.status)).slice(0, 5);
  const importantTasks = tasks.filter((task) => String(task.priority ?? "").toLowerCase() === "alta").slice(0, 5);
  return (
    <div className="mx-auto max-w-[1080px] space-y-4">
      <section className="ws-pro-home-summary">
        <div className="min-w-0"><p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">{context.spaceName ?? "Workspace"}</p><h2 className="mt-1 truncate text-xl font-semibold tracking-[-0.03em] text-slate-950 md:text-2xl">{context.projectTitle ?? "Tu centro de trabajo"}</h2></div>
        <div className="flex flex-wrap gap-2"><MetricChip label="Avance" value={`${progress}%`} /><MetricChip label="Tareas" value={tasks.length} /><MetricChip label="Alta" value={important} tone="rose" /><MetricChip label="Hoy" value={today} tone="blue" /></div>
      </section>
      <div className="grid gap-4 xl:grid-cols-2">
        <CleanCard title="Tareas importantes" action={importantTasks.length ? `${importantTasks.length}` : undefined}>{importantTasks.length ? importantTasks.map((task) => <TaskLine key={task.id} task={task} />) : <EmptyMicro icon={<ListChecks className="h-4 w-4" />} title="Sin tareas importantes" text="Marcá una tarea como prioridad alta para verla aquí." />}</CleanCard>
        <CleanCard title="Próximos vencimientos" action={upcoming.length ? `${upcoming.length}` : undefined}>{upcoming.length ? upcoming.map((task) => <TaskLine key={task.id} task={task} subtleDate />) : <EmptyMicro icon={<CalendarDays className="h-4 w-4" />} title="Sin fechas próximas" text="Las tareas con fecha límite aparecerán aquí." />}</CleanCard>
      </div>
      <div className="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
        <CleanCard title="Recursos"><ResourceLine label="Pizarras" value={boards.length} href="/app/workspace?view=canvas" /><ResourceLine label="Archivos" value={files.length} href="/app/workspace?view=files" /><ResourceLine label="Vistas guardadas" value={projectViews.length} href="/app/workspace?view=home" /></CleanCard>
        <CleanCard title="Actividad reciente">{activity.length ? activity.slice(0, 5).map((item) => <div key={item.id} className="flex items-start gap-3 border-b border-slate-100 py-2.5 last:border-b-0"><span className="mt-1 h-2 w-2 rounded-full bg-slate-300" /><div className="min-w-0"><p className="truncate text-sm font-medium text-slate-800">{item.title}</p><p className="text-xs text-slate-400">{formatDate(item.createdAt)}</p></div></div>) : <EmptyMicro icon={<Activity className="h-4 w-4" />} title="Sin actividad reciente" text="Los cambios del proyecto aparecerán en esta sección." />}</CleanCard>
      </div>
    </div>
  );
}

function WorkspaceProList({ tasks }: { tasks: WorkspaceTaskItem[] }) {
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  if (!tasks.length) return <WorkspaceEmptyState icon="tasks" title="No hay tareas visibles" description="Creá una tarea o elegí otro proyecto/espacio." tone="blue" />;
  return (
    <div className="mx-auto max-w-[1120px] rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="grid grid-cols-[minmax(0,1fr)_132px_118px_128px_36px] gap-3 border-b border-slate-100 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-slate-400 max-lg:hidden"><span>Tarea</span><span>Estado</span><span>Prioridad</span><span>Fecha</span><span /></div>
      <div className="divide-y divide-slate-100">
        {tasks.map((task) => (
          <article key={task.id} className="transition hover:bg-slate-50">
            <div className="grid gap-3 px-4 py-3 lg:grid-cols-[minmax(0,1fr)_132px_118px_128px_36px] lg:items-center">
              <div className="min-w-0"><p className="truncate text-sm font-medium text-slate-950">{task.title}</p><p className="mt-0.5 truncate text-xs text-slate-500">{task.projectTitle ?? task.clientName ?? "Sin proyecto"}</p></div><StatusBadge status={task.status} /><PriorityBadge priority={task.priority} /><span className="text-sm text-slate-500">{formatDate(task.dueDate)}</span><button type="button" className="ws-pro-icon-button h-8 w-8" aria-label="Más acciones" onClick={() => setExpandedTaskId((value) => value === task.id ? null : task.id)}><MoreHorizontal className="h-4 w-4" /></button>
            </div>
            {expandedTaskId === task.id ? <div className="border-t border-slate-100 bg-slate-50 px-4 py-3"><WorkspaceTaskInlineEditor task={task} compact /></div> : null}
          </article>
        ))}
      </div>
    </div>
  );
}

function WorkspaceProBoard({ tasks }: { tasks: WorkspaceTaskItem[] }) {
  const columns = [{ key: "active", title: "En curso", items: tasks.filter((task) => !isDone(task.status) && !isWaiting(task.status)) }, { key: "waiting", title: "Pendiente", items: tasks.filter((task) => isWaiting(task.status)) }, { key: "done", title: "Completado", items: tasks.filter((task) => isDone(task.status)) }];
  return <div className="grid gap-4 xl:grid-cols-3">{columns.map((column) => <section key={column.key} className="min-h-[320px] rounded-xl border border-slate-200 bg-white p-3 shadow-sm"><header className="mb-3 flex items-center justify-between px-1"><h3 className="text-sm font-semibold text-slate-950">{column.title}</h3><span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">{column.items.length}</span></header><div className="space-y-2">{column.items.length ? column.items.map((task) => <article key={task.id} className="rounded-xl border border-slate-200 bg-white p-3 transition hover:border-slate-300"><div className="flex items-start justify-between gap-2"><p className="text-sm font-medium text-slate-950">{task.title}</p><button type="button" className="ws-pro-icon-button h-7 w-7"><MoreHorizontal className="h-3.5 w-3.5" /></button></div><div className="mt-3 flex items-center justify-between gap-2"><PriorityBadge priority={task.priority} /><span className="text-xs text-slate-500">{formatDate(task.dueDate)}</span></div></article>) : <p className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-400">Sin tareas</p>}</div></section>)}</div>;
}

function WorkspaceProTimeline({ tasks }: { tasks: WorkspaceTaskItem[] }) { const dated = tasks.filter((task) => task.dueDate).slice(0, 12); if (!dated.length) return <WorkspaceEmptyState icon="tasks" title="Timeline sin fechas" description="Agregá fechas límite para crear una línea de tiempo del proyecto." tone="blue" />; return <div className="mx-auto max-w-[960px] rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="text-base font-semibold text-slate-950">Timeline</h3><div className="mt-4 space-y-3">{dated.map((task, index) => <div key={task.id} className="grid grid-cols-[160px_minmax(0,1fr)] items-center gap-4"><div className="min-w-0"><p className="truncate text-sm font-medium text-slate-800">{task.title}</p><p className="text-xs text-slate-400">{formatDate(task.dueDate)}</p></div><div className="h-8 rounded-full bg-slate-100 p-1"><div className="h-full rounded-full bg-slate-900" style={{ width: `${Math.max(18, 30 + (index % 5) * 11)}%` }} /></div></div>)}</div></div>; }

function WorkspaceProTable({ tasks }: { tasks: WorkspaceTaskItem[] }) { if (!tasks.length) return <WorkspaceEmptyState icon="tasks" title="Tabla sin registros" description="Las tareas del proyecto se mostrarán en formato tabla editable." tone="blue" />; return <div className="mx-auto max-w-[1120px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="overflow-x-auto ws-pro-hide-scrollbar"><table className="min-w-[820px] w-full text-left text-sm"><thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-[0.08em] text-slate-400"><tr><th className="px-4 py-3">Tarea</th><th>Estado</th><th>Prioridad</th><th>Fecha</th><th>Proyecto</th><th /></tr></thead><tbody className="divide-y divide-slate-100">{tasks.map((task) => <tr key={task.id} className="hover:bg-slate-50"><td className="px-4 py-3 font-medium text-slate-950">{task.title}</td><td><StatusBadge status={task.status} /></td><td><PriorityBadge priority={task.priority} /></td><td className="text-slate-500">{formatDate(task.dueDate)}</td><td className="text-slate-500">{task.projectTitle ?? "-"}</td><td><button className="ws-pro-icon-button h-8 w-8"><MoreHorizontal className="h-4 w-4" /></button></td></tr>)}</tbody></table></div></div>; }
function WorkspaceProCanvas({ boards }: { boards: WorkspaceBoardSummary[] }) { return <div className="mx-auto max-w-[1120px] rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><h3 className="text-base font-semibold text-slate-950">Canvas y pizarras</h3><p className="mt-1 text-sm text-slate-500">Abrí una pizarra real para trabajar visualmente.</p></div><Link className="ws-pro-secondary-button" href="/app/boards">Biblioteca</Link></div><div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{boards.length ? boards.map((board) => <Link key={board.id} href={`/app/boards/${board.id}`} className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-white"><p className="font-medium text-slate-950">{board.title}</p><p className="mt-2 text-xs text-slate-500">{formatDate(board.updatedAt)}</p></Link>) : <EmptyMicro icon={<Sparkles className="h-4 w-4" />} title="Sin pizarras conectadas" text="Creá o vinculá una pizarra para verla aquí." />}</div></div>; }
function WorkspaceProFiles({ files, boards }: { files: WorkspaceFileSummary[]; boards: WorkspaceBoardSummary[] }) { return <div className="mx-auto max-w-[1120px] grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]"><CleanCard title="Archivos recientes">{files.length ? files.slice(0, 12).map((file) => <ResourceLine key={file.id} label={file.fileName} value={file.mimeType ?? "archivo"} href={file.publicUrl ?? undefined} />) : <EmptyMicro icon={<Files className="h-4 w-4" />} title="Sin archivos" text="Subí archivos desde el proyecto para verlos aquí." />}</CleanCard><CleanCard title="Pizarras relacionadas">{boards.length ? boards.slice(0, 5).map((board) => <ResourceLine key={board.id} label={board.title} value="Abrir" href={`/app/boards/${board.id}`} />) : <p className="text-sm text-slate-400">Sin pizarras</p>}</CleanCard></div>; }
function WorkspaceProReports({ tasks, reports, progress }: { tasks: WorkspaceTaskItem[]; reports: ReportsOverview | null; progress: number }) { const done = tasks.filter((task) => isDone(task.status)).length; return <div className="mx-auto max-w-[960px] space-y-4"><div className="flex flex-wrap gap-2"><MetricChip label="Progreso" value={`${progress}%`} /><MetricChip label="Completadas" value={done} /><MetricChip label="Activas" value={tasks.length - done} /><MetricChip label="Reportes" value={reports ? "OK" : "-"} /></div><CleanCard title="Reporte del workspace"><p className="text-sm leading-6 text-slate-500">Resumen compacto basado en tareas visibles. El reporte completo sigue disponible en el módulo Reportes.</p><Link href="/app/reports" className="mt-4 inline-flex text-sm font-semibold text-slate-950">Abrir reportes completos</Link></CleanCard></div>; }

function WorkspaceProRightPanel({ tasks, activity, members, notifications, progress, important, overdue, today }: { tasks: WorkspaceTaskItem[]; projects: WorkspaceProjectSummary[]; files: WorkspaceFileSummary[]; activity: WorkspaceActivityItem[]; boards: WorkspaceBoardSummary[]; members: WorkspaceMemberSummary[]; notifications: WorkspaceNotificationSummary; progress: number; important: number; overdue: number; today: number; }) {
  const upcoming = tasks.filter((task) => task.dueDate && !isDone(task.status)).slice(0, 4);
  return <div className="space-y-4"><CleanCard title="Resumen"><div className="flex items-center justify-between"><span className="text-sm text-slate-500">Avance</span><span className="text-sm font-semibold text-slate-950">{progress}%</span></div><div className="mt-3 h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-slate-950" style={{ width: `${progress}%` }} /></div><div className="mt-4 grid grid-cols-3 gap-2 text-center"><MiniStat label="Alta" value={important} /><MiniStat label="Hoy" value={today} /><MiniStat label="Venc." value={overdue} /></div></CleanCard><CleanCard title="Próximos">{upcoming.length ? upcoming.map((task) => <TaskLine key={task.id} task={task} compact />) : <p className="text-sm text-slate-400">Sin vencimientos próximos</p>}</CleanCard><CleanCard title="Actividad">{activity.length ? activity.slice(0, 4).map((item) => <p key={item.id} className="border-b border-slate-100 py-2 text-sm leading-5 text-slate-500 last:border-b-0"><span className="font-medium text-slate-800">{item.title}</span><br /><span className="text-xs text-slate-400">{formatDate(item.createdAt)}</span></p>) : <p className="text-sm text-slate-400">Sin actividad reciente</p>}</CleanCard><CleanCard title="Equipo"><div className="flex -space-x-2">{members.slice(0, 6).map((member) => <span key={member.id} className="grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-slate-100 text-[11px] font-semibold text-slate-600">{initials(member.name ?? member.email)}</span>)}</div><p className="mt-3 text-xs text-slate-500">{notifications.unread ? `${notifications.unread} notificaciones sin leer.` : "Sin alertas pendientes."}</p></CleanCard></div>;
}

function WorkspaceProSheet({ title, onClose, wide, children }: { title: string; onClose: () => void; wide?: boolean; children: React.ReactNode }) { return <div className="fixed inset-0 z-40"><button type="button" aria-label="Cerrar panel" className="absolute inset-0 bg-slate-950/20 backdrop-blur-[2px]" onClick={onClose} /><section className={`absolute right-3 top-3 max-h-[calc(100vh-1.5rem)] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl ${wide ? "w-[min(760px,calc(100vw-1.5rem))]" : "w-[min(520px,calc(100vw-1.5rem))]"}`}><header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3"><h2 className="text-sm font-semibold text-slate-950">{title}</h2><button type="button" className="ws-pro-icon-button h-8 w-8" onClick={onClose}><X className="h-4 w-4" /></button></header><div className="p-4">{children}</div></section></div>; }
function WorkspaceProInspector({ onClose, children }: { onClose: () => void; children: React.ReactNode }) { return <div className="fixed inset-0 z-40"><button type="button" aria-label="Cerrar inspector" className="absolute inset-0 bg-slate-950/20 backdrop-blur-[2px]" onClick={onClose} /><aside className="absolute right-3 top-3 h-[calc(100vh-1.5rem)] w-[min(360px,calc(100vw-1.5rem))] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl ws-pro-hide-scrollbar"><div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-semibold text-slate-950">Inspector</h2><button type="button" className="ws-pro-icon-button h-8 w-8" onClick={onClose}><X className="h-4 w-4" /></button></div>{children}</aside></div>; }
function MetricChip({ label, value, tone = "slate" }: { label: string; value: string | number; tone?: "slate" | "rose" | "blue" }) { const cls = tone === "rose" ? "text-rose-600" : tone === "blue" ? "text-blue-600" : "text-slate-950"; return <span className="inline-flex h-8 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-xs text-slate-500"><b className={`font-semibold ${cls}`}>{value}</b>{label}</span>; }
function MiniStat({ label, value }: { label: string; value: number }) { return <div className="rounded-lg bg-slate-50 px-2 py-2"><p className="text-sm font-semibold text-slate-950">{value}</p><p className="text-[11px] text-slate-500">{label}</p></div>; }
function CleanCard({ title, action, className = "", children }: { title: string; action?: string; className?: string; children: React.ReactNode }) { return <section className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm ${className}`}><header className="mb-3 flex items-center justify-between"><h3 className="text-sm font-semibold text-slate-950">{title}</h3>{action ? <span className="text-xs font-medium text-slate-400">{action}</span> : null}</header>{children}</section>; }
function TaskLine({ task, subtleDate = false, compact = false }: { task: WorkspaceTaskItem; subtleDate?: boolean; compact?: boolean }) { return <div className="flex items-start justify-between gap-3 border-b border-slate-100 py-2.5 last:border-b-0"><div className="min-w-0"><p className={compact ? "truncate text-sm font-medium text-slate-800" : "truncate text-sm font-medium text-slate-950"}>{task.title}</p><p className="mt-0.5 truncate text-xs text-slate-400">{task.projectTitle ?? task.clientName ?? task.departmentName ?? "Sin proyecto"}</p></div><span className={subtleDate ? "shrink-0 text-xs text-slate-400" : "shrink-0 text-xs font-medium text-slate-500"}>{formatDate(task.dueDate)}</span></div>; }
function ResourceLine({ label, value, href }: { label: string; value: string | number; href?: string }) { const content = <><span className="truncate text-sm font-medium text-slate-800">{label}</span><span className="shrink-0 text-xs text-slate-400">{value}</span></>; const cls = "flex items-center justify-between gap-3 border-b border-slate-100 py-2.5 last:border-b-0"; return href ? <Link href={href} className={cls}>{content}</Link> : <div className={cls}>{content}</div>; }
function EmptyMicro({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) { return <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4"><div className="flex items-center gap-2 text-sm font-medium text-slate-800">{icon}{title}</div><p className="mt-1 text-sm text-slate-500">{text}</p></div>; }
