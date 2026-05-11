"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, Edit3, MapPin, MessageCircle, PanelLeftClose, Send, Sparkles, Trash2, X } from "lucide-react";
import type { VisualBoardActivity, VisualBoardComment } from "@/lib/boards/board-types";

type Props = {
  comments: VisualBoardComment[];
  activities: VisualBoardActivity[];
  selectedElementId?: string | null;
  pendingAnchor?: { point?: { x: number; y: number } | null; elementId?: string | null } | null;
  focusedCommentId?: string | null;
  draft: string;
  savingComment: boolean;
  onDraftChange: (value: string) => void;
  onSubmitComment: () => void;
  onUpdateComment: (commentId: string, body: string) => void;
  onResolveComment: (commentId: string, resolved: boolean) => void;
  onDeleteComment: (commentId: string) => void;
};

function activityLabel(activity: VisualBoardActivity) {
  const payload = activity.payload ?? {};
  const type = activity.type;
  if (type === "template_applied") return `Plantilla aplicada · ${String(payload.elements ?? "varios")} elementos`;
  if (type === "board_created") return "Pizarra creada";
  if (type === "element_created") return `Se agregó ${String(payload.elementType ?? "un elemento")}`;
  if (type === "elements_deleted") return `Se eliminaron ${String(payload.count ?? 1)} elemento(s)`;
  if (type === "element_duplicated") return "Elemento duplicado";
  if (type === "comment_created") return "Comentario agregado";
  if (type === "comment_updated") return "Comentario actualizado";
  if (type === "comment_resolved") return "Comentario resuelto";
  if (type === "comment_deleted") return "Comentario eliminado";
  if (type === "table_changed") return "Tabla actualizada";
  return "Movimiento registrado";
}

function shortDate(value: string) {
  return new Date(value).toLocaleDateString("es-CR", { day: "2-digit", month: "short" });
}

export function BoardCommentsActivity({ comments, activities, selectedElementId, pendingAnchor, focusedCommentId, draft, savingComment, onDraftChange, onSubmitComment, onUpdateComment, onResolveComment, onDeleteComment }: Props) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"comments" | "activity">("comments");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingBody, setEditingBody] = useState("");

  useEffect(() => {
    if (pendingAnchor || focusedCommentId) {
      setOpen(true);
      setTab("comments");
    }
  }, [pendingAnchor, focusedCommentId]);

  const visibleComments = useMemo(() => comments.slice(0, 12), [comments]);
  const visibleActivities = useMemo(() => activities.slice(0, 14), [activities]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="board-panel absolute bottom-5 left-[116px] z-40 hidden h-11 items-center gap-2 px-3 text-xs font-bold text-slate-700 transition hover:translate-y-0 hover:border-emerald-200 hover:text-emerald-700 lg:flex"
        title="Abrir comentarios y actividad"
      >
        <MessageCircle className="h-4 w-4" />
        Seguimiento
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">{comments.length + activities.length}</span>
      </button>
    );
  }

  return (
    <aside className="board-panel absolute bottom-5 left-[116px] top-5 z-40 hidden w-[300px] flex-col overflow-hidden p-0 lg:flex">
      <div className="flex items-center justify-between border-b ft-border px-3 py-3">
        <div className="min-w-0">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-emerald-700">Seguimiento</p>
          <h2 className="truncate text-sm font-bold ft-text-main">Comentarios y actividad</h2>
        </div>
        <button type="button" onClick={() => setOpen(false)} className="grid h-8 w-8 place-items-center rounded-xl text-slate-500 hover:bg-slate-100" title="Ocultar seguimiento">
          <PanelLeftClose className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-1 border-b ft-border bg-slate-50/70 p-1.5">
        <button type="button" onClick={() => setTab("comments")} className={`rounded-xl px-2 py-2 text-xs font-bold transition ${tab === "comments" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:bg-white/70"}`}>Comentarios <span className="text-[10px]">{comments.length}</span></button>
        <button type="button" onClick={() => setTab("activity")} className={`rounded-xl px-2 py-2 text-xs font-bold transition ${tab === "activity" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:bg-white/70"}`}>Actividad <span className="text-[10px]">{activities.length}</span></button>
      </div>

      {pendingAnchor ? (
        <div className="mx-3 mt-3 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
          <MapPin className="h-3.5 w-3.5" />
          {pendingAnchor.elementId ? "Comentario anclado al elemento" : "Comentario anclado al lienzo"}
        </div>
      ) : null}

      <div className="mx-3 mt-3 rounded-2xl border border-slate-200 bg-white p-2">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-slate-500" />
          <input id="board-comment-input" value={draft} onChange={(event) => onDraftChange(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); onSubmitComment(); } }} placeholder={selectedElementId ? "Comenta sobre el elemento..." : "Comenta sobre la pizarra..."} className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400" />
          <button type="button" onClick={onSubmitComment} disabled={savingComment || !draft.trim()} className="ft-pressable grid h-8 w-8 place-items-center rounded-xl bg-slate-950 text-white disabled:cursor-not-allowed disabled:opacity-40" title="Enviar comentario"><Send className="h-3.5 w-3.5" /></button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        {tab === "comments" ? (
          <div className="space-y-2">
            {visibleComments.length ? visibleComments.map((comment) => {
              const editing = editingId === comment.id;
              return (
                <article key={comment.id} className={`rounded-2xl border p-2.5 ${focusedCommentId === comment.id ? "border-emerald-300 bg-emerald-50/70" : "border-slate-200 bg-white"} ${comment.resolved ? "opacity-70" : ""}`}>
                  {editing ? (
                    <textarea value={editingBody} onChange={(event) => setEditingBody(event.target.value)} className="min-h-[72px] w-full resize-none rounded-xl border border-slate-200 bg-white px-2 py-2 text-sm font-semibold outline-none focus:border-emerald-300" />
                  ) : (
                    <p className="text-sm font-semibold leading-5 text-slate-700">{comment.body}</p>
                  )}
                  <p className="mt-1 text-[11px] font-bold text-slate-400">{shortDate(comment.createdAt)}{comment.elementId ? " · elemento" : comment.x !== null && comment.y !== null ? " · lienzo" : ""}{comment.resolved ? " · resuelto" : ""}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {editing ? (
                      <>
                        <button type="button" onClick={() => { onUpdateComment(comment.id, editingBody); setEditingId(null); }} className="inline-flex h-7 items-center gap-1 rounded-lg bg-emerald-50 px-2 text-[11px] font-bold text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" /> Guardar</button>
                        <button type="button" onClick={() => setEditingId(null)} className="inline-flex h-7 items-center gap-1 rounded-lg bg-slate-50 px-2 text-[11px] font-bold text-slate-600"><X className="h-3.5 w-3.5" /> Cancelar</button>
                      </>
                    ) : (
                      <>
                        <button type="button" onClick={() => { setEditingId(comment.id); setEditingBody(comment.body); }} className="inline-flex h-7 items-center gap-1 rounded-lg bg-slate-50 px-2 text-[11px] font-bold text-slate-600 hover:bg-slate-100"><Edit3 className="h-3.5 w-3.5" /> Editar</button>
                        <button type="button" onClick={() => onResolveComment(comment.id, !comment.resolved)} className="inline-flex h-7 items-center gap-1 rounded-lg bg-emerald-50 px-2 text-[11px] font-bold text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" /> {comment.resolved ? "Reabrir" : "Resolver"}</button>
                        <button type="button" onClick={() => onDeleteComment(comment.id)} className="inline-flex h-7 items-center gap-1 rounded-lg bg-rose-50 px-2 text-[11px] font-bold text-rose-600"><Trash2 className="h-3.5 w-3.5" /> Borrar</button>
                      </>
                    )}
                  </div>
                </article>
              );
            }) : <p className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-3 text-xs font-semibold text-slate-500">Aún no hay comentarios.</p>}
          </div>
        ) : (
          <div className="space-y-2">
            {visibleActivities.length ? visibleActivities.map((activity) => (
              <article key={activity.id} className="rounded-2xl border border-slate-200 bg-white p-2.5"><div className="flex gap-2"><span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><Clock3 className="h-3.5 w-3.5" /></span><div className="min-w-0"><p className="text-xs font-bold leading-5 text-slate-700">{activityLabel(activity)}</p><p className="text-[11px] font-bold text-slate-400">{shortDate(activity.createdAt)}</p></div></div></article>
            )) : <p className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-3 text-xs font-semibold text-slate-500">Los movimientos importantes aparecerán aquí.</p>}
          </div>
        )}
      </div>

      <div className="border-t ft-border bg-slate-50/70 px-3 py-2 text-[11px] font-semibold text-slate-500"><Sparkles className="mr-1 inline h-3.5 w-3.5 text-emerald-600" /> Panel compacto para no saturar el lienzo.</div>
    </aside>
  );
}
