"use client";

// v58.28.10 — Workspace Pro No Motion + Board Portal + Home Board Colors
// Focus: eliminar animaciones/skeletons del workspace, portal real para acciones del board y colores Home alineados al Board.

import Link from "next/link";
import { memo, useCallback, useEffect, useMemo, useState, type CSSProperties, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Activity,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Crown,
  Command,
  Edit3,
  Files,
  GripVertical,
  Folder,
  Home,
  LayoutGrid,
  ListChecks,
  Menu,
  MoreHorizontal,
  Loader2,
  PanelRightOpen,
  Plus,
  Search,
  Share2,
  Sparkles,
  Table2,
  X,
  Download,
  ExternalLink,
  FileText,
  Trash2,
  UploadCloud,
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
import {
  PriorityBadge,
  StatusBadge,
} from "@/components/workspace-system/workspace-badges";
import {
  LazyWorkspaceCommandCenter,
  LazyWorkspaceFilesUploadEntry,
  LazyWorkspaceQuickCreate,
  LazyWorkspaceRecoveryPanel,
  LazyWorkspaceSavedViewsManager,
  LazyWorkspaceSharePanel,
  LazyWorkspaceSpacesManager,
} from "./workspace-pro-lazy-surfaces";
import { WorkspaceEmptyState } from "@/components/workspace-system/workspace-empty-state";
import { createClient } from "@/lib/supabase/client";
import {
  getWorkspaceProDerivedData,
  type WorkspaceProDerivedData,
} from "@/lib/workspace-system/render-diet";
import { buildWorkspaceProViewHref } from "./workspace-pro-runtime";
import { mergeTaskUpdate, subscribeTaskUpdated, updateTaskPriorityCore, updateTaskStatusCore } from "@/lib/tasks/task-mutations";

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

const viewItems: Array<{
  id: WorkspaceViewId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: "home", label: "Home", icon: Home },
  { id: "list", label: "Tareas", icon: ListChecks },
  { id: "projects", label: "Proyectos", icon: Folder },
  { id: "board", label: "Board", icon: LayoutGrid },
  { id: "timeline", label: "Timeline", icon: CalendarDays },
  { id: "table", label: "Tabla", icon: Table2 },
  { id: "canvas", label: "Canvas", icon: Sparkles },
  { id: "files", label: "Archivos", icon: Files },
  { id: "reports", label: "Reportes", icon: BarChart3 },
];

function isDone(status?: string | null) {
  return ["concluido", "completado", "done", "hecho"].includes(
    String(status ?? "").toLowerCase(),
  );
}

function isWaiting(status?: string | null) {
  return ["en_espera", "pendiente", "waiting"].includes(
    String(status ?? "").toLowerCase(),
  );
}

function taskCompletionPercent(task: WorkspaceTaskItem) {
  if (isDone(task.status)) return 100;
  if (String(task.status ?? "").toLowerCase() === "revision") return 85;
  if (String(task.status ?? "").toLowerCase() === "produccion") return 70;
  if (String(task.status ?? "").toLowerCase() === "en_proceso") return 45;
  if (isWaiting(task.status)) return 15;
  return 0;
}

function formatDate(value?: string | null) {
  if (!value) return "Sin fecha";
  return value.slice(0, 10);
}

function initials(value?: string | null) {
  const text = (value ?? "FT").trim();
  return (
    text
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "FT"
  );
}

function toneForSpace(index: number) {
  const tones = [
    "#2563EB",
    "#111827",
    "#7C3AED",
    "#0F766E",
    "#B45309",
    "#BE123C",
  ];
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
  const [displayedView, setDisplayedView] = useState(activeView);
  const [syncedTasks, setSyncedTasks] = useState(tasks);

  useEffect(() => {
    setSyncedTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    return subscribeTaskUpdated(({ task }) => {
      setSyncedTasks((items) => mergeTaskUpdate(items, task as WorkspaceTaskItem));
    });
  }, []);

  useEffect(() => {
    setDisplayedView(activeView);
  }, [activeView]);

  const activeTasks = useMemo(
    () => syncedTasks.filter((task) => !isDone(task.status)),
    [syncedTasks],
  );
  const hiddenDoneCount = syncedTasks.length - activeTasks.length;
  const derived = useMemo(
    () =>
      getWorkspaceProDerivedData({
        tasks: activeTasks,
        projects,
        boards,
        files,
        activity,
        projectViews,
      }),
    [activeTasks, projects, boards, files, activity, projectViews],
  );
  const { important, overdue, today, progress } = derived.metrics;
  const activeProjectTitle = context.projectTitle ?? "Workspace";
  const statusParam = context.activeFilters?.status ?? "todos";

  const setWorkspaceParam = useCallback((key: string, value: string, emptyValue = "") => {
    const next = new URLSearchParams(searchParams.toString());
    if (value === emptyValue) next.delete(key);
    else next.set(key, value);
    if (key !== "savedViewId") next.delete("savedViewId");
    router.replace(`/app/workspace?${next.toString()}`, { scroll: false });
  }, [router, searchParams]);

  const openView = useCallback((view: WorkspaceViewId) => {
    if (view === displayedView) return;
    setMoreOpen(false);
    setDisplayedView(view);
    if (typeof window === "undefined") return;
    const href = buildWorkspaceProViewHref(view, window.location.search);
    window.history.replaceState(null, "", href);
  }, [displayedView]);

  const mainViewNode = useMemo(
    () => (
      <WorkspaceProMainView
        activeView={displayedView}
        tasks={activeTasks}
        projects={projects}
        boards={boards}
        files={files}
        activity={activity}
        projectViews={projectViews}
        reports={reports}
        context={context}
        permissions={permissions}
        derived={derived}
      />
    ),
    [
      displayedView,
      activeTasks,
      projects,
      boards,
      files,
      activity,
      projectViews,
      reports,
      context,
      permissions,
      derived,
    ],
  );

  return (
    <div className="ws-pro-shell grid h-screen min-h-screen grid-cols-1 overflow-hidden lg:grid-cols-[264px_minmax(0,1fr)]">
      {sharePanelOpen ? (
        <LazyWorkspaceSharePanel
          open={sharePanelOpen}
          onOpenChange={setSharePanelOpen}
          context={context}
          members={members}
          permissions={permissions}
          projectViews={projectViews}
        />
      ) : null}
      {commandCenterOpen ? (
        <LazyWorkspaceCommandCenter
          open={commandCenterOpen}
          onOpenChange={setCommandCenterOpen}
          context={context}
          tasks={syncedTasks}
          projects={projects}
          spaces={spaces}
          boards={boards}
          files={files}
          projectViews={projectViews}
          permissions={permissions}
          onQuickCreate={() =>
            permissions.canCreateTask && setShowQuickCreate(true)
          }
        />
      ) : null}

      <aside className="hidden min-h-0 border-r border-slate-200 bg-white lg:block">
        <WorkspaceProSidebar
          context={context}
          spaces={spaces}
          projects={projects}
          onOpenCommand={() => setCommandCenterOpen(true)}
          onOpenSpaces={() => setSpacesManagerOpen(true)}
        />
      </aside>

      {mobileSidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Cerrar navegación"
            className="absolute inset-0 bg-slate-950/30 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[min(88vw,304px)] border-r border-slate-200 bg-white shadow-2xl">
            <WorkspaceProSidebar
              context={context}
              spaces={spaces}
              projects={projects}
              onOpenCommand={() => {
                setCommandCenterOpen(true);
                setMobileSidebarOpen(false);
              }}
              onOpenSpaces={() => setSpacesManagerOpen(true)}
            />
          </div>
        </div>
      ) : null}

      {showQuickCreate ? (
        <WorkspaceProSheet
          title="Nueva tarea"
          onClose={() => setShowQuickCreate(false)}
        >
          <LazyWorkspaceQuickCreate
            context={context}
            projects={projects}
            onClose={() => setShowQuickCreate(false)}
          />
        </WorkspaceProSheet>
      ) : null}
      {spacesManagerOpen ? (
        <WorkspaceProSheet
          title="Espacios"
          onClose={() => setSpacesManagerOpen(false)}
          wide
        >
          <LazyWorkspaceSpacesManager
            context={context}
            spaces={spaces}
            projects={projects}
            assignments={projectSpaceAssignments}
            persistenceStatus={persistenceStatus}
            permissions={permissions}
            onClose={() => setSpacesManagerOpen(false)}
          />
        </WorkspaceProSheet>
      ) : null}
      {savedViewsOpen ? (
        <WorkspaceProSheet
          title="Vistas guardadas"
          onClose={() => setSavedViewsOpen(false)}
          wide
        >
          <LazyWorkspaceSavedViewsManager
            activeView={displayedView}
            context={context}
            projectViews={projectViews}
            persistenceStatus={persistenceStatus}
            permissions={permissions}
            onClose={() => setSavedViewsOpen(false)}
          />
        </WorkspaceProSheet>
      ) : null}

      <main className="min-w-0 overflow-hidden bg-[#F7F8FA]">
        <div className="flex h-full min-h-0 flex-col">
          <header className="ws-pro-header border-b border-slate-200 bg-white px-4 py-3 md:px-6">
            <div className="flex items-center gap-2 lg:hidden">
              <button
                type="button"
                className="ws-pro-icon-button"
                onClick={() => setMobileSidebarOpen(true)}
                aria-label="Abrir navegación"
              >
                <Menu className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="ws-pro-search-trigger flex-1"
                onClick={() => setCommandCenterOpen(true)}
              >
                <Search className="h-4 w-4" /> Buscar
              </button>
              <button
                type="button"
                className="ws-pro-icon-button"
                onClick={() => setRightPanelOpen(true)}
                aria-label="Abrir inspector"
              >
                <PanelRightOpen className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 flex flex-col gap-3 lg:mt-0 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0">
                <div className="flex min-w-0 items-center gap-1.5 text-xs font-medium text-slate-500">
                  <span className="truncate">{context.workspaceName}</span>
                  <span>/</span>
                  <span className="truncate">
                    {context.spaceName ?? "Sin área"}
                  </span>
                </div>
                <div className="mt-1 flex min-w-0 items-center gap-2">
                  <h1 className="truncate text-[20px] font-semibold tracking-[-0.03em] text-slate-950 md:text-[24px]">
                    {activeProjectTitle}
                  </h1>
                  <span className="ws-pro-status-dot ws-pro-status-dot-pro">
                    <Crown className="h-3 w-3" /> Pro
                  </span>
                  {permissions.isReadOnly ? (
                    <span className="ws-pro-muted-pill">Solo lectura</span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {activeTasks.length} tareas activas · {progress}% avance
                  {hiddenDoneCount
                    ? ` · ${hiddenDoneCount} concluidas ocultas`
                    : ""}
                </p>
              </div>

              <div className="relative flex shrink-0 flex-wrap items-center gap-2">
                <button
                  type="button"
                  className="ws-pro-search-trigger hidden w-[210px] lg:inline-flex"
                  onClick={() => setCommandCenterOpen(true)}
                >
                  <Command className="h-4 w-4" /> Buscar{" "}
                  <span className="ml-auto text-[11px] text-slate-400">⌘K</span>
                </button>
                <button
                  type="button"
                  disabled={!permissions.canCreateTask}
                  className="ws-pro-primary-button disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => setShowQuickCreate(true)}
                >
                  <Plus className="h-4 w-4" /> Nueva tarea
                </button>
                <button
                  type="button"
                  className="ws-pro-secondary-button"
                  onClick={() => setSharePanelOpen(true)}
                >
                  <Share2 className="h-4 w-4" /> Compartir
                </button>
                <button
                  type="button"
                  className="ws-pro-icon-button"
                  onClick={() => setMoreOpen((value) => !value)}
                  aria-label="Más acciones"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
                {moreOpen ? (
                  <div className="ws-pro-menu absolute right-0 top-11 z-20 w-56">
                    <button
                      type="button"
                      onClick={() => {
                        setRightPanelOpen(true);
                        setMoreOpen(false);
                      }}
                    >
                      Abrir inspector
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSavedViewsOpen(true);
                        setMoreOpen(false);
                      }}
                    >
                      Vistas guardadas
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSpacesManagerOpen(true);
                        setMoreOpen(false);
                      }}
                    >
                      Gestionar espacios
                    </button>
                    <Link href="/app/dashboard">Dashboard clásico</Link>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="mt-3 flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
              <WorkspaceProTabs
                activeView={displayedView}
                projectViews={projectViews}
                onOpenView={openView}
              />
              <WorkspaceProFilterBar
                status={statusParam}
                onStatusChange={(value) =>
                  setWorkspaceParam("status", value, "todos")
                }
                onOpenSavedViews={() => setSavedViewsOpen(true)}
              />
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-hidden">
            <section className="h-full min-w-0 overflow-y-auto px-4 py-5 ws-pro-page-scroll ws-pro-content md:px-6 lg:px-8">
              {context.invalidProjectId ? (
                <LazyWorkspaceRecoveryPanel
                  reason="invalid-project"
                  title="Proyecto no disponible"
                  description="El proyecto solicitado no pertenece al espacio activo o ya no está disponible."
                  context={context}
                  persistenceStatus={persistenceStatus}
                  permissions={permissions}
                />
              ) : null}
              {context.invalidSavedViewId ? (
                <div className="mb-4">
                  <LazyWorkspaceRecoveryPanel
                    reason="invalid-saved-view"
                    title="Vista guardada no disponible"
                    description="La vista solicitada ya no existe para este proyecto."
                    context={context}
                    persistenceStatus={persistenceStatus}
                    permissions={permissions}
                  />
                </div>
              ) : null}
              {mainViewNode}
            </section>
          </div>
        </div>
      </main>

      {rightPanelOpen ? (
        <WorkspaceProInspector onClose={() => setRightPanelOpen(false)}>
          <WorkspaceProRightPanel
            tasks={syncedTasks}
            activity={activity}
            members={members}
            notifications={notifications}
            derived={derived}
          />
        </WorkspaceProInspector>
      ) : null}
    </div>
  );
}

function WorkspaceProFilterBar({
  status,
  onStatusChange,
  onOpenSavedViews,
}: {
  status: string;
  onStatusChange: (value: string) => void;
  onOpenSavedViews: () => void;
}) {
  return (
    <div className="ws-pro-filter-bar" aria-label="Controles de vista">
      <WorkspaceProControlSelect
        label="Estado"
        value={status}
        onChange={onStatusChange}
        options={[
          { value: "todos", label: "Todos" },
          { value: "pendiente", label: "Pendiente" },
          { value: "en_proceso", label: "En curso" },
          { value: "produccion", label: "Producción" },
          { value: "en_espera", label: "En espera" },
          { value: "revision", label: "Revisión" },
          { value: "concluido", label: "Concluido" },
        ]}
      />
      <button
        type="button"
        className="ws-pro-control-button"
        onClick={onOpenSavedViews}
      >
        Vistas
      </button>
    </div>
  );
}

function WorkspaceProControlSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="ws-pro-control-select">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function WorkspaceProSidebar({
  context,
  spaces,
  projects,
  onOpenCommand,
  onOpenSpaces,
}: {
  context: WorkspaceContext;
  spaces: WorkspaceSpaceSummary[];
  projects: WorkspaceProjectSummary[];
  onOpenCommand: () => void;
  onOpenSpaces: () => void;
}) {
  const recentProjects = projects.slice(0, 8);
  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <div className="border-b border-slate-200 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="ws-pro-brand-mark">
            <Crown className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-950">
              FlowTask Pro
            </p>
            <p className="truncate text-xs text-slate-500">
              {context.mode === "organization" ? "Organización" : "Personal"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenCommand}
          className="mt-4 flex h-9 w-full items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-left text-sm text-slate-500 transition hover:border-slate-300 hover:bg-white"
        >
          <Search className="h-4 w-4" /> Buscar
          <span className="ml-auto text-[11px] text-slate-400">⌘K</span>
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 ws-pro-hide-scrollbar">
        <SidebarSection title="Principal">
          <Link href="/app/workspace" className="ws-pro-sidebar-row">
            <Home className="h-3.5 w-3.5 text-slate-400" /> Inicio
          </Link>
          <Link href="/app/tasks" className="ws-pro-sidebar-row">
            <ListChecks className="h-3.5 w-3.5 text-slate-400" /> Mi trabajo
          </Link>
          <Link href="/app/notifications" className="ws-pro-sidebar-row">
            <Activity className="h-3.5 w-3.5 text-slate-400" /> Inbox
          </Link>
        </SidebarSection>
        <SidebarSection
          title="Espacios"
          action={
            <button
              type="button"
              onClick={onOpenSpaces}
              className="text-slate-400 transition hover:text-slate-900"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          }
        >
          {(spaces.length
            ? spaces
            : [
                {
                  id: "general",
                  name: "General",
                  slug: "general",
                  source: "general",
                  taskCount: 0,
                  projectCount: 0,
                } satisfies WorkspaceSpaceSummary,
              ]
          )
            .slice(0, 8)
            .map((space, index) => (
              <Link
                key={space.id}
                href={`/app/workspace?space=${space.slug}`}
                className={
                  context.spaceId === space.slug
                    ? "ws-pro-sidebar-row-active"
                    : "ws-pro-sidebar-row"
                }
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{
                    backgroundColor: space.color ?? toneForSpace(index),
                  }}
                />
                <span className="truncate">{space.name}</span>
                <span className="ml-auto text-[11px] text-slate-400">
                  {space.projectCount}
                </span>
              </Link>
            ))}
        </SidebarSection>
        <SidebarSection title="Proyectos">
          {recentProjects.length ? (
            recentProjects.map((project) => (
              <Link
                key={project.id}
                href={`/app/workspace?projectId=${project.id}`}
                className={
                  context.projectId === project.id
                    ? "ws-pro-sidebar-row-active"
                    : "ws-pro-sidebar-row"
                }
              >
                <Folder className="h-3.5 w-3.5 text-slate-400" />
                <span className="truncate">{project.title}</span>
              </Link>
            ))
          ) : (
            <p className="px-2 py-2 text-xs text-slate-400">
              No hay proyectos todavía
            </p>
          )}
        </SidebarSection>
        <SidebarSection title="Sistema">
          <Link href="/app/boards" className="ws-pro-sidebar-row">
            <LayoutGrid className="h-3.5 w-3.5 text-slate-400" /> Pizarras
          </Link>
          <Link href="/app/reports" className="ws-pro-sidebar-row">
            <BarChart3 className="h-3.5 w-3.5 text-slate-400" /> Reportes
          </Link>
        </SidebarSection>
      </div>
      <div className="border-t border-slate-200 p-3">
        <Link href="/app/dashboard" className="ws-pro-sidebar-row">
          <Home className="h-3.5 w-3.5 text-slate-400" /> Dashboard clásico
        </Link>
      </div>
    </div>
  );
}

function SidebarSection({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <div className="mb-1.5 flex items-center justify-between px-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
        <span>{title}</span>
        {action}
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function WorkspaceProTabs({
  activeView,
  projectViews,
  onOpenView,
}: {
  activeView: WorkspaceViewId;
  projectViews: WorkspaceProjectViewPreference[];
  onOpenView: (view: WorkspaceViewId) => void;
}) {
  const persistedTypes = new Set(projectViews.map((view) => view.viewType));
  return (
    <div className="ws-pro-tabs-strip flex items-center gap-1 overflow-x-auto ws-pro-hide-scrollbar">
      {viewItems.map((view) => {
        const Icon = view.icon;
        const active = activeView === view.id;
        return (
          <button
            key={view.id}
            type="button"
            aria-pressed={active}
            onClick={() => onOpenView(view.id)}
            className={active ? "ws-pro-tab-active" : "ws-pro-tab"}
          >
            <Icon className="h-3.5 w-3.5" />
            {view.label}
            {persistedTypes.has(view.id) ? (
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

function WorkspaceProMainView({
  activeView,
  tasks,
  projects,
  boards,
  files,
  activity,
  projectViews,
  reports,
  context,
  permissions,
  derived,
}: {
  activeView: WorkspaceViewId;
  tasks: WorkspaceTaskItem[];
  projects: WorkspaceProjectSummary[];
  boards: WorkspaceBoardSummary[];
  files: WorkspaceFileSummary[];
  activity: WorkspaceActivityItem[];
  projectViews: WorkspaceProjectViewPreference[];
  reports: ReportsOverview | null;
  context: WorkspaceContext;
  permissions: WorkspacePermissionSummary;
  derived: WorkspaceProDerivedData;
}) {
  if (activeView === "home")
    return (
      <MemoWorkspaceProHome
        tasks={tasks}
        boards={boards}
        files={files}
        projectViews={projectViews}
        derived={derived}
        context={context}
      />
    );
  if (activeView === "list")
    return (
      <MemoWorkspaceProList
        tasks={tasks}
        projects={projects}
        context={context}
        permissions={permissions}
      />
    );
  if (activeView === "projects")
    return (
      <MemoWorkspaceProProjects
        projects={projects}
        projectTaskMap={derived.projectTaskMap}
      />
    );
  if (activeView === "board")
    return (
      <MemoWorkspaceProBoard
        tasks={tasks}
        projects={projects}
        context={context}
        boardColumns={derived.boardColumns}
      />
    );
  if (activeView === "timeline")
    return <MemoWorkspaceProTimeline tasks={tasks} projects={projects} />;
  if (activeView === "table") return <MemoWorkspaceProTable tasks={tasks} />;
  if (activeView === "canvas") return <MemoWorkspaceProCanvas boards={boards} />;
  if (activeView === "files")
    return (
      <MemoWorkspaceProFiles
        files={files}
        boards={boards}
        projects={projects}
        context={context}
        permissions={permissions}
      />
    );
  return (
    <MemoWorkspaceProReports
      tasks={tasks}
      projects={projects}
      reports={reports}
      derived={derived}
      context={context}
    />
  );
}

function WorkspaceProHome({
  tasks,
  boards,
  files,
  projectViews,
  derived,
  context,
}: {
  tasks: WorkspaceTaskItem[];
  boards: WorkspaceBoardSummary[];
  files: WorkspaceFileSummary[];
  projectViews: WorkspaceProjectViewPreference[];
  derived: WorkspaceProDerivedData;
  context: WorkspaceContext;
}) {
  const { important, overdue, today, progress } = derived.metrics;
  const { importantTasks, upcomingTasks, activeProjects, activityPreview } =
    derived;
  return (
    <div className="mx-auto grid max-w-[1440px] gap-4 xl:grid-cols-[minmax(0,1fr)_320px] 2xl:grid-cols-[minmax(0,1fr)_340px] ws-pro-view-frame">
      <div className="space-y-4">
        <section className="ws-pro-home-summary ws-pro-hero-card">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
              {context.spaceName ?? "Workspace"}
            </p>
            <h2 className="mt-1 truncate text-xl font-semibold tracking-[-0.03em] text-slate-950 md:text-2xl">
              {context.projectTitle ?? "Tu centro de trabajo"}
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <MetricChip label="Avance" value={`${progress}%`} />
            <MetricChip label="Tareas" value={tasks.length} />
            <MetricChip label="Alta" value={important} tone="rose" />
            <MetricChip label="Hoy" value={today} tone="blue" />
          </div>
        </section>
        <div className="grid gap-4 xl:grid-cols-2">
          <CleanCard
            title="Tareas importantes"
            className="ws-pro-card-tone-blue"
            action={
              importantTasks.length ? `${importantTasks.length}` : undefined
            }
          >
            {importantTasks.length ? (
              importantTasks.map((task) => (
                <TaskLine
                  key={task.id}
                  task={task}
                  href={`/app/tasks/${task.id}`}
                />
              ))
            ) : (
              <EmptyMicro
                icon={<ListChecks className="h-4 w-4" />}
                title="No tenés tareas prioritarias"
                text="Marcá como alta cualquier tarea que querás seguir de cerca."
              />
            )}
          </CleanCard>
          <CleanCard
            title="Próximos vencimientos"
            className="ws-pro-card-tone-amber"
            action={
              upcomingTasks.length ? `${upcomingTasks.length}` : undefined
            }
          >
            {upcomingTasks.length ? (
              upcomingTasks.map((task) => (
                <TaskLine
                  key={task.id}
                  task={task}
                  href={`/app/tasks/${task.id}`}
                  subtleDate
                />
              ))
            ) : (
              <EmptyMicro
                icon={<CalendarDays className="h-4 w-4" />}
                title="Todo al día"
                text="Cuando una tarea tenga fecha límite, la vas a ver en esta sección."
              />
            )}
          </CleanCard>
        </div>
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <CleanCard title="Proyectos activos" className="ws-pro-card-tone-violet">
            {activeProjects.length ? (
              activeProjects.map((project) => (
                <ProjectLine key={project.id} project={project} />
              ))
            ) : (
              <EmptyMicro
                icon={<Folder className="h-4 w-4" />}
                title="Aún no hay proyectos"
                text="Creá un proyecto para ordenar tareas por cliente, área o entrega."
              />
            )}
          </CleanCard>
          <CleanCard title="Recursos" className="ws-pro-card-tone-emerald">
            <ResourceLine
              label="Pizarras"
              value={boards.length}
              href="/app/workspace?view=canvas"
            />
            <ResourceLine
              label="Archivos"
              value={files.length}
              href="/app/workspace?view=files"
            />
            <ResourceLine
              label="Vistas guardadas"
              value={projectViews.length}
              href="/app/workspace?view=home"
            />
          </CleanCard>
        </div>
        <CleanCard title="Actividad reciente" className="ws-pro-card-tone-sky">
          {activityPreview.length ? (
            activityPreview.map((item) => (
              <Link
                key={item.id}
                href={
                  item.taskId
                    ? `/app/tasks/${item.taskId}`
                    : item.projectId
                      ? `/app/workspace?projectId=${item.projectId}`
                      : "/app/workspace"
                }
                className="flex items-start gap-3 border-b border-slate-100 py-2.5 transition hover:bg-slate-50 last:border-b-0"
              >
                <span className="mt-1 h-2 w-2 rounded-full bg-slate-300" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800">
                    {item.title}
                  </p>
                  <p className="text-xs text-slate-400">
                    {formatDate(item.createdAt)}
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <EmptyMicro
              icon={<Activity className="h-4 w-4" />}
              title="Sin movimientos recientes"
              text="Cuando edites tareas, proyectos o archivos, los cambios aparecerán aquí."
            />
          )}
        </CleanCard>
      </div>
      <WorkspaceProUtilityDock
        boards={boards}
        today={today}
        overdue={overdue}
      />
    </div>
  );
}

function WorkspaceProList({
  tasks,
  projects,
  context,
  permissions,
}: {
  tasks: WorkspaceTaskItem[];
  projects: WorkspaceProjectSummary[];
  context: WorkspaceContext;
  permissions: WorkspacePermissionSummary;
}) {
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const individualTasks = tasks.filter((task) => !task.projectId);
  const nestedTaskRows = tasks.filter((task) => task.projectId);
  const visibleTasks = context.hasProjectFilter
    ? tasks
    : [...individualTasks, ...nestedTaskRows];
  if (!visibleTasks.length)
    return (
      <WorkspaceEmptyState
        icon="tasks"
        title="Todavía no hay tareas"
        description="Creá una tarea para empezar o cambiá de proyecto si estás buscando trabajo de otra área."
        actionHref="/app/tasks/new"
        actionLabel="Crear tarea"
        tone="blue"
      />
    );
  return (
    <div className="mx-auto max-w-[1440px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ws-pro-view-frame">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-950">
            Lista editable
          </h3>
          <p className="text-xs text-slate-500">
            Editá nombre, estado, prioridad, fecha y proyecto sin salir de esta vista.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <MetricChip label="individuales" value={individualTasks.length} />
          <MetricChip label="en proyectos" value={nestedTaskRows.length} />
        </div>
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_132px_118px_128px_92px_36px] gap-3 border-b border-slate-100 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-slate-400 max-lg:hidden">
        <span>Tarea</span>
        <span>Estado</span>
        <span>Prioridad</span>
        <span>Fecha</span>
        <span>Acción</span>
        <span />
      </div>
      <div className="divide-y divide-slate-100">
        {visibleTasks.map((task) => (
          <article key={task.id} className="transition hover:bg-slate-50">
            <div className="grid gap-3 px-4 py-3 lg:grid-cols-[minmax(0,1fr)_132px_118px_128px_92px_36px] lg:items-center">
              <Link href={`/app/tasks/${task.id}`} className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-950">
                  {task.title}
                </p>
                <p className="mt-0.5 truncate text-xs text-slate-500">
                  {task.projectTitle ?? task.clientName ?? "Tarea individual"}
                </p>
              </Link>
              <StatusBadge status={task.status} />
              <PriorityBadge priority={task.priority} />
              <span className="text-sm text-slate-500">
                {formatDate(task.dueDate)}
              </span>
              <button
                type="button"
                className="ws-pro-table-action"
                onClick={() =>
                  setExpandedTaskId((value) =>
                    value === task.id ? null : task.id,
                  )
                }
              >
                Gestionar
              </button>
              <Link
                href={`/app/tasks/${task.id}/edit`}
                className="ws-pro-icon-button h-8 w-8"
                aria-label="Editar completa"
              >
                <Edit3 className="h-4 w-4" />
              </Link>
            </div>
            {expandedTaskId === task.id ? (
              <WorkspaceProListTaskEditor
                task={task}
                projects={projects}
                context={context}
                permissions={permissions}
              />
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}

function WorkspaceProListTaskEditor({
  task,
  projects,
  context,
  permissions,
}: {
  task: WorkspaceTaskItem;
  projects: WorkspaceProjectSummary[];
  context: WorkspaceContext;
  permissions: WorkspacePermissionSummary;
}) {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [title, setTitle] = useState(task.title);
  const [projectId, setProjectId] = useState(
    task.projectId ?? context.projectId ?? "",
  );
  const [status, setStatus] = useState(normalizeBoardStatus(task.status));
  const [priority, setPriority] = useState(
    (task.priority ?? "media").toLowerCase(),
  );
  const [dueDate, setDueDate] = useState(task.dueDate ?? "");
  const [busy, setBusy] = useState<"save" | "delete" | null>(null);
  const [message, setMessage] = useState<{
    tone: "success" | "error";
    text: string;
  } | null>(null);

  async function saveCore() {
    const nextTitle = title.trim();
    if (!nextTitle || busy || permissions.isReadOnly) return;
    setBusy("save");
    setMessage(null);
    const { error } = await supabase
      .from("tasks")
      .update({
        title: nextTitle,
        project_id: projectId || null,
        status,
        priority,
        due_date: dueDate || null,
      })
      .eq("id", task.id)
      .select("id")
      .single();
    setBusy(null);
    if (error) {
      setMessage({
        tone: "error",
        text: error.message || "No se pudo actualizar la tarea.",
      });
      return;
    }
    setMessage({ tone: "success", text: "Tarea actualizada." });
    router.refresh();
  }

  async function deleteTask() {
    if (busy || permissions.isReadOnly) return;
    setBusy("delete");
    setMessage(null);
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", task.id)
      .select("id")
      .single();
    setBusy(null);
    if (error) {
      setMessage({
        tone: "error",
        text: error.message || "No se pudo borrar la tarea.",
      });
      return;
    }
    setMessage({ tone: "success", text: "Tarea borrada." });
    router.refresh();
  }

  return (
    <div className="border-t border-slate-100 bg-slate-50 px-4 py-4">
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.4fr)_minmax(220px,0.8fr)] xl:items-end">
        <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
          Nombre
          <input
            className="ws-pro-form-input mt-1 bg-white"
            value={title}
            disabled={permissions.isReadOnly}
            onChange={(event) => setTitle(event.target.value)}
          />
        </label>
        <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
          Proyecto
          <select
            className="ws-pro-form-input mt-1 bg-white"
            value={projectId}
            disabled={permissions.isReadOnly}
            onChange={(event) => setProjectId(event.target.value)}
          >
            <option value="">Tarea individual</option>
            {projects.slice(0, 100).map((project) => (
              <option key={project.id} value={project.id}>
                {project.title}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div
        className="ws-pro-task-editor-inline-row mt-3"
        aria-label="Edición rápida de tarea"
      >
        <select
          className="ws-pro-inline-select"
          value={status}
          disabled={permissions.isReadOnly}
          onChange={(event) => setStatus(event.target.value as BoardColumnId)}
          aria-label="Estado"
        >
          {BOARD_COLUMN_DEFS.map((column) => (
            <option key={column.id} value={column.id}>
              {column.title}
            </option>
          ))}
        </select>
        <select
          className="ws-pro-inline-select"
          value={priority}
          disabled={permissions.isReadOnly}
          onChange={(event) => setPriority(event.target.value)}
          aria-label="Prioridad"
        >
          <option value="alta">Alta</option>
          <option value="media">Media</option>
          <option value="baja">Baja</option>
        </select>
        <input
          type="date"
          className="ws-pro-inline-date"
          value={dueDate}
          disabled={permissions.isReadOnly}
          onChange={(event) => setDueDate(event.target.value)}
          aria-label="Fecha límite"
        />
        <Link
          href={`/app/tasks/${task.id}`}
          className="ws-pro-editor-inline-action"
        >
          Abrir detalle
        </Link>
        <Link
          href={`/app/tasks/${task.id}/edit`}
          className="ws-pro-editor-inline-action"
        >
          Editar completa
        </Link>
        {task.projectId ? (
          <Link
            href={`/app/workspace?projectId=${task.projectId}`}
            className="ws-pro-editor-inline-action"
          >
            Ver proyecto
          </Link>
        ) : null}
        <button
          type="button"
          className="ws-pro-editor-inline-action ws-pro-editor-inline-save"
          disabled={permissions.isReadOnly || busy !== null || !title.trim()}
          onClick={() => void saveCore()}
        >
          {busy === "save" ? "Guardando…" : "Guardar"}
        </button>
        <button
          type="button"
          className="ws-pro-editor-inline-action ws-pro-editor-inline-delete"
          disabled={permissions.isReadOnly || busy !== null}
          onClick={() => void deleteTask()}
        >
          {busy === "delete" ? "Borrando…" : "Borrar"}
        </button>
      </div>
      {message ? (
        <p
          className={
            message.tone === "success"
              ? "mt-3 flex items-center gap-2 text-sm font-semibold text-emerald-700"
              : "mt-3 text-sm font-semibold text-rose-700"
          }
        >
          {message.tone === "success" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : null}
          {message.text}
        </p>
      ) : null}
    </div>
  );
}

function WorkspaceProProjects({
  projects,
  projectTaskMap,
}: {
  projects: WorkspaceProjectSummary[];
  projectTaskMap: Record<string, WorkspaceTaskItem[]>;
}) {
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(
    projects[0]?.id ?? null,
  );
  if (!projects.length)
    return (
      <WorkspaceEmptyState
        icon="projects"
        title="Aún no hay proyectos"
        description="Creá un proyecto para agrupar tareas por cliente, campaña o entrega."
        actionHref="/app/projects/new"
        actionLabel="Crear proyecto"
        tone="blue"
      />
    );
  return (
    <div className="mx-auto max-w-[1440px] space-y-3 ws-pro-view-frame">
      {projects.map((project) => {
        const projectTasks = (projectTaskMap[project.id] ?? []).filter(
          (task) => !isDone(task.status),
        );
        const expanded = expandedProjectId === project.id;
        return (
          <section
            key={project.id}
            className="rounded-xl border border-slate-200 bg-white shadow-sm"
          >
            <button
              type="button"
              onClick={() => setExpandedProjectId(expanded ? null : project.id)}
              className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-950">
                  {project.title}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {project.taskTotal} tareas · {project.progress}% avance ·{" "}
                  {formatDate(project.dueDate)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <MetricChip label="avance" value={`${project.progress}%`} />
                <Link
                  href={`/app/workspace?projectId=${project.id}`}
                  className="ws-pro-mini-action"
                  onClick={(event) => event.stopPropagation()}
                >
                  Abrir
                </Link>
              </div>
            </button>
            {expanded ? (
              <div className="border-t border-slate-100 px-4 py-3">
                {projectTasks.length ? (
                  projectTasks.map((task) => (
                    <TaskLine
                      key={task.id}
                      task={task}
                      href={`/app/tasks/${task.id}`}
                    />
                  ))
                ) : (
                  <p className="text-sm text-slate-400">
                    Este proyecto aún no tiene tareas visibles.
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href={`/app/workspace?projectId=${project.id}&view=list`}
                    className="ws-pro-mini-action"
                  >
                    Ver tareas del proyecto
                  </Link>
                  <Link
                    href={`/app/workspace?projectId=${project.id}&view=board`}
                    className="ws-pro-mini-action"
                  >
                    Abrir board
                  </Link>
                  <Link
                    href={`/app/projects/${project.id}`}
                    className="ws-pro-mini-action"
                  >
                    Detalle clásico
                  </Link>
                </div>
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}

const BOARD_COLUMN_DEFS = [
  {
    id: "pendiente",
    title: "Pendiente",
    tone: "sky",
    match: (status: string) => ["pendiente"].includes(status),
  },
  {
    id: "en_proceso",
    title: "En curso",
    tone: "blue",
    match: (status: string) => ["en_proceso", "activo"].includes(status),
  },
  {
    id: "produccion",
    title: "Producción",
    tone: "violet",
    match: (status: string) => ["produccion"].includes(status),
  },
  {
    id: "en_espera",
    title: "En espera",
    tone: "amber",
    match: (status: string) => ["en_espera", "waiting"].includes(status),
  },
  {
    id: "revision",
    title: "Revisión",
    tone: "fuchsia",
    match: (status: string) => ["revision"].includes(status),
  },
  {
    id: "concluido",
    title: "Concluido",
    tone: "emerald",
    match: (status: string) =>
      ["concluido", "completado", "done", "hecho"].includes(status),
  },
] as const;

type BoardColumnId = (typeof BOARD_COLUMN_DEFS)[number]["id"];

function normalizeBoardStatus(status?: string | null): BoardColumnId {
  const value = String(status ?? "").toLowerCase();
  if (["pendiente"].includes(value)) return "pendiente";
  if (["produccion"].includes(value)) return "produccion";
  if (["en_espera", "waiting"].includes(value)) return "en_espera";
  if (["revision"].includes(value)) return "revision";
  if (["concluido", "completado", "done", "hecho"].includes(value))
    return "concluido";
  return "en_proceso";
}

const TASK_PRIORITY_ACTIONS = [
  { id: "alta", label: "Alta" },
  { id: "media", label: "Media" },
  { id: "baja", label: "Baja" },
] as const;

type TaskPriorityActionId = (typeof TASK_PRIORITY_ACTIONS)[number]["id"];
function normalizePriority(value?: string | null): TaskPriorityActionId {
  const priority = String(value ?? "media").toLowerCase();
  if (priority === "alta") return "alta";
  if (priority === "baja") return "baja";
  return "media";
}

type BoardActionAnchor = {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
};

function getBoardActionPanelVars(anchor: BoardActionAnchor): CSSProperties {
  if (typeof window === "undefined") return {};
  const panelWidth = Math.min(352, Math.max(300, window.innerWidth - 32));
  const gutter = 12;
  const rightSpace = window.innerWidth - anchor.right;
  const preferredLeft = rightSpace >= panelWidth + gutter
    ? anchor.right + gutter
    : anchor.left - panelWidth - gutter;
  const left = Math.max(16, Math.min(preferredLeft, window.innerWidth - panelWidth - 16));
  const top = Math.max(16, Math.min(anchor.top - 8, window.innerHeight - 456));
  return {
    "--board-action-left": `${left}px`,
    "--board-action-top": `${top}px`,
  } as CSSProperties;
}

function WorkspaceProBoard({
  tasks,
  projects,
  context,
  boardColumns,
}: {
  tasks: WorkspaceTaskItem[];
  projects: WorkspaceProjectSummary[];
  context: WorkspaceContext;
  boardColumns: Record<string, WorkspaceTaskItem[]>;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [showDone, setShowDone] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Set<BoardColumnId>>(
    new Set(["pendiente", "en_proceso", "produccion", "en_espera", "revision"]),
  );
  const [editingTask, setEditingTask] = useState<WorkspaceTaskItem | null>(
    null,
  );
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [overColumn, setOverColumn] = useState<BoardColumnId | null>(null);
  const [busyMove, setBusyMove] = useState<string | null>(null);
  const [compactCards, setCompactCards] = useState(true);
  const [boardMessage, setBoardMessage] = useState<{
    tone: "success" | "error";
    text: string;
  } | null>(null);
  const [openActionTaskId, setOpenActionTaskId] = useState<string | null>(null);
  const [openActionAnchor, setOpenActionAnchor] = useState<BoardActionAnchor | null>(null);
  const [localTasks, setLocalTasks] = useState(tasks);
  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    return subscribeTaskUpdated(({ task }) => {
      setLocalTasks((items) => mergeTaskUpdate(items, task as WorkspaceTaskItem));
    });
  }, []);
  const boardTasks = useMemo(
    () =>
      showDone ? localTasks : localTasks.filter((task) => !isDone(task.status)),
    [showDone, localTasks],
  );
  const activeBoardColumns = useMemo(() => {
    const next: Record<string, WorkspaceTaskItem[]> = {};
    for (const column of BOARD_COLUMN_DEFS) {
      next[column.id] = boardTasks.filter((task) =>
        column.match(normalizeBoardStatus(task.status)),
      );
    }
    return next;
  }, [boardTasks]);
  const columns = BOARD_COLUMN_DEFS.filter(
    (column) =>
      (column.id !== "concluido" || showDone) && visibleColumns.has(column.id),
  );

  function toggleColumn(id: BoardColumnId) {
    setVisibleColumns((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      if (!next.size) next.add("en_proceso");
      return next;
    });
  }

  async function moveTask(taskId: string, status: BoardColumnId) {
    setDraggingTaskId(null);
    setOverColumn(null);
    setOpenActionTaskId(null);
    setOpenActionAnchor(null);
    setBoardMessage(null);
    const current = localTasks.find((task) => task.id === taskId);
    if (current && normalizeBoardStatus(current.status) === status) return;
    const previousTasks = localTasks;
    setLocalTasks((items) =>
      items.map((task) => (task.id === taskId ? { ...task, status } : task)),
    );
    setBusyMove(taskId);
    try {
      const confirmedTask = await updateTaskStatusCore(supabase, taskId, status, {
        currentDueDate: current?.dueDate ?? null,
        source: "pro",
      });
      setLocalTasks((items) => mergeTaskUpdate(items, confirmedTask as WorkspaceTaskItem));
      setBoardMessage({ tone: "success", text: "Tarea actualizada." });
    } catch {
      setLocalTasks(previousTasks);
      setBoardMessage({
        tone: "error",
        text: "No se pudo mover. Revisá que la base acepte ese estado.",
      });
    } finally {
      setBusyMove(null);
    }
  }

  async function updateTaskPriority(
    taskId: string,
    priority: TaskPriorityActionId,
  ) {
    setOpenActionTaskId(null);
    setOpenActionAnchor(null);
    setBoardMessage(null);
    const previousTasks = localTasks;
    setLocalTasks((items) =>
      items.map((task) => (task.id === taskId ? { ...task, priority } : task)),
    );
    setBusyMove(taskId);
    try {
      const confirmedTask = await updateTaskPriorityCore(supabase, taskId, priority, "pro");
      setLocalTasks((items) => mergeTaskUpdate(items, confirmedTask as WorkspaceTaskItem));
      setBoardMessage({ tone: "success", text: "Prioridad actualizada." });
    } catch {
      setLocalTasks(previousTasks);
      setBoardMessage({
        tone: "error",
        text: "No se pudo cambiar la prioridad.",
      });
    } finally {
      setBusyMove(null);
    }
  }

  function openTaskActions(taskId: string, event: MouseEvent<HTMLButtonElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    setOpenActionTaskId((value) => {
      if (value === taskId) {
        setOpenActionAnchor(null);
        return null;
      }
      setOpenActionAnchor({
        top: rect.top,
        left: rect.left,
        right: rect.right,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height,
      });
      return taskId;
    });
  }

  if (!boardTasks.length) {
    return (
      <WorkspaceEmptyState
        icon="tasks"
        title="El board está vacío"
        description="Agregá tareas para verlas organizadas por estado. También podés abrir Lista para cargarlas más rápido."
        actionHref="/app/workspace?view=list"
        actionLabel="Abrir Lista"
        tone="blue"
      />
    );
  }

  return (
    <div className="space-y-3">
      {editingTask ? (
        <WorkspaceProSheet
          title="Editar tarea"
          onClose={() => setEditingTask(null)}
        >
          <WorkspaceProBoardTaskEditor
            task={editingTask}
            projects={projects}
            context={context}
            onClose={() => setEditingTask(null)}
          />
        </WorkspaceProSheet>
      ) : null}
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm ws-pro-view-frame">
        <span className="px-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
          Columnas
        </span>
        {BOARD_COLUMN_DEFS.filter((column) => column.id !== "concluido").map(
          (column) => (
            <button
              key={column.id}
              type="button"
              onClick={() => toggleColumn(column.id)}
              className={
                visibleColumns.has(column.id)
                  ? `ws-pro-column-toggle ws-pro-column-toggle-${column.id} is-active`
                  : `ws-pro-column-toggle ws-pro-column-toggle-${column.id}`
              }
            >
              {column.title}
            </button>
          ),
        )}
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setCompactCards((value) => !value)}
            className={
              compactCards
                ? "ws-pro-mini-action is-active"
                : "ws-pro-mini-action"
            }
          >
            {compactCards ? "Vista limpia" : "Vista detallada"}
          </button>
          <label className="inline-flex items-center gap-2 rounded-lg px-2 text-xs font-semibold text-slate-500">
            <input
              type="checkbox"
              checked={showDone}
              onChange={(event) => setShowDone(event.target.checked)}
            />{" "}
            Mostrar concluidas
          </label>
        </div>
      </div>
      {boardMessage ? (
        <p
          className={
            boardMessage.tone === "success"
              ? "mx-auto max-w-[1440px] rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700"
              : "mx-auto max-w-[1440px] rounded-xl border border-rose-100 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700"
          }
        >
          {boardMessage.text}
        </p>
      ) : null}
      <div
        className="mx-auto grid max-w-[1440px] gap-4 ws-pro-board-grid"
        style={{
          gridTemplateColumns: `repeat(${Math.max(columns.length, 1)}, minmax(260px, 1fr))`,
        }}
      >
        {columns.map((column) => {
          const items = activeBoardColumns[column.id] ?? [];
          const isOver = overColumn === column.id;
          return (
            <section
              key={column.id}
              onDragOver={(event) => {
                event.preventDefault();
                setOverColumn(column.id);
              }}
              onDragLeave={() =>
                setOverColumn((value) => (value === column.id ? null : value))
              }
              onDrop={(event) => {
                event.preventDefault();
                const taskId =
                  event.dataTransfer.getData("text/task-id") || draggingTaskId;
                if (taskId) void moveTask(taskId, column.id);
              }}
              className={
                isOver
                  ? `ws-pro-board-column ws-pro-board-column-${column.id} ws-pro-board-column-active`
                  : `ws-pro-board-column ws-pro-board-column-${column.id}`
              }
            >
              <header className="mb-3 flex items-center justify-between gap-3 px-1">
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-slate-950">
                    {column.title}
                  </h3>
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                  {items.length}
                </span>
              </header>
              <div className="space-y-2">
                {items.length ? (
                  items.map((task) => (
                    <article
                      key={task.id}
                      draggable
                      onDragStart={(event) => {
                        setDraggingTaskId(task.id);
                        event.dataTransfer.setData("text/task-id", task.id);
                        event.dataTransfer.effectAllowed = "move";
                      }}
                      onDragEnd={() => {
                        setDraggingTaskId(null);
                        setOverColumn(null);
                      }}
                      className={`${busyMove === task.id ? "ws-pro-board-card opacity-60" : "ws-pro-board-card"}${openActionTaskId === task.id ? " is-menu-open" : ""}`}
                    >
                      <div className="flex items-start gap-2">
                        <GripVertical className="mt-0.5 h-4 w-4 shrink-0 cursor-grab text-slate-300" />
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/app/tasks/${task.id}`}
                            className="line-clamp-2 text-sm font-medium text-slate-950 hover:underline"
                          >
                            {task.title}
                          </Link>
                          {!compactCards ? (
                            <p className="mt-1 truncate text-xs text-slate-400">
                              {task.projectTitle ??
                                task.clientName ??
                                task.departmentName ??
                                "Tarea individual"}
                            </p>
                          ) : null}
                        </div>
                        <div className="relative shrink-0">
                          <button
                            type="button"
                            onClick={(event) => openTaskActions(task.id, event)}
                            className="ws-pro-icon-button h-7 w-7"
                            aria-label="Abrir acciones de tarea"
                          >
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </button>
                          {openActionTaskId === task.id && openActionAnchor && typeof document !== "undefined"
                            ? createPortal(
                                <WorkspaceProBoardActionPanel
                                  task={task}
                                  currentStatus={normalizeBoardStatus(task.status)}
                                  busy={busyMove === task.id}
                                  anchor={openActionAnchor}
                                  onClose={() => {
                                    setOpenActionTaskId(null);
                                    setOpenActionAnchor(null);
                                  }}
                                  onMove={(status) =>
                                    void moveTask(task.id, status)
                                  }
                                  onPriority={(priority) =>
                                    void updateTaskPriority(task.id, priority)
                                  }
                                  onQuickEdit={() => {
                                    setEditingTask(task);
                                    setOpenActionTaskId(null);
                                    setOpenActionAnchor(null);
                                  }}
                                />,
                                document.body,
                              )
                            : null}
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                        <PriorityBadge priority={task.priority} />
                        <span className="text-xs text-slate-500">
                          {formatDate(task.dueDate)}
                        </span>
                      </div>
                    </article>
                  ))
                ) : (
                  <p className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-400">
                    Sin tareas por ahora
                  </p>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function WorkspaceProBoardActionPanel({
  task,
  currentStatus,
  busy,
  anchor,
  onClose,
  onMove,
  onPriority,
  onQuickEdit,
}: {
  task: WorkspaceTaskItem;
  currentStatus: BoardColumnId;
  busy: boolean;
  anchor: BoardActionAnchor;
  onClose: () => void;
  onMove: (status: BoardColumnId) => void;
  onPriority: (priority: TaskPriorityActionId) => void;
  onQuickEdit: () => void;
}) {
  return (
    <aside
      className="ws-pro-board-action-panel ws-pro-board-action-popover"
      style={getBoardActionPanelVars(anchor)}
      role="dialog"
      aria-modal="false"
      aria-label="Acciones de tarea"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
            Acciones
          </p>
          <h3 className="mt-1 line-clamp-2 text-base font-semibold text-slate-950">
            {task.title}
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="ws-pro-icon-button h-9 w-9"
          aria-label="Cerrar acciones"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      {busy ? (
        <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-500">
          Actualizando…
        </p>
      ) : null}
      <div className="mt-4 space-y-4">
        <section>
          <p className="ws-pro-action-menu-label">Estado</p>
          <div className="ws-pro-action-grid">
            {BOARD_COLUMN_DEFS.map((next) => (
              <button
                key={next.id}
                type="button"
                disabled={next.id === currentStatus || busy}
                onClick={() => onMove(next.id)}
                className={
                  next.id === currentStatus
                    ? `ws-pro-action-pill ws-pro-action-pill-${next.id} is-selected`
                    : `ws-pro-action-pill ws-pro-action-pill-${next.id}`
                }
              >
                {next.title}
              </button>
            ))}
          </div>
        </section>
        <section>
          <p className="ws-pro-action-menu-label">Prioridad</p>
          <div className="ws-pro-action-grid ws-pro-action-grid-compact">
            {TASK_PRIORITY_ACTIONS.map((item) => (
              <button
                key={item.id}
                type="button"
                disabled={busy}
                onClick={() => onPriority(item.id)}
                className={`ws-pro-action-pill ws-pro-priority-pill-${item.id}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>
        <div className="ws-pro-action-menu-divider" />
        <div className="grid gap-2 sm:grid-cols-3">
          <button
            type="button"
            onClick={onQuickEdit}
            className="ws-pro-action-panel-button"
          >
            Editar rápido
          </button>
          <Link
            href={`/app/tasks/${task.id}`}
            className="ws-pro-action-panel-button"
          >
            Abrir detalle
          </Link>
          <Link
            href={`/app/tasks/${task.id}/edit`}
            className="ws-pro-action-panel-button"
          >
            Editar completa
          </Link>
        </div>
      </div>
    </aside>
  );
}

function WorkspaceProBoardTaskEditor({
  task,
  projects,
  context,
  onClose,
}: {
  task: WorkspaceTaskItem;
  projects: WorkspaceProjectSummary[];
  context: WorkspaceContext;
  onClose: () => void;
}) {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [title, setTitle] = useState(task.title);
  const [status, setStatus] = useState(normalizeBoardStatus(task.status));
  const [priority, setPriority] = useState(
    (task.priority ?? "media").toLowerCase(),
  );
  const [dueDate, setDueDate] = useState(task.dueDate ?? "");
  const [projectId, setProjectId] = useState(
    task.projectId ?? context.projectId ?? "",
  );
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{
    tone: "success" | "error";
    text: string;
  } | null>(null);

  async function save() {
    const nextTitle = title.trim();
    if (!nextTitle || busy) return;
    setBusy(true);
    setMessage(null);
    const { error } = await supabase
      .from("tasks")
      .update({
        title: nextTitle,
        status,
        priority,
        due_date: dueDate || null,
        project_id: projectId || null,
      })
      .eq("id", task.id)
      .select("id")
      .single();
    setBusy(false);
    if (error) {
      setMessage({
        tone: "error",
        text: error.message || "No se pudo actualizar la tarea.",
      });
      return;
    }
    setMessage({ tone: "success", text: "Tarea actualizada." });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
          Nombre
        </label>
        <input
          className="ws-pro-form-input mt-1"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
          Proyecto
          <select
            className="ws-pro-form-input mt-1"
            value={projectId}
            onChange={(event) => setProjectId(event.target.value)}
          >
            <option value="">Tarea individual</option>
            {projects.slice(0, 80).map((project) => (
              <option key={project.id} value={project.id}>
                {project.title}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div
        className="ws-pro-task-editor-inline-row"
        aria-label="Edición rápida de tarea"
      >
        <select
          className="ws-pro-inline-select"
          value={status}
          onChange={(event) => setStatus(event.target.value as BoardColumnId)}
          aria-label="Estado"
        >
          {BOARD_COLUMN_DEFS.map((column) => (
            <option key={column.id} value={column.id}>
              {column.title}
            </option>
          ))}
        </select>
        <select
          className="ws-pro-inline-select"
          value={priority}
          onChange={(event) => setPriority(event.target.value)}
          aria-label="Prioridad"
        >
          <option value="alta">Alta</option>
          <option value="media">Media</option>
          <option value="baja">Baja</option>
        </select>
        <input
          type="date"
          className="ws-pro-inline-date"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
          aria-label="Fecha límite"
        />
        <Link
          href={`/app/tasks/${task.id}`}
          className="ws-pro-editor-inline-action"
        >
          Abrir detalle
        </Link>
        <Link
          href={`/app/tasks/${task.id}/edit`}
          className="ws-pro-editor-inline-action"
        >
          Editar completa
        </Link>
        <button
          type="button"
          className="ws-pro-editor-inline-action"
          onClick={onClose}
        >
          Cerrar
        </button>
        <button
          type="button"
          className="ws-pro-editor-inline-action ws-pro-editor-inline-save"
          disabled={busy || !title.trim()}
          onClick={() => void save()}
        >
          {busy ? "Guardando…" : "Guardar"}
        </button>
      </div>
      {message ? (
        <p
          className={
            message.tone === "success"
              ? "flex items-center gap-2 text-sm font-semibold text-emerald-700"
              : "text-sm font-semibold text-rose-700"
          }
        >
          {message.tone === "success" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : null}
          {message.text}
        </p>
      ) : null}
    </div>
  );
}

function WorkspaceProTimeline({
  tasks,
  projects,
}: {
  tasks: WorkspaceTaskItem[];
  projects: WorkspaceProjectSummary[];
}) {
  const taskRows = tasks
    .filter((task) => task.dueDate)
    .map((task) => ({
      id: `t-${task.id}`,
      type: "Tarea",
      title: task.title,
      subtitle: task.projectTitle ?? task.clientName ?? "Tarea individual",
      href: `/app/tasks/${task.id}`,
      date: task.dueDate,
      progress: taskCompletionPercent(task),
      status: task.status ?? "pendiente",
      priority: normalizePriority(task.priority),
    }));
  const projectRows = projects
    .filter((project) => project.dueDate)
    .map((project) => ({
      id: `p-${project.id}`,
      type: "Proyecto",
      title: project.title,
      subtitle: `${project.taskTotal} tareas`,
      href: `/app/workspace?projectId=${project.id}`,
      date: project.dueDate,
      progress: project.progress,
      status: project.status ?? "activo",
      priority: "media" as TaskPriorityActionId,
    }));
  const rows = [...projectRows, ...taskRows]
    .sort((a, b) =>
      String(a.date ?? "9999").localeCompare(String(b.date ?? "9999")),
    )
    .slice(0, 18);
  const todayKey = new Date().toISOString().slice(0, 10);
  const overdueCount = rows.filter(
    (row) => String(row.date ?? "") < todayKey && row.progress < 100,
  ).length;
  if (!rows.length)
    return (
      <WorkspaceEmptyState
        icon="tasks"
        title="Sin fechas para mostrar"
        description="Agregá fechas límite a tus tareas para armar el calendario de trabajo."
        actionHref="/app/workspace?view=list"
        actionLabel="Abrir Lista"
        tone="blue"
      />
    );
  return (
    <div className="mx-auto max-w-[1440px] rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ws-pro-view-frame ws-pro-timeline-view">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-950">Timeline</h3>
          <p className="mt-1 text-sm text-slate-500">
            Fechas, avance y estado en una vista simple.
          </p>
        </div>
        <div className="flex gap-2">
          <MetricChip label="Items" value={rows.length} />
          <MetricChip label="Atrasos" value={overdueCount} tone="rose" />
        </div>
      </div>
      <div className="mt-5 space-y-3">
        {rows.map((row) => {
          const dateKey = String(row.date ?? "").slice(0, 10);
          const isOverdue = dateKey < todayKey && row.progress < 100;
          return (
            <Link
              key={row.id}
              href={row.href}
              className={
                isOverdue
                  ? "ws-pro-timeline-row is-late"
                  : "ws-pro-timeline-row"
              }
            >
              <div className="ws-pro-timeline-date">
                <span>{formatDate(row.date)}</span>
                <small>{row.type}</small>
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-950">
                  {row.title}
                </p>
                <p className="mt-0.5 truncate text-xs text-slate-500">
                  {row.subtitle}
                </p>
              </div>
              <div
                className="ws-pro-timeline-progress"
                aria-label={`Avance ${row.progress}%`}
              >
                <span
                  style={{
                    width: `${Math.max(6, Math.min(100, row.progress))}%`,
                  }}
                />
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <StatusBadge status={row.status} />
                <PriorityBadge priority={row.priority} />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function WorkspaceProTable({ tasks }: { tasks: WorkspaceTaskItem[] }) {
  if (!tasks.length)
    return (
      <WorkspaceEmptyState
        icon="tasks"
        title="La tabla está vacía"
        description="Cuando agregués tareas, se mostrarán aquí en formato de tabla para revisar y editar más rápido."
        actionHref="/app/workspace?view=list"
        actionLabel="Abrir Lista"
        tone="blue"
      />
    );
  return (
    <div className="mx-auto max-w-[1440px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ws-pro-view-frame">
      <div className="overflow-x-auto ws-pro-hide-scrollbar">
        <table className="min-w-[900px] w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-[0.08em] text-slate-400">
            <tr>
              <th className="px-4 py-3">Tarea</th>
              <th>Estado</th>
              <th>Prioridad</th>
              <th>Fecha</th>
              <th>Proyecto</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-950">
                  <Link href={`/app/tasks/${task.id}`}>{task.title}</Link>
                </td>
                <td>
                  <StatusBadge status={task.status} />
                </td>
                <td>
                  <PriorityBadge priority={task.priority} />
                </td>
                <td className="text-slate-500">{formatDate(task.dueDate)}</td>
                <td className="text-slate-500">
                  {task.projectTitle ?? "Tarea individual"}
                </td>
                <td>
                  <Link
                    href={`/app/tasks/${task.id}/edit`}
                    className="ws-pro-mini-action"
                  >
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function WorkspaceProCanvas({ boards }: { boards: WorkspaceBoardSummary[] }) {
  return (
    <div className="mx-auto max-w-[1440px] rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ws-pro-view-frame">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-950">
            Pizarras
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Abrí una pizarra para ordenar ideas, flujos o entregables visuales.
          </p>
        </div>
        <Link className="ws-pro-secondary-button" href="/app/boards">
          Biblioteca
        </Link>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {boards.length ? (
          boards.map((board) => (
            <Link
              key={board.id}
              href={`/app/boards/${board.id}`}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-white"
            >
              <p className="font-medium text-slate-950">{board.title}</p>
              <p className="mt-2 text-xs text-slate-500">
                {formatDate(board.updatedAt)}
              </p>
            </Link>
          ))
        ) : (
          <EmptyMicro
            icon={<Sparkles className="h-4 w-4" />}
            title="Aún no hay pizarras"
            text="Creá una pizarra para organizar ideas, procesos o entregables."
          />
        )}
      </div>
    </div>
  );
}
function formatFileSize(value?: number | null) {
  if (!value) return "—";
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function fileKind(file: WorkspaceFileSummary) {
  const mime = String(file.mimeType ?? "").toLowerCase();
  if (mime.startsWith("image/")) return "Imagen";
  if (mime.includes("pdf")) return "PDF";
  if (mime.includes("spreadsheet") || mime.includes("excel")) return "Hoja";
  if (mime.includes("word") || mime.includes("document")) return "Documento";
  return "Archivo";
}

function WorkspaceProFiles({
  files,
  boards,
  projects,
  context,
  permissions,
}: {
  files: WorkspaceFileSummary[];
  boards: WorkspaceBoardSummary[];
  projects: WorkspaceProjectSummary[];
  context: WorkspaceContext;
  permissions: WorkspacePermissionSummary;
}) {
  const imageCount = files.filter((file) =>
    String(file.mimeType ?? "").startsWith("image/"),
  ).length;
  const docCount = files.filter(
    (file) => !String(file.mimeType ?? "").startsWith("image/"),
  ).length;
  return (
    <div className="mx-auto max-w-[1440px] space-y-4 ws-pro-view-frame">
      <div className="grid gap-3 md:grid-cols-4">
        <MetricChip label="Archivos" value={files.length} />
        <MetricChip label="Imágenes" value={imageCount} />
        <MetricChip label="Documentos" value={docCount} />
        <MetricChip label="Pizarras" value={boards.length} />
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <CleanCard title="Archivos del proyecto">
          <div className="mb-4">
            <LazyWorkspaceFilesUploadEntry
              context={context}
              projects={projects}
              canUpload={permissions.canUploadFiles}
            />
          </div>
          {files.length ? (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="grid grid-cols-[minmax(0,1.4fr)_130px_110px_150px_120px] gap-3 border-b border-slate-100 bg-slate-50 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                <span>Archivo</span>
                <span>Tipo</span>
                <span>Tamaño</span>
                <span>Contexto</span>
                <span className="text-right">Acciones</span>
              </div>
              {files.slice(0, 18).map((file) => (
                <WorkspaceProFileRow
                  key={file.id}
                  file={file}
                  canManage={permissions.canUploadFiles}
                />
              ))}
            </div>
          ) : (
            <EmptyMicro
              icon={<Files className="h-4 w-4" />}
              title="Aún no hay archivos"
              text="Subí documentos, imágenes o recursos para tenerlos a mano."
            />
          )}
        </CleanCard>
        <CleanCard title="Pizarras relacionadas">
          {boards.length ? (
            boards.slice(0, 8).map((board) => (
              <div
                key={board.id}
                className="flex items-center justify-between gap-3 border-b border-slate-100 py-3 last:border-b-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-950">
                    {board.title}
                  </p>
                  <p className="text-xs text-slate-400">
                    {formatDate(board.updatedAt ?? board.createdAt)}
                  </p>
                </div>
                <Link
                  href={`/app/boards/${board.id}`}
                  className="ws-pro-mini-action"
                >
                  Abrir
                </Link>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-400">Aún no hay pizarras vinculadas.</p>
          )}
          <Link
            href="/app/boards"
            className="mt-4 inline-flex text-sm font-semibold text-slate-950"
          >
            Biblioteca de pizarras
          </Link>
        </CleanCard>
      </div>
    </div>
  );
}

function WorkspaceProFileRow({
  file,
  canManage,
}: {
  file: WorkspaceFileSummary;
  canManage: boolean;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(file.fileName);
  const [busy, setBusy] = useState(false);
  const href = file.publicUrl ?? "#";
  async function saveName() {
    if (!canManage || !name.trim() || name.trim() === file.fileName) {
      setRenaming(false);
      return;
    }
    setBusy(true);
    const { error } = await supabase
      .from("attachments")
      .update({ file_name: name.trim() })
      .eq("id", file.id)
      .select("id")
      .single();
    setBusy(false);
    if (!error) {
      setRenaming(false);
      router.refresh();
    }
  }
  async function removeFile() {
    if (!canManage) return;
    const ok = window.confirm("¿Eliminar este archivo?");
    if (!ok) return;
    setBusy(true);
    if (file.storagePath)
      await supabase.storage.from("attachments").remove([file.storagePath]);
    const { error } = await supabase
      .from("attachments")
      .delete()
      .eq("id", file.id);
    setBusy(false);
    if (!error) router.refresh();
  }
  return (
    <div className="grid grid-cols-[minmax(0,1.4fr)_130px_110px_150px_120px] items-center gap-3 border-b border-slate-100 px-4 py-3 text-sm last:border-b-0">
      <div className="min-w-0">
        {renaming ? (
          <input
            className="ws-pro-form-input h-9 min-h-0 py-1"
            value={name}
            onChange={(event) => setName(event.target.value)}
            onBlur={saveName}
            onKeyDown={(event) => {
              if (event.key === "Enter") void saveName();
              if (event.key === "Escape") {
                setName(file.fileName);
                setRenaming(false);
              }
            }}
            autoFocus
          />
        ) : (
          <p className="truncate font-semibold text-slate-950">
            {file.fileName}
          </p>
        )}
        <p className="truncate text-xs text-slate-400">
          {formatDate(file.createdAt)}
        </p>
      </div>
      <span className="text-slate-500">{fileKind(file)}</span>
      <span className="text-slate-500">{formatFileSize(file.fileSize)}</span>
      <span className="truncate text-slate-500">
        {file.projectTitle ?? file.taskTitle ?? "Workspace"}
      </span>
      <div className="flex justify-end gap-1">
        {href !== "#" ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="ws-pro-icon-button h-8 w-8 min-h-0 min-w-0"
            title="Abrir"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ) : null}
        {href !== "#" ? (
          <a
            href={href}
            download
            className="ws-pro-icon-button h-8 w-8 min-h-0 min-w-0"
            title="Descargar"
          >
            <Download className="h-3.5 w-3.5" />
          </a>
        ) : null}
        <button
          type="button"
          disabled={!canManage || busy}
          className="ws-pro-icon-button h-8 w-8 min-h-0 min-w-0 disabled:opacity-40"
          onClick={() => setRenaming((value) => !value)}
          title="Renombrar"
        >
          <Edit3 className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          disabled={!canManage || busy}
          className="ws-pro-icon-button h-8 w-8 min-h-0 min-w-0 disabled:opacity-40"
          onClick={removeFile}
          title="Eliminar"
        >
          {busy ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Trash2 className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}

function WorkspaceProReports({
  tasks,
  projects,
  reports,
  derived,
  context,
}: {
  tasks: WorkspaceTaskItem[];
  projects: WorkspaceProjectSummary[];
  reports: ReportsOverview | null;
  derived: WorkspaceProDerivedData;
  context: WorkspaceContext;
}) {
  const [range, setRange] = useState("month");
  const [scope, setScope] = useState(context.projectId ?? "all");
  const { done, important, overdue, progress } = derived.metrics;
  const active = tasks.length - done;
  const reportHref = `/app/reports?source=workspace&range=${range}&projectId=${scope}`;
  const printHref = `/app/reports/print?source=workspace&range=${range}&projectId=${scope}`;
  return (
    <div className="mx-auto max-w-[1440px] space-y-4 ws-pro-view-frame">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <MetricChip label="Progreso" value={`${progress}%`} />
          <MetricChip label="Completadas" value={done} />
          <MetricChip label="Activas" value={active} />
          <MetricChip label="Importantes" value={important} />
          <MetricChip label="Vencidas" value={overdue} />
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            className="ws-pro-select"
            value={range}
            onChange={(event) => setRange(event.target.value)}
          >
            <option value="week">Esta semana</option>
            <option value="month">Este mes</option>
            <option value="quarter">Trimestre</option>
            <option value="all">Todo</option>
          </select>
          <select
            className="ws-pro-select"
            value={scope}
            onChange={(event) => setScope(event.target.value)}
          >
            <option value="all">Todo el trabajo</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.title}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <CleanCard title="Generador de reportes">
          <p className="text-sm leading-6 text-slate-500">
            Generá reportes claros por estado, prioridad, avance y vencimientos.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <ReportAction
              title="Reporte completo"
              text="Abrí el reporte con la selección actual."
              href={reportHref}
              icon={<BarChart3 className="h-4 w-4" />}
            />
            <ReportAction
              title="Vista imprimible"
              text="Prepará una versión lista para imprimir o guardar en PDF."
              href={printHref}
              icon={<FileText className="h-4 w-4" />}
            />
            <ReportAction
              title="Exportar Excel"
              text="Abrí reportes para descargar el archivo."
              href="/app/reports"
              icon={<Download className="h-4 w-4" />}
            />
          </div>
          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h4 className="text-sm font-semibold text-slate-950">
              Métricas incluidas
            </h4>
            <div className="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
              <span>• Progreso y cumplimiento</span>
              <span>• Tareas activas y completadas</span>
              <span>• Prioridad alta / importantes</span>
              <span>• Vencimientos y atrasos</span>
            </div>
          </div>
        </CleanCard>
        <CleanCard title="Resumen actual">
          <ResourceLine
            label="Reportes"
            value={reports ? "Disponible" : "Básico"}
            href="/app/reports"
          />
          <ResourceLine
            label="Proyecto"
            value={
              scope === "all"
                ? "Todo"
                : (projects.find((project) => project.id === scope)?.title ??
                  "Proyecto")
            }
          />
          <ResourceLine label="Rango" value={range} />
          <ResourceLine label="Tareas consideradas" value={`${tasks.length} tareas`} />
        </CleanCard>
      </div>
    </div>
  );
}


const MemoWorkspaceProHome = memo(WorkspaceProHome);
const MemoWorkspaceProList = memo(WorkspaceProList);
const MemoWorkspaceProProjects = memo(WorkspaceProProjects);
const MemoWorkspaceProBoard = memo(WorkspaceProBoard);
const MemoWorkspaceProTimeline = memo(WorkspaceProTimeline);
const MemoWorkspaceProTable = memo(WorkspaceProTable);
const MemoWorkspaceProCanvas = memo(WorkspaceProCanvas);
const MemoWorkspaceProFiles = memo(WorkspaceProFiles);
const MemoWorkspaceProReports = memo(WorkspaceProReports);

function ReportAction({
  title,
  text,
  href,
  icon,
}: {
  title: string;
  text: string;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-sm"
    >
      <span className="mb-3 grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-slate-700">
        {icon}
      </span>
      <b className="block text-sm text-slate-950">{title}</b>
      <span className="mt-1 block text-xs leading-5 text-slate-500">
        {text}
      </span>
    </Link>
  );
}

function WorkspaceProRightPanel({
  activity,
  members,
  notifications,
  derived,
}: {
  tasks: WorkspaceTaskItem[];
  activity: WorkspaceActivityItem[];
  members: WorkspaceMemberSummary[];
  notifications: WorkspaceNotificationSummary;
  derived: WorkspaceProDerivedData;
}) {
  const { progress, important, overdue, today } = derived.metrics;
  const upcoming = derived.upcomingTasks.slice(0, 4);
  return (
    <div className="space-y-4">
      <CleanCard title="Resumen">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">Avance</span>
          <span className="text-sm font-semibold text-slate-950">
            {progress}%
          </span>
        </div>
        <div className="mt-3 h-2 rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-slate-950"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <MiniStat label="Alta" value={important} />
          <MiniStat label="Hoy" value={today} />
          <MiniStat label="Venc." value={overdue} />
        </div>
      </CleanCard>
      <CleanCard title="Próximos">
        {upcoming.length ? (
          upcoming.map((task) => <TaskLine key={task.id} task={task} compact />)
        ) : (
          <p className="text-sm text-slate-400">No hay vencimientos próximos</p>
        )}
      </CleanCard>
      <CleanCard title="Actividad">
        {activity.length ? (
          activity.slice(0, 4).map((item) => (
            <p
              key={item.id}
              className="border-b border-slate-100 py-2 text-sm leading-5 text-slate-500 last:border-b-0"
            >
              <span className="font-medium text-slate-800">{item.title}</span>
              <br />
              <span className="text-xs text-slate-400">
                {formatDate(item.createdAt)}
              </span>
            </p>
          ))
        ) : (
          <p className="text-sm text-slate-400">No hay actividad reciente</p>
        )}
      </CleanCard>
      <CleanCard title="Equipo">
        <div className="flex -space-x-2">
          {members.slice(0, 6).map((member) => (
            <span
              key={member.id}
              className="grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-slate-100 text-[11px] font-semibold text-slate-600"
            >
              {initials(member.name ?? member.email)}
            </span>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-500">
          {notifications.unread
            ? `${notifications.unread} notificaciones sin leer.`
            : "Sin alertas pendientes."}
        </p>
      </CleanCard>
    </div>
  );
}

function WorkspaceProSheet({
  title,
  onClose,
  wide,
  children,
}: {
  title: string;
  onClose: () => void;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-40">
      <button
        type="button"
        aria-label="Cerrar panel"
        className="absolute inset-0 bg-slate-950/20 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <section
        className={`absolute right-3 top-3 flex max-h-[calc(100vh-1.5rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl ${wide ? "w-[min(1120px,calc(100vw-1.5rem))]" : "w-[min(560px,calc(100vw-1.5rem))]"}`}
      >
        <header className="shrink-0 flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-950">{title}</h2>
          <button
            type="button"
            className="ws-pro-icon-button h-8 w-8"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="min-h-0 overflow-y-auto p-4 ws-pro-hide-scrollbar">
          {children}
        </div>
      </section>
    </div>
  );
}

function WorkspaceProInspector({
  onClose,
  children,
}: {
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-40">
      <button
        type="button"
        aria-label="Cerrar inspector"
        className="absolute inset-0 bg-slate-950/20 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <aside className="absolute right-3 top-3 h-[calc(100vh-1.5rem)] w-[min(360px,calc(100vw-1.5rem))] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl ws-pro-hide-scrollbar">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-950">Inspector</h2>
          <button
            type="button"
            className="ws-pro-icon-button h-8 w-8"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </aside>
    </div>
  );
}
function MetricChip({
  label,
  value,
  tone = "slate",
}: {
  label: string;
  value: string | number;
  tone?: "slate" | "rose" | "blue";
}) {
  const cls =
    tone === "rose"
      ? "text-rose-600"
      : tone === "blue"
        ? "text-blue-600"
        : "text-slate-950";
  return (
    <span className="inline-flex h-8 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-xs text-slate-500">
      <b className={`font-semibold ${cls}`}>{value}</b>
      {label}
    </span>
  );
}
function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-slate-50 px-2 py-2">
      <p className="text-sm font-semibold text-slate-950">{value}</p>
      <p className="text-[11px] text-slate-500">{label}</p>
    </div>
  );
}
function CleanCard({
  title,
  action,
  className = "",
  children,
}: {
  title: string;
  action?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`ws-pro-clean-card rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ${className}`}
    >
      <header className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
        {action ? (
          <span className="rounded-full bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-400">
            {action}
          </span>
        ) : null}
      </header>
      {children}
    </section>
  );
}
function TaskLine({
  task,
  subtleDate = false,
  compact = false,
  href,
}: {
  task: WorkspaceTaskItem;
  subtleDate?: boolean;
  compact?: boolean;
  href?: string;
}) {
  const content = (
    <>
      <div className="min-w-0">
        <p
          className={
            compact
              ? "truncate text-sm font-medium text-slate-800"
              : "truncate text-sm font-medium text-slate-950"
          }
        >
          {task.title}
        </p>
        <p className="mt-0.5 truncate text-xs text-slate-400">
          {task.projectTitle ??
            task.clientName ??
            task.departmentName ??
            "Tarea individual"}
        </p>
      </div>
      <span
        className={
          subtleDate
            ? "shrink-0 text-xs text-slate-400"
            : "shrink-0 text-xs font-medium text-slate-500"
        }
      >
        {formatDate(task.dueDate)}
      </span>
    </>
  );
  const cls =
    "flex items-start justify-between gap-3 border-b border-slate-100 py-2.5 transition last:border-b-0 hover:bg-slate-50";
  return href ? (
    <Link href={href} className={cls}>
      {content}
    </Link>
  ) : (
    <div className={cls}>{content}</div>
  );
}
function ProjectLine({ project }: { project: WorkspaceProjectSummary }) {
  return (
    <Link
      href={`/app/workspace?projectId=${project.id}`}
      className="flex items-center justify-between gap-3 border-b border-slate-100 py-2.5 transition last:border-b-0 hover:bg-slate-50"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-slate-950">
          {project.title}
        </p>
        <p className="mt-0.5 truncate text-xs text-slate-400">
          {project.taskTotal} tareas · {formatDate(project.dueDate)}
        </p>
      </div>
      <span className="shrink-0 text-xs font-semibold text-slate-500">
        {project.progress}%
      </span>
    </Link>
  );
}
function WorkspaceProUtilityDock({
  boards,
  today,
  overdue,
}: {
  boards: WorkspaceBoardSummary[];
  today: number;
  overdue: number;
}) {
  const current = new Date();
  return (
    <aside className="ws-pro-utility-dock space-y-4">
      <CleanCard title="Hoy" className="ws-pro-card-tone-blue">
        <p className="text-2xl font-semibold tracking-[-0.04em] text-slate-950">
          {current.toLocaleDateString("es-CR", { day: "2-digit" })}
        </p>
        <p className="mt-1 text-sm text-slate-500">
          {current.toLocaleDateString("es-CR", {
            weekday: "long",
            month: "long",
          })}
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <MiniStat label="Hoy" value={today} />
          <MiniStat label="Venc." value={overdue} />
        </div>
      </CleanCard>
      <CleanCard title="Nota rápida" className="ws-pro-card-tone-violet">
        <textarea
          className="min-h-[96px] w-full resize-none rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 outline-none transition focus:border-slate-300 focus:bg-white"
          placeholder="Escribí un recordatorio temporal..."
        />
      </CleanCard>
      <CleanCard title="Acciones rápidas" className="ws-pro-card-tone-emerald">
        <div className="grid gap-2">
          <Link href="/app/boards" className="ws-pro-mini-action">
            Crear / abrir pizarra
          </Link>
          <Link href="/app/workspace?view=files" className="ws-pro-mini-action">
            Ver archivos
          </Link>
          <Link href="/app/reminders" className="ws-pro-mini-action">
            Recordatorios
          </Link>
          {boards[0] ? (
            <Link
              href={`/app/boards/${boards[0].id}`}
              className="ws-pro-mini-action"
            >
              Última pizarra
            </Link>
          ) : null}
        </div>
      </CleanCard>
    </aside>
  );
}
function ResourceLine({
  label,
  value,
  href,
}: {
  label: string;
  value: string | number;
  href?: string;
}) {
  const content = (
    <>
      <span className="truncate text-sm font-medium text-slate-800">
        {label}
      </span>
      <span className="shrink-0 text-xs text-slate-400">{value}</span>
    </>
  );
  const cls =
    "flex items-center justify-between gap-3 border-b border-slate-100 py-2.5 last:border-b-0";
  return href ? (
    <Link href={href} className={cls}>
      {content}
    </Link>
  ) : (
    <div className={cls}>{content}</div>
  );
}
function EmptyMicro({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
        {icon}
        {title}
      </div>
      <p className="mt-1 text-sm text-slate-500">{text}</p>
    </div>
  );
}
