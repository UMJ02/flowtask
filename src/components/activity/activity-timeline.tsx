import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils/dates";
import type { ActivityItem } from "@/lib/queries/activity";

const labels: Record<string, string> = {
  task_created: "Tarea creada",
  task_updated: "Tarea actualizada",
  task_deleted: "Tarea eliminada",
  task_status_changed: "Estado de tarea cambiado",
  project_created: "Proyecto creado",
  project_updated: "Proyecto actualizado",
  project_deleted: "Proyecto eliminado",
  project_status_changed: "Estado de proyecto cambiado",
  comment_added: "Comentario agregado",
  reminder_sent: "Recordatorio disparado",
};

const entityStyles: Record<string, string> = {
  task: "bg-blue-50 text-blue-700 ring-blue-100",
  project: "bg-violet-50 text-violet-700 ring-violet-100",
  comment: "bg-amber-50 text-amber-700 ring-amber-100",
  reminder: "bg-emerald-50 text-emerald-700 ring-emerald-100",
};

function resolveEntityLabel(item: ActivityItem) {
  if (item.entity_type === "task") return "Tarea";
  if (item.entity_type === "project") return "Proyecto";
  if (item.action.includes("comment")) return "Comentario";
  if (item.action.includes("reminder")) return "Recordatorio";
  return "Actividad";
}

function resolveEntityStyle(item: ActivityItem) {
  if (item.entity_type && entityStyles[item.entity_type]) return entityStyles[item.entity_type];
  if (item.action.includes("comment")) return entityStyles.comment;
  if (item.action.includes("reminder")) return entityStyles.reminder;
  return "bg-slate-100 text-slate-700 ring-slate-200";
}

function extractDetail(item: ActivityItem) {
  const title = typeof item.metadata?.title === "string" ? item.metadata.title : null;
  const status = typeof item.metadata?.status === "string" ? item.metadata.status : null;
  const description = typeof item.metadata?.description === "string" ? item.metadata.description : null;

  return {
    title,
    status,
    description,
  };
}

export function ActivityTimeline({
  items,
  title = "Actividad reciente",
  description = "Últimos cambios registrados.",
  compact = false,
}: {
  items: ActivityItem[];
  title?: string;
  description?: string;
  compact?: boolean;
}) {
  return (
    <Card>
      <div>
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
      <div className="mt-4 space-y-3">
        {items.length ? (
          items.map((item) => {
            const detail = extractDetail(item);
            return (
              <div key={item.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${resolveEntityStyle(item)}`}>
                      {resolveEntityLabel(item)}
                    </span>
                    <p className="text-sm font-medium text-slate-900">{labels[item.action] ?? item.action}</p>
                  </div>
                  <p className="text-xs text-slate-500">{formatDate(item.created_at)}</p>
                </div>
                {detail.title ? <p className="mt-2 text-sm text-slate-700">{detail.title}</p> : null}
                {!compact && detail.description ? <p className="mt-2 text-sm text-slate-500">{detail.description}</p> : null}
                {detail.status ? <p className="mt-2 text-xs text-slate-500">Estado: {detail.status}</p> : null}
              </div>
            );
          })
        ) : (
          <p className="text-sm text-slate-500">Todavía no hay movimientos registrados.</p>
        )}
      </div>
    </Card>
  );
}
