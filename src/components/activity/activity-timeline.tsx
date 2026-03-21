import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils/dates";

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

export function ActivityTimeline({ items, title = "Actividad reciente", description = "Últimos cambios registrados." }: { items: any[]; title?: string; description?: string }) {
  return (
    <Card>
      <div>
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
      <div className="mt-4 space-y-3">
        {items.length ? items.map((item) => (
          <div key={item.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-sm font-medium text-slate-900">{labels[item.action] ?? item.action}</p>
            {item.metadata?.title ? <p className="mt-1 text-sm text-slate-600">{String(item.metadata.title)}</p> : null}
            {item.metadata?.status ? <p className="mt-1 text-xs text-slate-500">Estado: {String(item.metadata.status)}</p> : null}
            <p className="mt-2 text-xs text-slate-500">{formatDate(item.created_at)}</p>
          </div>
        )) : <p className="text-sm text-slate-500">Todavía no hay movimientos registrados.</p>}
      </div>
    </Card>
  );
}
