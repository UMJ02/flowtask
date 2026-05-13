"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, CheckCircle2, Loader2, Plus, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { WorkspaceContext, WorkspaceProjectSummary } from "@/lib/workspace-system/view-state";

type Draft = {
  title: string;
  status: string;
  priority: string;
  dueDate: string;
  projectId: string;
};

const emptyDraft: Draft = {
  title: "",
  status: "en_proceso",
  priority: "media",
  dueDate: "",
  projectId: "",
};

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

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = draft.title.trim();
    if (!title || busy) return;

    setBusy(true);
    setMessage(null);

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) {
      setMessage({ tone: "error", text: "Necesitás iniciar sesión para crear tareas." });
      setBusy(false);
      return;
    }

    const payload = {
      owner_id: userId,
      organization_id: context.organizationId ?? null,
      project_id: draft.projectId || context.projectId || null,
      title,
      description: null,
      status: draft.status,
      priority: draft.priority,
      due_date: draft.dueDate || null,
      client_name: selectedProject?.clientName ?? null,
      country: selectedProject?.country ?? null,
    };

    const { error } = await supabase.from("tasks").insert(payload).select("id").single();
    if (error) {
      setMessage({ tone: "error", text: error.message || "No se pudo crear la tarea rápida." });
      setBusy(false);
      return;
    }

    setDraft({ ...emptyDraft, projectId: context.projectId ?? "" });
    setMessage({ tone: "success", text: "Tarea creada dentro del workspace activo." });
    setBusy(false);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="ft-ws-quick-create ft-ws-enter">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[.18em] text-emerald-600">Quick create</p>
          <h3 className="mt-1 text-base font-black text-slate-950">Crear tarea en el contexto actual</h3>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            {context.projectTitle ?? "Workspace"} · {context.spaceName ?? "Todo el workspace"}
          </p>
        </div>
        {onClose ? (
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full text-slate-500 transition hover:bg-white hover:text-slate-950" aria-label="Cerrar quick create">
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <div className="mt-4 grid gap-2 xl:grid-cols-[minmax(0,1.4fr)_170px_140px_150px_auto]">
        <input
          className="h-11 rounded-[16px] border border-white bg-white px-3 text-sm font-bold text-slate-950 outline-none ring-0 transition placeholder:text-slate-400 focus:border-emerald-200 focus:shadow-[0_0_0_4px_rgba(22,199,132,.12)]"
          placeholder="Escribe una tarea rápida..."
          value={draft.title}
          onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
        />
        <select
          className="h-11 rounded-[16px] border border-white bg-white px-3 text-sm font-bold text-slate-700 outline-none"
          value={draft.projectId}
          onChange={(event) => setDraft((current) => ({ ...current, projectId: event.target.value }))}
        >
          <option value="">Sin proyecto</option>
          {projects.slice(0, 20).map((project) => <option key={project.id} value={project.id}>{project.title}</option>)}
        </select>
        <select
          className="h-11 rounded-[16px] border border-white bg-white px-3 text-sm font-bold text-slate-700 outline-none"
          value={draft.priority}
          onChange={(event) => setDraft((current) => ({ ...current, priority: event.target.value }))}
        >
          <option value="media">Prioridad media</option>
          <option value="alta">Prioridad alta</option>
          <option value="baja">Prioridad baja</option>
        </select>
        <label className="relative block">
          <CalendarDays className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="date"
            className="h-11 w-full rounded-[16px] border border-white bg-white pl-9 pr-3 text-sm font-bold text-slate-700 outline-none"
            value={draft.dueDate}
            onChange={(event) => setDraft((current) => ({ ...current, dueDate: event.target.value }))}
          />
        </label>
        <button type="submit" disabled={!draft.title.trim() || busy} className="inline-flex h-11 items-center justify-center gap-2 rounded-[16px] bg-[#16C784] px-5 text-sm font-black text-white shadow-[0_12px_24px_rgba(22,199,132,.22)] transition disabled:cursor-not-allowed disabled:opacity-55">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Crear
        </button>
      </div>

      {message ? (
        <div className={message.tone === "success" ? "mt-3 flex items-center gap-2 text-sm font-bold text-emerald-700" : "mt-3 text-sm font-bold text-rose-700"}>
          {message.tone === "success" ? <CheckCircle2 className="h-4 w-4" /> : null}
          {message.text}
        </div>
      ) : null}
    </form>
  );
}
