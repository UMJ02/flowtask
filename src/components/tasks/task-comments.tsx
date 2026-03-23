import { CommentComposer } from "@/components/comments/comment-composer";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils/dates";

export function TaskComments({ taskId, comments }: { taskId: string; comments: any[] }) {
  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Comentarios</h3>
          <p className="text-sm text-slate-500">Seguimiento cronológico de la tarea.</p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {comments.length ? comments.map((comment) => {
          const profile = Array.isArray(comment.profiles) ? comment.profiles[0] : comment.profiles;
          return (
            <div key={comment.id} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <p>{comment.content}</p>
              <p className="mt-2 text-xs text-slate-500">
                {profile?.full_name || profile?.email || "Usuario"} · {formatDate(comment.created_at)}
              </p>
            </div>
          );
        }) : <p className="text-sm text-slate-500">Todavía no hay comentarios en esta tarea.</p>}
      </div>

      <div className="mt-4">
        <CommentComposer taskId={taskId} />
      </div>
    </Card>
  );
}
