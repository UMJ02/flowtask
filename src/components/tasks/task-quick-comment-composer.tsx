"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { logActivity } from "@/lib/activity/log-client";
import { createClientNotification } from "@/lib/notifications/create-client-notification";
import { formatDate } from "@/lib/utils/dates";

type CommentRow = {
  id: string;
  content: string;
  created_at?: string | null;
  profiles?: { full_name?: string | null; email?: string | null; avatar_url?: string | null } | { full_name?: string | null; email?: string | null; avatar_url?: string | null }[] | null;
};

function getProfile(comment: CommentRow) {
  return Array.isArray(comment.profiles) ? comment.profiles[0] : comment.profiles;
}

export function TaskQuickCommentsCard({ taskId, comments, canComment = true }: { taskId: string; comments: CommentRow[]; canComment?: boolean }) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canComment || !content.trim()) return;
    setError(null);
    setIsSaving(true);

    const supabase = createClient();
    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;
    if (!user) {
      setError("Sesión no válida.");
      setIsSaving(false);
      return;
    }

    const { data: inserted, error: insertError } = await supabase
      .from("comments")
      .insert({ author_id: user.id, task_id: taskId, project_id: null, content })
      .select("id")
      .single();

    if (insertError) {
      setError(insertError.message);
      setIsSaving(false);
      return;
    }

    await logActivity(supabase, {
      entityType: "task",
      entityId: taskId,
      action: "comment_added",
      metadata: { title: content.slice(0, 80), comment_id: inserted?.id },
    });
    await createClientNotification(supabase, {
      userId: user.id,
      title: "Nuevo comentario registrado",
      body: content.slice(0, 120),
      kind: "success",
      entityType: "task",
      entityId: taskId,
    });

    setContent("");
    setIsSaving(false);
    router.refresh();
  };

  return (
    <section id="comments" className="rounded-[24px] border border-violet-100 bg-gradient-to-br from-white via-white to-violet-50/70 p-7 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
      <div className="mb-4">
        <h2 className="text-lg font-black text-[#0F172A]">Comentarios</h2>
        <p className="text-sm font-semibold text-[#64748B]">Siguiendo cronológicamente</p>
      </div>

      <form className="flex flex-col gap-3 sm:flex-row" onSubmit={submit}>
        <input
          value={content}
          onChange={(event) => setContent(event.target.value)}
          disabled={!canComment || isSaving}
          placeholder="Escribe un comentario o menciona a alguien con @"
          className="h-12 flex-1 rounded-[16px] border border-[#E5EAF1] bg-white px-4 text-sm font-semibold outline-none transition placeholder:text-[#94A3B8] focus:border-[#16C784] focus:ring-4 focus:ring-[#16C784]/10"
        />
        <button type="submit" disabled={!canComment || isSaving || !content.trim()} className="h-12 rounded-[16px] bg-[#7C3AED] px-6 text-sm font-black text-white shadow-[0_14px_28px_rgba(124,58,237,0.18)] transition hover:bg-[#6D28D9] disabled:cursor-not-allowed disabled:opacity-50">
          {isSaving ? "Comentando..." : "Comentar"}
        </button>
      </form>
      {!canComment ? <p className="mt-3 text-sm font-semibold text-[#64748B]">Tu acceso actual permite ver comentarios, pero no agregar nuevos.</p> : null}
      {error ? <p className="mt-3 text-sm font-semibold text-rose-600">{error}</p> : null}

      <div className="mt-6 divide-y divide-[#E5EAF1]">
        {comments.length ? comments.map((comment) => {
          const profile = getProfile(comment);
          const name = profile?.full_name || profile?.email || "Usuario";
          return (
            <article key={comment.id} className="flex gap-3 py-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#ECFDF5] text-sm font-black text-[#16A36C]">
                {name.slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-black text-[#0F172A]">{name}</p>
                  <p className="text-xs font-bold text-[#94A3B8]">{comment.created_at ? formatDate(comment.created_at) : "Sin fecha"}</p>
                </div>
                <p className="mt-1 text-sm font-semibold leading-6 text-[#334155]">{comment.content}</p>
              </div>
            </article>
          );
        }) : (
          <p className="rounded-[16px] bg-[#F8FAFC] p-4 text-sm font-semibold text-[#64748B]">Todavía no hay comentarios en esta tarea.</p>
        )}
      </div>
    </section>
  );
}
