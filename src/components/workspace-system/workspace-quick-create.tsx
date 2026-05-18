"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Plus, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { WorkspaceContext, WorkspaceProjectSummary } from "@/lib/workspace-system/view-state";

type DraftMode = "task" | "project";

type Draft = {
  mode: DraftMode;
  title: string;
  status: string;
  priority: string;
  dueDate: string;
  projectId: string;
  description: string;
  checklist: string;
};

const emptyDraft: Draft = {
  mode: "task",
  title: "",
  status: "en_proceso",
  priority: "media",
  dueDate: "",
  projectId: "",
  description: "",
  checklist: "",
};

function checklistLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim().replace(/^[-•]\s*/, ""))
    .filter(Boolean)
    .slice(0, 20);
}

export function WorkspaceQuickCreate({
  context,
  projects,
  onClose,
}: {
  context: WorkspaceContext;
  projects: WorkspaceProjectSummary[];
  onClose?: () => void;
}) {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>({ ...emptyDraft, projectId: context.projectId ?? "" });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  const selectedProject = projects.find((project) => project.id === draft.projectId) ?? projects.find((project) => project.id === context.projectId) ?? null;
  const checklist = checklistLines(draft.checklist);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = draft.title.trim();
    if (!title || busy) return;

    setBusy(true);
    setMessage(null);

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) {
      setMessage({ tone: "error", text: "Necesitás iniciar sesión para crear desde el workspace." });
      setBusy(false);
      return;
    }

    if (draft.mode === "project") {
      const { data, error } = await supabase
        .from("projects")
        .insert({
          owner_id: userId,
          organization_id: context.organizationId ?? null,
          title,
          description: draft.description.trim() || null,
          status: "activo",
          due_date: draft.dueDate || null,
          is_collaborative: Boolean(context.organizationId),
          share_enabled: Boolean(context.organizationId),
          client_name: null,
          country: null,
        })
        .select("id")
        .single();

      if (error) {
        setMessage({ tone: "error", text: error.message || "No se pudo crear el proyecto." });
        setBusy(false);
        return;
      }

      const projectId = data?.id as string | undefined;
      if (projectId) {
        await supabase.from("project_members").insert({ project_id: projectId, user_id: userId, role: "owner" });
        if (checklist.length) {
          await supabase.from("tasks").insert(checklist.map((item, index) => ({
            owner_id: userId,
            organization_id: context.organizationId ?? null,
            project_id: projectId,
            title: item,
            status: index === 0 ? "en_proceso" : "pendiente",
            priority: draft.priority,
            due_date: draft.dueDate || null,
          })));
        }
      }

      setMessage({ tone: "success", text: checklist.length ? "Proyecto creado con tareas iniciales." : "Proyecto creado." });
      setDraft({ ...emptyDraft, projectId: context.projectId ?? "" });
      setBusy(false);
      router.refresh();
      return;
    }

    const payload = {
      owner_id: userId,
      organization_id: context.organizationId ?? null,
      project_id: draft.projectId || context.projectId || null,
      title,
      description: draft.description.trim() || null,
      status: draft.status,
      priority: draft.priority,
      due_date: draft.dueDate || null,
      client_name: selectedProject?.clientName ?? null,
      country: selectedProject?.country ?? null,
    };

    const { data, error } = await supabase.from("tasks").insert(payload).select("id").single();
    if (error) {
      setMessage({ tone: "error", text: error.message || "No se pudo crear la tarea." });
      setBusy(false);
      return;
    }

    const taskId = data?.id as string | undefined;
    if (taskId && checklist.length) {
      await supabase.from("task_checklist_items").insert(checklist.map((item, index) => ({
        task_id: taskId,
        title: item,
        position: index + 1,
        is_done: false,
      })));
    }

    setDraft({ ...emptyDraft, projectId: context.projectId ?? "" });
    setMessage({ tone: "success", text: checklist.length ? "Tarea creada con checklist." : "Tarea creada. Inicia en 0% y al concluir llega a 100%." });
    setBusy(false);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="ws-pro-create-form">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Crear en workspace</p>
          <h3 className="mt-1 text-base font-semibold text-slate-950">{draft.mode === "task" ? "Nueva tarea" : "Nuevo proyecto"}</h3>
          <p className="mt-1 text-xs text-slate-500">{context.projectTitle ?? "Todos los proyectos"} · {context.spaceName ?? "Todo el workspace"}</p>
        </div>
        {onClose ? <button type="button" onClick={onClose} className="ws-pro-icon-button h-8 w-8" aria-label="Cerrar"><X className="h-4 w-4" /></button> : null}
      </div>

      <div className="mt-4 inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
        {(["task", "project"] as const).map((mode) => <button key={mode} type="button" onClick={() => setDraft((current) => ({ ...current, mode }))} className={draft.mode === mode ? "ws-pro-segment-active" : "ws-pro-segment"}>{mode === "task" ? "Tarea" : "Proyecto"}</button>)}
      </div>

      <div className="mt-4 grid gap-3">
        <input className="ws-pro-form-input" placeholder={draft.mode === "task" ? "Nombre de la tarea" : "Nombre del proyecto"} value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} />
        <textarea className="ws-pro-form-textarea" placeholder="Descripción breve opcional" value={draft.description} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} />
        <div className="grid gap-3 md:grid-cols-2">
          {draft.mode === "task" ? (
            <select className="ws-pro-form-input" value={draft.projectId} onChange={(event) => setDraft((current) => ({ ...current, projectId: event.target.value }))}>
              <option value="">Tarea individual / sin proyecto</option>
              {projects.slice(0, 40).map((project) => <option key={project.id} value={project.id}>{project.title}</option>)}
            </select>
          ) : null}
          {draft.mode === "task" ? (
            <select className="ws-pro-form-input" value={draft.status} onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value }))}>
              <option value="pendiente">Pendiente</option>
              <option value="en_proceso">En curso</option>
              <option value="produccion">Producción</option>
              <option value="en_espera">En espera</option>
              <option value="revision">Revisión</option>
            </select>
          ) : null}
          <select className="ws-pro-form-input" value={draft.priority} onChange={(event) => setDraft((current) => ({ ...current, priority: event.target.value }))}>
            <option value="media">Prioridad media</option>
            <option value="alta">Prioridad alta</option>
            <option value="baja">Prioridad baja</option>
          </select>
          <input type="date" className="ws-pro-form-input" value={draft.dueDate} onChange={(event) => setDraft((current) => ({ ...current, dueDate: event.target.value }))} />
        </div>
        <textarea className="ws-pro-form-textarea min-h-[120px]" placeholder={draft.mode === "task" ? "Checklist opcional: una línea por punto" : "Tareas iniciales opcionales: una línea por tarea"} value={draft.checklist} onChange={(event) => setDraft((current) => ({ ...current, checklist: event.target.value }))} />
        <p className="text-xs leading-5 text-slate-500">{draft.mode === "task" ? "Sin checklist: la tarea inicia en 0% y al marcarla como concluida llega a 100%." : "En proyectos, cada línea se crea como tarea anidada inicial."}</p>
      </div>

      {message ? <div className={message.tone === "success" ? "mt-4 flex items-center gap-2 text-sm font-semibold text-emerald-700" : "mt-4 text-sm font-semibold text-rose-700"}>{message.tone === "success" ? <CheckCircle2 className="h-4 w-4" /> : null}{message.text}</div> : null}

      <div className="mt-5 flex justify-end gap-2">
        {onClose ? <button type="button" onClick={onClose} className="ws-pro-secondary-button">Cancelar</button> : null}
        <button type="submit" disabled={!draft.title.trim() || busy} className="ws-pro-primary-button disabled:cursor-not-allowed disabled:opacity-50">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}{draft.mode === "task" ? "Crear tarea" : "Crear proyecto"}</button>
      </div>
    </form>
  );
}
