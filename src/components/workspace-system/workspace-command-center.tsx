"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  CalendarRange,
  Columns3,
  Command,
  FileArchive,
  Folder,
  Home,
  LayoutGrid,
  List,
  Plus,
  Search,
  Sparkles,
  Table2,
  X,
} from "lucide-react";
import type {
  WorkspaceBoardSummary,
  WorkspaceContext,
  WorkspaceFileSummary,
  WorkspacePermissionSummary,
  WorkspaceProjectSummary,
  WorkspaceProjectViewPreference,
  WorkspaceSpaceSummary,
  WorkspaceTaskItem,
  WorkspaceViewId,
} from "@/lib/workspace-system/view-state";

type CommandItemKind = "action" | "view" | "project" | "space" | "saved_view" | "task" | "board" | "file";

type CommandItem = {
  id: string;
  kind: CommandItemKind;
  label: string;
  description: string;
  keywords: string;
  icon: typeof Search;
  href?: string;
  disabled?: boolean;
  disabledReason?: string;
  onRun?: () => void;
};

const viewIcons: Record<WorkspaceViewId, typeof Search> = {
  home: Home,
  list: List,
  board: Columns3,
  timeline: CalendarRange,
  table: Table2,
  canvas: LayoutGrid,
  files: FileArchive,
  reports: BarChart3,
};

const viewLabels: Record<WorkspaceViewId, string> = {
  home: "Home del proyecto",
  list: "Lista de tareas",
  board: "Board Kanban",
  timeline: "Timeline",
  table: "Tabla operativa",
  canvas: "Canvas / Pizarras",
  files: "Archivos",
  reports: "Reportes",
};

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function workspaceHref(params: URLSearchParams, updates: Record<string, string | null | undefined>) {
  const next = new URLSearchParams(params.toString());
  for (const [key, value] of Object.entries(updates)) {
    if (value) next.set(key, value);
    else next.delete(key);
  }
  const query = next.toString();
  return query ? `/app/workspace?${query}` : "/app/workspace";
}

function commandKindLabel(kind: CommandItemKind) {
  const map: Record<CommandItemKind, string> = {
    action: "Acción",
    view: "Vista",
    project: "Proyecto",
    space: "Espacio",
    saved_view: "Vista guardada",
    task: "Tarea",
    board: "Pizarra",
    file: "Archivo",
  };
  return map[kind];
}

export function WorkspaceCommandCenter({
  open,
  onOpenChange,
  context,
  tasks,
  projects,
  spaces,
  boards,
  files,
  projectViews,
  permissions,
  onQuickCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context: WorkspaceContext;
  tasks: WorkspaceTaskItem[];
  projects: WorkspaceProjectSummary[];
  spaces: WorkspaceSpaceSummary[];
  boards: WorkspaceBoardSummary[];
  files: WorkspaceFileSummary[];
  projectViews: WorkspaceProjectViewPreference[];
  permissions: WorkspacePermissionSummary;
  onQuickCreate: () => void;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const wantsCommand = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      if (!wantsCommand) return;
      event.preventDefault();
      onOpenChange(!open);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onOpenChange, open]);

  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(id);
  }, [open]);

  const items = useMemo<CommandItem[]>(() => {
    const activeSpace = context.activeFilters?.space ?? null;
    const activeProjectId = context.projectId ?? context.activeFilters?.projectId ?? null;
    const base: CommandItem[] = [
      {
        id: "action:create-task",
        kind: "action",
        label: "Crear tarea rápida",
        description: activeProjectId ? "Agrega una tarea dentro del proyecto activo." : "Abre el quick create del workspace.",
        keywords: "crear nueva tarea quick create add task",
        icon: Plus,
        disabled: !permissions.canCreateTask,
        disabledReason: "No tenés permiso para crear tareas en este contexto.",
        onRun: onQuickCreate,
      },
      {
        id: "action:ai-context",
        kind: "action",
        label: "Revisar señales de IA contextual",
        description: "Abre el panel de resumen para detectar bloqueos, vencimientos y actividad.",
        keywords: "ia inteligencia bloqueos vencimientos sugerencias automatizar",
        icon: Sparkles,
        href: workspaceHref(params, { view: context.activeFilters?.view ?? "home" }),
      },
    ];

    const viewItems: CommandItem[] = (Object.keys(viewLabels) as WorkspaceViewId[]).map((view) => ({
      id: `view:${view}`,
      kind: "view",
      label: viewLabels[view],
      description: `Cambiar el centro del workspace a ${viewLabels[view]}.`,
      keywords: `${view} ${viewLabels[view]} vista tab workspace`,
      icon: viewIcons[view],
      href: workspaceHref(params, { view, savedViewId: null }),
    }));

    const projectItems = projects.slice(0, 30).map<CommandItem>((project) => ({
      id: `project:${project.id}`,
      kind: "project",
      label: project.title,
      description: `${project.taskTotal} tareas · ${project.status ?? "activo"}`,
      keywords: `${project.title} proyecto ${project.clientName ?? ""} ${project.departmentName ?? ""}`,
      icon: Folder,
      href: workspaceHref(params, { view: "home", projectId: project.id, savedViewId: null }),
    }));

    const spaceItems = spaces.slice(0, 20).map<CommandItem>((space) => ({
      id: `space:${space.id}`,
      kind: "space",
      label: space.name,
      description: `${space.projectCount} proyectos · ${space.taskCount} tareas${space.isPersisted ? " · Persistido" : ""}`,
      keywords: `${space.name} espacio folder area ${space.source}`,
      icon: Folder,
      href: workspaceHref(params, { view: "home", space: space.slug, projectId: null, savedViewId: null }),
    }));

    const savedViewItems = projectViews.slice(0, 20).map<CommandItem>((view) => ({
      id: `saved-view:${view.id}`,
      kind: "saved_view",
      label: view.title,
      description: `${viewLabels[view.viewType]}${view.isDefault ? " · Default" : ""}`,
      keywords: `${view.title} vista guardada saved default ${view.viewType}`,
      icon: viewIcons[view.viewType],
      href: workspaceHref(params, { view: view.viewType, savedViewId: view.id }),
    }));

    const taskItems = tasks.slice(0, 40).map<CommandItem>((task) => ({
      id: `task:${task.id}`,
      kind: "task",
      label: task.title,
      description: `${task.projectTitle ?? "Sin proyecto"} · ${task.status} · ${task.dueDate ?? "Sin fecha"}`,
      keywords: `${task.title} tarea ${task.projectTitle ?? ""} ${task.status} ${task.priority ?? ""}`,
      icon: List,
      href: workspaceHref(params, { view: "list", projectId: task.projectId ?? activeProjectId, savedViewId: null }),
    }));

    const boardItems = boards.slice(0, 24).map<CommandItem>((board) => ({
      id: `board:${board.id}`,
      kind: "board",
      label: board.title,
      description: board.projectTitle ? `Pizarra de ${board.projectTitle}` : "Pizarra del workspace",
      keywords: `${board.title} pizarra canvas board ${board.projectTitle ?? ""}`,
      icon: LayoutGrid,
      href: `/app/boards/${board.id}`,
    }));

    const fileItems = files.slice(0, 24).map<CommandItem>((file) => ({
      id: `file:${file.id}`,
      kind: "file",
      label: file.fileName,
      description: `${file.projectTitle ?? "Workspace"} · ${file.mimeType ?? "archivo"}`,
      keywords: `${file.fileName} archivo file adjunto ${file.projectTitle ?? ""} ${file.taskTitle ?? ""}`,
      icon: FileArchive,
      href: file.publicUrl ?? workspaceHref(params, { view: "files", space: activeSpace, projectId: file.projectId ?? activeProjectId }),
    }));

    return [...base, ...viewItems, ...savedViewItems, ...spaceItems, ...projectItems, ...taskItems, ...boardItems, ...fileItems];
  }, [boards, context.activeFilters?.space, context.activeFilters?.view, context.projectId, files, onQuickCreate, params, permissions.canCreateTask, projectViews, projects, spaces, tasks]);

  const filteredItems = useMemo(() => {
    const q = normalize(query.trim());
    const result = q
      ? items.filter((item) => normalize(`${item.label} ${item.description} ${item.keywords}`).includes(q))
      : items;
    return result.slice(0, 18);
  }, [items, query]);

  useEffect(() => setActiveIndex(0), [query, open]);

  function runItem(item: CommandItem) {
    if (item.disabled) return;
    if (item.onRun) item.onRun();
    if (item.href) {
      if (item.href.startsWith("/app/")) router.replace(item.href, { scroll: false });
      else window.open(item.href, "_blank", "noopener,noreferrer");
    }
    onOpenChange(false);
    setQuery("");
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70]">
      <button type="button" className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm" aria-label="Cerrar búsqueda" onClick={() => onOpenChange(false)} />
      <section className="ft-ws-command-palette absolute left-1/2 top-6 w-[min(92vw,760px)] -translate-x-1/2 overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-[0_30px_90px_rgba(15,23,42,.28)]">
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
          <Search className="h-5 w-5 text-slate-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") onOpenChange(false);
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setActiveIndex((value) => Math.min(value + 1, filteredItems.length - 1));
              }
              if (event.key === "ArrowUp") {
                event.preventDefault();
                setActiveIndex((value) => Math.max(value - 1, 0));
              }
              if (event.key === "Enter" && filteredItems[activeIndex]) {
                event.preventDefault();
                runItem(filteredItems[activeIndex]);
              }
            }}
            className="h-11 flex-1 bg-transparent text-base font-bold text-slate-950 outline-none placeholder:text-slate-400"
            placeholder="Buscar tareas, proyectos, espacios, vistas, pizarras o acciones..."
          />
          <span className="hidden rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-black text-slate-500 sm:inline-flex">⌘K</span>
          <button type="button" onClick={() => onOpenChange(false)} className="grid h-9 w-9 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-3 ft-ws-scroll">
          {filteredItems.length ? filteredItems.map((item, index) => {
            const Icon = item.icon;
            const active = index === activeIndex;
            return (
              <button
                key={item.id}
                type="button"
                disabled={item.disabled}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => runItem(item)}
                className={active ? "ft-ws-command-item ft-ws-command-item-active" : "ft-ws-command-item"}
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[16px] bg-slate-100 text-slate-600"><Icon className="h-4 w-4" /></span>
                <span className="min-w-0 flex-1 text-left">
                  <span className="flex items-center gap-2">
                    <b className="truncate text-sm text-slate-950">{item.label}</b>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-[.12em] text-slate-500">{commandKindLabel(item.kind)}</span>
                  </span>
                  <span className="mt-0.5 block truncate text-xs font-semibold text-slate-500">{item.disabled ? item.disabledReason : item.description}</span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
              </button>
            );
          }) : (
            <div className="rounded-[22px] border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">
              <Command className="mx-auto h-8 w-8 text-slate-400" />
              <p className="mt-3 text-sm font-black text-slate-800">Sin resultados en este workspace</p>
              <p className="mt-1 text-sm font-semibold text-slate-500">Probá buscar por nombre de tarea, proyecto, espacio, pizarra o vista guardada.</p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3 text-[11px] font-black uppercase tracking-[.12em] text-slate-500">
          <span>↑↓ navegar · Enter abrir · Esc cerrar</span>
          <span>{filteredItems.length} resultados</span>
        </div>
      </section>
    </div>
  );
}
