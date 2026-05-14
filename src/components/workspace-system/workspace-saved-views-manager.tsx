"use client";

// v58.25.9.3 Workspace Saved Views Defaults + Filters Persistence

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Eye,
  Loader2,
  Pencil,
  Save,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type {
  WorkspaceContext,
  WorkspacePersistenceGuardStatus,
  WorkspaceProjectViewPreference,
  WorkspaceViewId,
} from "@/lib/workspace-system/view-state";

const viewLabels: Record<WorkspaceViewId, string> = {
  list: "Lista",
  board: "Board",
  timeline: "Timeline",
  table: "Tabla",
  canvas: "Canvas",
  files: "Archivos",
  reports: "Reportes",
};

type Feedback = { tone: "success" | "error"; text: string } | null;

function buildDefaultTitle(
  view: WorkspaceViewId,
  existing: WorkspaceProjectViewPreference[],
) {
  const base = viewLabels[view] ?? "Vista";
  const count = existing.filter((item) => item.viewType === view).length;
  return count ? `${base} ${count + 1}` : `${base} principal`;
}

function getPersistedFilters(view: WorkspaceProjectViewPreference) {
  const filters = view.config?.filters;
  return filters && typeof filters === "object" ? filters : {};
}

function applySavedViewParams(
  next: URLSearchParams,
  view: WorkspaceProjectViewPreference,
  context: WorkspaceContext,
) {
  const filters = getPersistedFilters(view);
  next.set("view", view.viewType);
  next.set("savedViewId", view.id);
  if (context.projectId) next.set("projectId", context.projectId);

  const status = filters.status ?? null;
  const groupBy = filters.groupBy ?? null;
  const sort = filters.sort ?? null;
  const space = filters.space ?? null;
  const columns = Array.isArray(filters.columns)
    ? filters.columns.filter(Boolean).join(",")
    : "";

  if (space) next.set("space", String(space));
  else next.delete("space");
  if (status) next.set("status", String(status));
  else next.delete("status");
  if (groupBy && groupBy !== "status") next.set("groupBy", String(groupBy));
  else next.delete("groupBy");
  if (sort && sort !== "updated") next.set("sort", String(sort));
  else next.delete("sort");
  if (columns) next.set("columns", columns);
  else next.delete("columns");
}

export function WorkspaceSavedViewsManager({
  activeView,
  context,
  projectViews,
  persistenceStatus,
  onClose,
}: {
  activeView: WorkspaceViewId;
  context: WorkspaceContext;
  projectViews: WorkspaceProjectViewPreference[];
  persistenceStatus: WorkspacePersistenceGuardStatus;
  onClose?: () => void;
}) {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const params = useSearchParams();
  const [title, setTitle] = useState(
    buildDefaultTitle(activeView, projectViews),
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const canPersist =
    Boolean(context.projectId) && persistenceStatus.projectViewsReady;
  const sortedViews = [...projectViews].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title),
  );

  function openView(view: WorkspaceProjectViewPreference) {
    const next = new URLSearchParams(params.toString());
    applySavedViewParams(next, view, context);
    router.replace(`/app/workspace?${next.toString()}`, { scroll: false });
  }

  async function saveCurrentView() {
    if (!persistenceStatus.projectViewsReady) {
      setFeedback({
        tone: "error",
        text:
          persistenceStatus.message ||
          "Aplica la migración 0056 antes de guardar vistas.",
      });
      return;
    }

    if (!context.projectId) {
      setFeedback({
        tone: "error",
        text: "Selecciona un proyecto para guardar vistas persistidas.",
      });
      return;
    }

    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setFeedback({ tone: "error", text: "Escribe un nombre para la vista." });
      return;
    }

    setBusy("create");
    setFeedback(null);
    const { data: auth } = await supabase.auth.getUser();
    const payload = {
      project_id: context.projectId,
      view_type: activeView,
      title: cleanTitle,
      config: {
        source: "workspace_saved_views_manager",
        filters: {
          view: activeView,
          space: context.activeFilters?.space ?? null,
          projectId: context.projectId,
          status: context.activeFilters?.status ?? null,
          groupBy: context.activeFilters?.groupBy ?? "status",
          sort: context.activeFilters?.sort ?? "updated",
          columns: context.activeFilters?.columns ?? [],
        },
        saved_at: new Date().toISOString(),
      },
      is_default: false,
      sort_order: projectViews.length + 1,
      created_by: auth.user?.id ?? null,
    };

    const { error } = await supabase
      .from("project_views")
      .insert(payload)
      .select("id")
      .single();
    setBusy(null);

    if (error) {
      setFeedback({
        tone: "error",
        text: error.message || "No se pudo guardar la vista.",
      });
      return;
    }

    setFeedback({ tone: "success", text: "Vista guardada correctamente." });
    setTitle(
      buildDefaultTitle(activeView, [
        ...projectViews,
        {
          id: "temp",
          projectId: context.projectId,
          viewType: activeView,
          title: cleanTitle,
          config: {},
          isDefault: false,
          sortOrder: projectViews.length + 1,
        },
      ]),
    );
    router.refresh();
  }

  async function renameView(viewId: string) {
    const cleanTitle = editingTitle.trim();
    if (!cleanTitle) {
      setFeedback({
        tone: "error",
        text: "El nombre de la vista no puede quedar vacío.",
      });
      return;
    }

    setBusy(`rename:${viewId}`);
    setFeedback(null);
    const { error } = await supabase
      .from("project_views")
      .update({ title: cleanTitle })
      .eq("id", viewId)
      .select("id")
      .single();
    setBusy(null);

    if (error) {
      setFeedback({
        tone: "error",
        text: error.message || "No se pudo renombrar la vista.",
      });
      return;
    }

    setEditingId(null);
    setEditingTitle("");
    setFeedback({ tone: "success", text: "Vista renombrada." });
    router.refresh();
  }

  async function setDefaultView(view: WorkspaceProjectViewPreference) {
    if (!context.projectId) return;
    setBusy(`default:${view.id}`);
    setFeedback(null);

    const { error: clearError } = await supabase
      .from("project_views")
      .update({ is_default: false })
      .eq("project_id", context.projectId)
      .eq("view_type", view.viewType);

    if (clearError) {
      setBusy(null);
      setFeedback({
        tone: "error",
        text:
          clearError.message ||
          "No se pudo limpiar la vista predeterminada anterior.",
      });
      return;
    }

    const { error } = await supabase
      .from("project_views")
      .update({ is_default: true })
      .eq("id", view.id)
      .select("id")
      .single();
    setBusy(null);

    if (error) {
      setFeedback({
        tone: "error",
        text: error.message || "No se pudo marcar como default.",
      });
      return;
    }

    setFeedback({
      tone: "success",
      text: "Vista marcada como predeterminada.",
    });
    router.refresh();
  }

  async function deleteView(viewId: string) {
    setBusy(`delete:${viewId}`);
    setFeedback(null);
    const { error } = await supabase
      .from("project_views")
      .delete()
      .eq("id", viewId);
    setBusy(null);

    if (error) {
      setFeedback({
        tone: "error",
        text: error.message || "No se pudo eliminar la vista.",
      });
      return;
    }

    setFeedback({ tone: "success", text: "Vista eliminada." });
    router.refresh();
  }

  return (
    <section className="ft-ws-saved-views-manager ft-ws-enter">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[.18em] text-emerald-600">
            Vistas guardadas
          </p>
          <h3 className="mt-1 text-lg font-black tracking-[-.03em] text-slate-950">
            Saved Views Manager
          </h3>
          <p className="mt-1 max-w-3xl text-sm font-semibold text-slate-500">
            Guarda configuraciones de Lista, Board, Timeline, Tabla, Canvas,
            Archivos o Reportes dentro del proyecto activo sin reemplazar las
            rutas actuales.
          </p>
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="ft-ws-control h-10 px-3 text-xs font-black"
          >
            <X className="h-4 w-4" /> Cerrar
          </button>
        ) : null}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(300px,420px)]">
        <div className="rounded-[22px] border border-slate-200/80 bg-white/82 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <input
              className="ft-ws-saved-view-input"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              disabled={!canPersist || busy === "create"}
              placeholder="Nombre de la vista"
            />
            <button
              type="button"
              onClick={() => void saveCurrentView()}
              disabled={!canPersist || busy === "create"}
              className="ft-ws-active h-11 rounded-[16px] px-5 text-sm font-extrabold disabled:cursor-not-allowed disabled:opacity-55"
            >
              {busy === "create" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Guardar {viewLabels[activeView] ?? activeView}
            </button>
          </div>
          <p className="mt-3 rounded-[16px] bg-slate-50 px-3 py-2 text-xs font-bold text-slate-500">
            Proyecto actual:{" "}
            <b className="text-slate-800">
              {context.projectTitle ?? "Sin proyecto"}
            </b>{" "}
            · Vista activa:{" "}
            <b className="text-emerald-700">{viewLabels[activeView]}</b>
          </p>
          {!persistenceStatus.projectViewsReady ? (
            <p className="mt-3 rounded-[16px] bg-amber-50 px-3 py-2 text-sm font-bold text-amber-700">
              Migration Guard: {persistenceStatus.message}
            </p>
          ) : !context.projectId ? (
            <p className="mt-3 rounded-[16px] bg-amber-50 px-3 py-2 text-sm font-bold text-amber-700">
              Selecciona un proyecto desde la sidebar para habilitar guardado de
              vistas persistidas.
            </p>
          ) : null}
          {feedback ? (
            <p
              className={
                feedback.tone === "success"
                  ? "mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700"
                  : "mt-3 rounded-[14px] bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700"
              }
            >
              {feedback.tone === "success" ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : null}
              {feedback.text}
            </p>
          ) : null}
        </div>

        <div className="rounded-[22px] border border-emerald-100 bg-emerald-50/55 p-4">
          <p className="text-sm font-black text-emerald-800">Cómo se usa</p>
          <p
            className={
              persistenceStatus.enabled
                ? "mt-2 rounded-[14px] bg-white/70 px-3 py-2 text-xs font-black text-emerald-700"
                : "mt-2 rounded-[14px] bg-amber-100 px-3 py-2 text-xs font-black text-amber-800"
            }
          >
            Migration Guard: {persistenceStatus.status} ·{" "}
            {persistenceStatus.projectViewsReady
              ? "project_views OK"
              : "project_views pendiente"}
          </p>
          <ul className="mt-2 space-y-1 text-xs font-bold text-emerald-700">
            <li>• Guarda la vista activa con filtros/contexto.</li>
            <li>• Renombra vistas sin tocar la data real.</li>
            <li>• Marca una vista como predeterminada por tipo.</li>
            <li>• Abre una vista guardada sin salir del workspace.</li>
          </ul>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
        {sortedViews.length ? (
          sortedViews.map((view) => {
            const isBusy = busy?.endsWith(view.id);
            const isEditing = editingId === view.id;
            return (
              <article key={view.id} className="ft-ws-saved-view-card" data-active={context.activeSavedView?.id === view.id ? "true" : "false"}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="ft-ws-saved-view-type">
                      {viewLabels[view.viewType] ?? view.viewType}
                    </span>
                    {isEditing ? (
                      <input
                        className="ft-ws-saved-view-title-input"
                        value={editingTitle}
                        onChange={(event) =>
                          setEditingTitle(event.target.value)
                        }
                        autoFocus
                      />
                    ) : (
                      <h4 className="mt-2 truncate text-base font-black text-slate-950">
                        {view.title}
                      </h4>
                    )}
                    <p className="mt-1 text-xs font-bold text-slate-500">
                      Orden {view.sortOrder} ·{" "}
                      {view.isDefault ? "Predeterminada" : "Guardada"}
                    </p>
                    <p className="ft-ws-saved-view-filter-summary">
                      {getPersistedFilters(view).status
                        ? `Estado: ${getPersistedFilters(view).status}`
                        : "Estado: todos"}{" "}
                      ·{" "}
                      {getPersistedFilters(view).groupBy
                        ? `Grupo: ${getPersistedFilters(view).groupBy}`
                        : "Grupo: status"}{" "}
                      ·{" "}
                      {getPersistedFilters(view).sort
                        ? `Orden: ${getPersistedFilters(view).sort}`
                        : "Orden: updated"}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    {view.isDefault ? (
                      <span className="ft-ws-saved-view-default">
                        <Star className="h-3.5 w-3.5" /> Default
                      </span>
                    ) : null}
                    {context.activeSavedView?.id === view.id ? (
                      <span className="ft-ws-saved-view-active-pill">Activa</span>
                    ) : null}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => openView(view)}
                    className="ft-ws-saved-view-action"
                  >
                    <Eye className="h-3.5 w-3.5" /> Abrir
                  </button>
                  {isEditing ? (
                    <button
                      type="button"
                      onClick={() => void renameView(view.id)}
                      disabled={isBusy}
                      className="ft-ws-saved-view-action text-emerald-700"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Guardar
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(view.id);
                        setEditingTitle(view.title);
                      }}
                      className="ft-ws-saved-view-action"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Renombrar
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => void setDefaultView(view)}
                    disabled={isBusy || view.isDefault}
                    className="ft-ws-saved-view-action"
                  >
                    <Star className="h-3.5 w-3.5" /> Default
                  </button>
                  <button
                    type="button"
                    onClick={() => void deleteView(view.id)}
                    disabled={isBusy}
                    className="ft-ws-saved-view-action text-rose-700"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Eliminar
                  </button>
                </div>
              </article>
            );
          })
        ) : (
          <div className="rounded-[22px] border border-dashed border-slate-300 bg-white/70 p-6 text-sm font-bold text-slate-500 md:col-span-2 2xl:col-span-3">
            No hay vistas guardadas para este proyecto todavía. Guarda la vista
            activa para empezar a personalizar el workspace.
          </div>
        )}
      </div>
    </section>
  );
}
