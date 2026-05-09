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
  const [showAll, setShowAll] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canComment || !content.trim()) return;
    setError(null);
    setIsSaving(true);

    const supabase = createClient();
    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;
    if (!user) {
      setError("Tu sesión expiró. Vuelve a iniciar sesión para comentar.");
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
    <section id="comments" className="space-y-4">
      <form className="flex items-center gap-3" onSubmit={submit}>
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#ECFDF5] text-sm font-black text-[#16A36C]">FT</div>
        <div className="flex h-12 flex-1 items-center gap-3 rounded-[16px] border border-[#E2E8F0] bg-white px-4 shadow-[0_6px_18px_rgba(15,23,42,0.025)]">
          <input value={content} onChange={(event) => setContent(event.target.value)} disabled={!canComment || isSaving} placeholder="Escribe un comentario o menciona a alguien..." className="h-full min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-[#94A3B8]" />
          <button type="submit" disabled={!canComment || isSaving || !content.trim()} className="grid h-9 w-9 place-items-center rounded-full text-[#64748B] transition hover:bg-[#F8FAFC] hover:text-[#16A36C] disabled:cursor-not-allowed disabled:opacity-50" aria-label="Enviar comentario">➤</button>
        </div>
      </form>
      {!canComment ? <p className="text-sm font-semibold text-[#64748B]">Tu acceso actual permite ver comentarios, pero no agregar nuevos.</p> : null}
      {error ? <p className="text-sm font-semibold text-rose-600">{error}</p> : null}
      <div className="space-y-4">
        {(showAll ? comments : comments.slice(0, 3)).map((comment) => {
          const profile = getProfile(comment);
          const name = profile?.full_name || profile?.email || "Usuario";
          return (
            <article key={comment.id} className="flex gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#EFF6FF] text-sm font-black text-[#3B82F6]">{name.slice(0, 1).toUpperCase()}</div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2"><p className="text-sm font-black text-[#0F172A]">{name}</p><p className="text-xs font-bold text-[#94A3B8]">{comment.created_at ? formatDate(comment.created_at) : "Sin fecha"}</p></div>
                <p className="mt-1 text-sm font-semibold leading-6 text-[#334155]">{comment.content}</p>
              </div>
            </article>
          );
        })}
      </div>
      {comments.length > 3 ? (
        <button type="button" onClick={() => setShowAll((value) => !value)} className="inline-flex h-9 items-center rounded-[12px] border border-[#E2E8F0] bg-white px-3 text-xs font-black text-[#475569] transition hover:bg-[#F8FAFC]">
          {showAll ? "Ver menos comentarios" : `Ver ${comments.length - 3} comentarios más`}
        </button>
      ) : null}
    </section>
  );
}
