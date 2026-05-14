"use client";

// v58.25.9.4 Workspace Spaces Manager + Project Organization

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, CheckCircle2, FolderPlus, Loader2, Pencil, Plus, Save, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { slugifyWorkspaceValue } from "@/lib/workspace-system/adapters";
import type {
  WorkspaceContext,
  WorkspacePersistenceGuardStatus,
  WorkspaceProjectSpaceAssignment,
  WorkspaceProjectSummary,
  WorkspaceSpaceSummary,
} from "@/lib/workspace-system/view-state";

type Feedback = { tone: "success" | "error"; text: string } | null;

const spaceColors = ["#16C784", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444"];
const spaceIcons = ["folder", "briefcase", "target", "sparkles", "layers"];

export function WorkspaceSpacesManager({
  context,
  spaces,
  projects,
  assignments,
  persistenceStatus,
  onClose,
}: {
  context: WorkspaceContext;
  spaces: WorkspaceSpaceSummary[];
  projects: WorkspaceProjectSummary[];
  assignments: WorkspaceProjectSpaceAssignment[];
  persistenceStatus: WorkspacePersistenceGuardStatus;
  onClose?: () => void;
}) {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const persistedSpaces = spaces.filter((space) => space.isPersisted);
  const canWriteSpaces = persistenceStatus.workspaceSpacesReady;
  const canLinkProjects = persistenceStatus.workspaceSpacesReady && Boolean(persistenceStatus.projectSpaceLinksReady);
  const [name, setName] = useState("");
  const [color, setColor] = useState(spaceColors[0]);
  const [icon, setIcon] = useState(spaceIcons[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const assignedProjectIds = new Set(assignments.map((item) => item.projectId));
  const projectById = new Map(projects.map((project) => [project.id, project]));

  function projectsForSpace(spaceId: string) {
    return assignments
      .filter((item) => item.spaceId === spaceId)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((item) => projectById.get(item.projectId))
      .filter((project): project is WorkspaceProjectSummary => Boolean(project));
  }

  async function createSpace() {
    const cleanName = name.trim();
    if (!canWriteSpaces) {
      setFeedback({ tone: "error", text: "Aplica las migraciones 0056/0057 antes de crear espacios reales." });
      return;
    }
    if (!cleanName) {
      setFeedback({ tone: "error", text: "Escribe un nombre para el espacio." });
      return;
    }

    setBusy("create");
    setFeedback(null);
    const { data: auth } = await supabase.auth.getUser();
    const payload = {
      user_id: context.mode === "personal" ? (context.userId ?? auth.user?.id ?? null) : null,
      organization_id: context.mode === "organization" ? (context.organizationId ?? null) : null,
      name: cleanName,
      slug: slugifyWorkspaceValue(cleanName),
      color,
      icon,
      sort_order: persistedSpaces.length + 1,
    };

    const { error } = await supabase.from("workspace_spaces").insert(payload).select("id").single();
    setBusy(null);

    if (error) {
      setFeedback({ tone: "error", text: error.message || "No se pudo crear el espacio." });
      return;
    }

    setName("");
    setFeedback({ tone: "success", text: "Espacio creado correctamente." });
    router.refresh();
  }

  async function renameSpace(spaceId: string) {
    const cleanName = editingName.trim();
    if (!cleanName) {
      setFeedback({ tone: "error", text: "El nombre del espacio no puede quedar vacío." });
      return;
    }

    setBusy(`rename:${spaceId}`);
    setFeedback(null);
    const { error } = await supabase
      .from("workspace_spaces")
      .update({ name: cleanName, slug: slugifyWorkspaceValue(cleanName) })
      .eq("id", spaceId)
      .select("id")
      .single();
    setBusy(null);

    if (error) {
      setFeedback({ tone: "error", text: error.message || "No se pudo renombrar el espacio." });
      return;
    }

    setEditingId(null);
    setEditingName("");
    setFeedback({ tone: "success", text: "Espacio actualizado." });
    router.refresh();
  }

  async function archiveSpace(spaceId: string) {
    setBusy(`archive:${spaceId}`);
    setFeedback(null);
    const { error } = await supabase
      .from("workspace_spaces")
      .update({ is_archived: true })
      .eq("id", spaceId)
      .select("id")
      .single();
    setBusy(null);

    if (error) {
      setFeedback({ tone: "error", text: error.message || "No se pudo archivar el espacio." });
      return;
    }

    setFeedback({ tone: "success", text: "Espacio archivado. Sus proyectos vuelven al workspace general." });
    router.refresh();
  }

  async function assignProject(spaceId: string, projectId: string) {
    if (!projectId) return;
    if (!canLinkProjects) {
      setFeedback({ tone: "error", text: "Aplica la migración 0057 para organizar proyectos dentro de espacios." });
      return;
    }

    setBusy(`assign:${spaceId}`);
    setFeedback(null);
    await supabase.from("workspace_space_projects").delete().eq("project_id", projectId);
    const { error } = await supabase
      .from("workspace_space_projects")
      .insert({ space_id: spaceId, project_id: projectId, sort_order: projectsForSpace(spaceId).length + 1 })
      .select("id")
      .single();
    setBusy(null);

    if (error) {
      setFeedback({ tone: "error", text: error.message || "No se pudo asignar el proyecto." });
      return;
    }

    setFeedback({ tone: "success", text: "Proyecto asignado al espacio." });
    router.refresh();
  }

  async function removeProject(projectId: string) {
    setBusy(`remove:${projectId}`);
    setFeedback(null);
    const { error } = await supabase.from("workspace_space_projects").delete().eq("project_id", projectId);
    setBusy(null);

    if (error) {
      setFeedback({ tone: "error", text: error.message || "No se pudo quitar el proyecto del espacio." });
      return;
    }

    setFeedback({ tone: "success", text: "Proyecto removido del espacio." });
    router.refresh();
  }

  return (
    <section className="ft-ws-spaces-manager ft-ws-enter">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[.18em] text-emerald-600">Espacios reales</p>
          <h3 className="mt-1 text-lg font-black tracking-[-.03em] text-slate-950">Spaces Manager + Project Organization</h3>
          <p className="mt-1 max-w-3xl text-sm font-semibold text-slate-500">
            Crea espacios persistidos, organiza proyectos dentro de ellos y convierte la sidebar en un centro de control real tipo ClickUp/Notion.
          </p>
        </div>
        {onClose ? (
          <button type="button" onClick={onClose} className="ft-ws-control h-10 px-3 text-xs font-black">
            <X className="h-4 w-4" /> Cerrar
          </button>
        ) : null}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-[22px] border border-slate-200/80 bg-white/85 p-4">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_150px_150px_auto] md:items-center">
            <input className="ft-ws-space-input" value={name} onChange={(event) => setName(event.target.value)} placeholder="Nuevo espacio: Campañas, Clientes, Producción..." disabled={!canWriteSpaces || busy === "create"} />
            <select className="ft-ws-space-input" value={color} onChange={(event) => setColor(event.target.value)} disabled={!canWriteSpaces || busy === "create"}>
              {spaceColors.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <select className="ft-ws-space-input" value={icon} onChange={(event) => setIcon(event.target.value)} disabled={!canWriteSpaces || busy === "create"}>
              {spaceIcons.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <button type="button" onClick={() => void createSpace()} disabled={!canWriteSpaces || busy === "create"} className="ft-ws-active h-11 rounded-[16px] px-5 text-sm font-extrabold disabled:cursor-not-allowed disabled:opacity-55">
              {busy === "create" ? <Loader2 className="h-4 w-4 animate-spin" /> : <FolderPlus className="h-4 w-4" />}
              Crear
            </button>
          </div>
          {!canWriteSpaces ? (
            <p className="mt-3 rounded-[16px] bg-amber-50 px-3 py-2 text-sm font-bold text-amber-700">Migration Guard: {persistenceStatus.message}</p>
          ) : null}
          {feedback ? (
            <p className={feedback.tone === "success" ? "mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700" : "mt-3 rounded-[14px] bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700"}>
              {feedback.tone === "success" ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
              {feedback.text}
            </p>
          ) : null}
        </div>

        <div className="rounded-[22px] border border-emerald-100 bg-emerald-50/60 p-4">
          <p className="text-sm font-black text-emerald-800">Estado de persistencia</p>
          <p className="mt-2 rounded-[14px] bg-white/75 px-3 py-2 text-xs font-black text-emerald-700">
            workspace_spaces: {persistenceStatus.workspaceSpacesReady ? "OK" : "fallback"} · workspace_space_projects: {persistenceStatus.projectSpaceLinksReady ? "OK" : "pendiente"}
          </p>
          <ul className="mt-2 space-y-1 text-xs font-bold text-emerald-700">
            <li>• Los espacios guardados ordenan proyectos reales.</li>
            <li>• Un proyecto puede pertenecer a un espacio principal.</li>
            <li>• Si 0057 falta, la app conserva fallbacks sin romper.</li>
          </ul>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        {persistedSpaces.length ? persistedSpaces.map((space) => {
          const linked = projectsForSpace(space.id);
          const available = projects.filter((project) => !assignedProjectIds.has(project.id) || linked.some((item) => item.id === project.id));
          const isEditing = editingId === space.id;
          return (
            <article key={space.id} className="ft-ws-space-card">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="ft-ws-space-color" style={{ background: space.color ?? "#16C784" }} />
                  {isEditing ? (
                    <input className="ft-ws-space-title-input" value={editingName} onChange={(event) => setEditingName(event.target.value)} autoFocus />
                  ) : (
                    <h4 className="mt-2 truncate text-base font-black text-slate-950">{space.name}</h4>
                  )}
                  <p className="mt-1 text-xs font-bold text-slate-500">{linked.length} proyectos organizados · slug {space.slug}</p>
                </div>
                <div className="flex shrink-0 flex-wrap justify-end gap-2">
                  {isEditing ? (
                    <button type="button" onClick={() => void renameSpace(space.id)} className="ft-ws-space-action text-emerald-700"><Save className="h-3.5 w-3.5" /> Guardar</button>
                  ) : (
                    <button type="button" onClick={() => { setEditingId(space.id); setEditingName(space.name); }} className="ft-ws-space-action"><Pencil className="h-3.5 w-3.5" /> Editar</button>
                  )}
                  <button type="button" onClick={() => void archiveSpace(space.id)} className="ft-ws-space-action text-rose-700"><Archive className="h-3.5 w-3.5" /> Archivar</button>
                </div>
              </div>

              <div className="mt-4 rounded-[18px] border border-slate-200 bg-slate-50/70 p-3">
                <label className="text-xs font-black uppercase tracking-[.14em] text-slate-500">Asignar proyecto</label>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                  <select className="ft-ws-space-input" defaultValue="" disabled={!canLinkProjects || busy === `assign:${space.id}`} onChange={(event) => { void assignProject(space.id, event.target.value); event.currentTarget.value = ""; }}>
                    <option value="">Selecciona proyecto...</option>
                    {available.map((project) => <option key={project.id} value={project.id}>{project.title}</option>)}
                  </select>
                  <span className="inline-flex h-11 items-center justify-center rounded-[16px] bg-white px-3 text-xs font-black text-slate-500"><Plus className="h-3.5 w-3.5" /> Proyecto</span>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {linked.length ? linked.map((project) => (
                  <button key={project.id} type="button" onClick={() => void removeProject(project.id)} className="ft-ws-space-project-pill" title="Quitar del espacio">
                    {project.title} <X className="h-3.5 w-3.5" />
                  </button>
                )) : <p className="rounded-[14px] bg-white px-3 py-2 text-xs font-bold text-slate-500">Sin proyectos asignados todavía.</p>}
              </div>
            </article>
          );
        }) : (
          <div className="rounded-[22px] border border-dashed border-slate-300 bg-white/70 p-5 text-sm font-bold text-slate-500 xl:col-span-2">
            No hay espacios persistidos todavía. Crea el primero para organizar proyectos reales desde la sidebar.
          </div>
        )}
      </div>
    </section>
  );
}
