import { CalendarDays, CheckCircle2, Clock3, FileUp, MessageSquare, PencilLine, Workflow } from "lucide-react";
import type { WorkspaceActivityItem } from "@/lib/workspace-system/view-state";

function formatTimelineDate(value?: string | null) {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("es", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(date);
}

function getActivityIcon(action: string) {
  if (action.includes("attachment")) return FileUp;
  if (action.includes("comment")) return MessageSquare;
  if (action.includes("status")) return Workflow;
  if (action.includes("updated")) return PencilLine;
  return CheckCircle2;
}

function getActivityTone(action: string) {
  if (action.includes("attachment")) return "bg-blue-50 text-blue-700 ring-blue-100";
  if (action.includes("comment")) return "bg-amber-50 text-amber-700 ring-amber-100";
  if (action.includes("project")) return "bg-violet-50 text-violet-700 ring-violet-100";
  if (action.includes("status")) return "bg-emerald-50 text-emerald-700 ring-emerald-100";
  return "bg-slate-50 text-slate-700 ring-slate-100";
}

function groupByDay(activity: WorkspaceActivityItem[]) {
  const groups = new Map<string, WorkspaceActivityItem[]>();
  for (const item of activity) {
    const date = item.createdAt ? new Date(item.createdAt) : null;
    const key = date && !Number.isNaN(date.getTime()) ? date.toISOString().slice(0, 10) : "sin-fecha";
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  return [...groups.entries()].map(([key, items]) => ({ key, items }));
}

export function WorkspaceActivityTimeline({ activity, compact = false }: { activity: WorkspaceActivityItem[]; compact?: boolean }) {
  const groups = groupByDay(activity.slice(0, compact ? 6 : 18));

  return (
    <div className="ft-ws-activity-timeline">
      {groups.length ? groups.map((group) => (
        <section key={group.key} className="ft-ws-activity-day-group">
          <div className="ft-ws-activity-day-label"><CalendarDays className="h-3.5 w-3.5" /> {group.key === "sin-fecha" ? "Sin fecha" : formatTimelineDate(`${group.key}T00:00:00`).replace("00:00", "")}</div>
          <div className="space-y-2">
            {group.items.map((item) => {
              const Icon = getActivityIcon(item.action);
              return (
                <article key={item.id} className="ft-ws-activity-timeline-item">
                  <span className={`ft-ws-activity-icon ${getActivityTone(item.action)}`}><Icon className="h-4 w-4" /></span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-slate-850">{item.title}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs font-bold text-slate-500"><Clock3 className="h-3.5 w-3.5" /> {item.description ?? item.action} · {formatTimelineDate(item.createdAt)}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )) : <p className="rounded-[18px] border border-dashed border-slate-300 bg-white p-5 text-sm font-bold text-slate-500">No hay actividad reciente para este contexto.</p>}
    </div>
  );
}
