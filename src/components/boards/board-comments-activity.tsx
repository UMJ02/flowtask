"use client";

import { MessageCircle, Send, Sparkles } from "lucide-react";
import type { VisualBoardActivity, VisualBoardComment } from "@/lib/boards/board-types";

type Props = {
  comments: VisualBoardComment[];
  activities: VisualBoardActivity[];
  selectedElementId?: string | null;
  draft: string;
  savingComment: boolean;
  onDraftChange: (value: string) => void;
  onSubmitComment: () => void;
};

function activityLabel(activity: VisualBoardActivity) {
  const payload = activity.payload ?? {};
  const type = activity.type;
  if (type === "template_applied") return `Se aplicó una plantilla con ${String(payload.elements ?? "varios")} elementos.`;
  if (type === "board_created") return "Se creó la pizarra.";
  if (type === "element_created") return `Se agregó ${String(payload.elementType ?? "un elemento")}.`;
  if (type === "elements_deleted") return `Se eliminaron ${String(payload.count ?? 1)} elemento(s).`;
  if (type === "element_duplicated") return "Se duplicó un elemento.";
  if (type === "comment_created") return "Se agregó un comentario.";
  if (type === "table_changed") return "Se actualizó una tabla visual.";
  return "Movimiento registrado.";
}

export function BoardCommentsActivity({ comments, activities, selectedElementId, draft, savingComment, onDraftChange, onSubmitComment }: Props) {
  const visibleComments = comments.slice(0, 3);
  const visibleActivities = activities.slice(0, 5);
  return (
    <aside className="ft-glass-panel absolute bottom-5 left-5 z-30 hidden w-[340px] p-3 lg:block">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="ft-text-label text-emerald-700">Comentarios y actividad</p>
          <h2 className="ft-title-card mt-1">Seguimiento de la pizarra</h2>
        </div>
        <Sparkles className="h-4 w-4 text-emerald-600" />
      </div>

      <div className="mt-3 rounded-2xl border border-slate-200 bg-white/85 p-2">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-slate-500" />
          <input
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                onSubmitComment();
              }
            }}
            placeholder={selectedElementId ? "Comenta sobre el elemento seleccionado..." : "Comenta sobre la pizarra..."}
            className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400"
          />
          <button
            type="button"
            onClick={onSubmitComment}
            disabled={savingComment || !draft.trim()}
            className="ft-pressable grid h-8 w-8 place-items-center rounded-xl bg-slate-950 text-white disabled:cursor-not-allowed disabled:opacity-40"
            title="Enviar comentario"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-3 grid gap-3">
        <section>
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Comentarios</h3>
            <span className="text-[11px] font-bold text-slate-400">{comments.length}</span>
          </div>
          <div className="mt-2 space-y-2">
            {visibleComments.length ? visibleComments.map((comment) => (
              <article key={comment.id} className="rounded-2xl border border-slate-200 bg-white/80 p-2.5">
                <p className="text-sm font-semibold leading-5 text-slate-700">{comment.body}</p>
                <p className="mt-1 text-[11px] font-bold text-slate-400">{new Date(comment.createdAt).toLocaleDateString("es-CR")}{comment.elementId ? " · elemento" : ""}</p>
              </article>
            )) : <p className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-3 text-xs font-semibold text-slate-500">Aún no hay comentarios.</p>}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Actividad</h3>
            <span className="text-[11px] font-bold text-slate-400">{activities.length}</span>
          </div>
          <div className="mt-2 space-y-2">
            {visibleActivities.length ? visibleActivities.map((activity) => (
              <article key={activity.id} className="rounded-2xl border border-slate-200 bg-white/70 p-2.5">
                <p className="text-xs font-bold text-slate-700">{activityLabel(activity)}</p>
                <p className="mt-1 text-[11px] font-bold text-slate-400">{new Date(activity.createdAt).toLocaleDateString("es-CR")}</p>
              </article>
            )) : <p className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-3 text-xs font-semibold text-slate-500">Los movimientos importantes aparecerán aquí.</p>}
          </div>
        </section>
      </div>
    </aside>
  );
}
