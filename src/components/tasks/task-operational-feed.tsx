"use client";

import { useState } from "react";
import { Clock3 } from "lucide-react";
import { TaskQuickCommentsCard } from "@/components/tasks/task-quick-comment-composer";
import { formatDate } from "@/lib/utils/dates";

type TaskOperationalFeedProps = {
  taskId: string;
  comments: any[];
  activity: any[];
  canComment?: boolean;
  activityLabel: (item: any) => string;
};

export function TaskOperationalFeed({ taskId, comments, activity, canComment = true, activityLabel }: TaskOperationalFeedProps) {
  const [showAllActivity, setShowAllActivity] = useState(false);
  const visibleActivity = showAllActivity ? activity : activity.slice(0, 4);
  const hasMoreActivity = activity.length > 4;

  return (
    <section className="space-y-5 border-t border-[#E2E8F0] pt-6">
      <div>
        <h2 className="text-[20px] font-semibold leading-tight ft-text-main">Feed operativo</h2>
        <p className="mt-1 text-sm font-semibold ft-text-muted">Comentarios del equipo y cambios importantes de esta tarea.</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-[22px] border border-[#E2E8F0] bg-white p-4">
          <div className="mb-4">
            <h3 className="text-sm font-semibold ft-text-main">Comentarios</h3>
            <p className="mt-1 text-xs font-semibold ft-text-muted">Conversaciones del equipo sobre esta tarea.</p>
          </div>
          <TaskQuickCommentsCard taskId={taskId} comments={comments as any[]} canComment={canComment} />
        </div>

        <div className="rounded-[22px] border border-[#E2E8F0] bg-white p-4">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold ft-text-main">Actividad del sistema</h3>
              <p className="mt-1 text-xs font-semibold ft-text-muted">Cambios registrados automáticamente.</p>
            </div>
            <span className="rounded-full bg-[#ECFDF5] px-2.5 py-1 text-[11px] font-semibold text-[#087A4B]">{activity.length}</span>
          </div>

          <div className="space-y-3">
            {visibleActivity.map((item: any, index: number) => (
              <article key={item.id ?? index} className="flex gap-3 rounded-[16px] bg-[#F8FAFC] p-3 ring-1 ring-[#E2E8F0]">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#ECFDF5] text-[#16C784]">
                  <Clock3 className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold ft-text-main">{activityLabel(item)}</p>
                  <p className="mt-1 text-xs font-semibold ft-text-muted">{item.created_at ? formatDate(item.created_at) : "Sin fecha"}</p>
                </div>
              </article>
            ))}
            {!activity.length ? (
              <p className="rounded-[16px] bg-[#F8FAFC] p-4 text-sm font-semibold ft-text-muted ring-1 ring-[#E2E8F0]">Los cambios aparecerán aquí cuando la tarea tenga movimientos.</p>
            ) : null}
          </div>

          {hasMoreActivity ? (
            <button type="button" onClick={() => setShowAllActivity((value) => !value)} className="mt-4 inline-flex h-9 items-center rounded-[12px] border border-[#E2E8F0] bg-white px-3 text-xs font-semibold text-[#475569] transition hover:bg-[#F8FAFC]">
              {showAllActivity ? "Ver menos movimientos" : `Ver ${activity.length - 4} movimientos más`}
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
