import { Card } from "@/components/ui/card";
import { MarkNotificationReadButton } from "@/components/notifications/mark-notification-read-button";
import { getNotificationsPageData } from "@/lib/queries/notifications";
import { formatDate } from "@/lib/utils/dates";

export default async function NotificationsPage() {
  const data = await getNotificationsPageData();

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-slate-500">No leídas</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{data.unreadCount}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Tareas asignadas</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{data.assignedTasks.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Recordatorios disparados</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{data.triggeredReminders.length}</p>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Centro de notificaciones</h2>
            <p className="text-sm text-slate-500">Cambios recientes, avisos internos y seguimiento diario.</p>
          </div>
          <div className="mt-4 space-y-3">
            {data.notifications.length ? data.notifications.map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{item.title}</p>
                    {item.body ? <p className="mt-1 text-sm text-slate-600">{item.body}</p> : null}
                    <p className="mt-2 text-xs text-slate-500">{formatDate(item.created_at)}</p>
                  </div>
                  <MarkNotificationReadButton id={item.id} isRead={item.is_read} />
                </div>
              </div>
            )) : <p className="text-sm text-slate-500">No hay notificaciones todavía.</p>}
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Tareas asignadas</h2>
              <p className="text-sm text-slate-500">Lo que te asignaron recientemente.</p>
            </div>
            <div className="mt-4 space-y-3">
              {data.assignedTasks.length ? data.assignedTasks.map((item: any) => (
                <div key={item.id} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  <p className="font-medium text-slate-900">{item.tasks?.title ?? "Tarea"}</p>
                  <p className="mt-1 text-xs text-slate-500">Estado: {item.tasks?.status ?? "-"}</p>
                </div>
              )) : <p className="text-sm text-slate-500">No tienes tareas asignadas recientes.</p>}
            </div>
          </Card>
          <Card>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Recordatorios disparados</h2>
              <p className="text-sm text-slate-500">Últimos recordatorios procesados por el sistema.</p>
            </div>
            <div className="mt-4 space-y-3">
              {data.triggeredReminders.length ? data.triggeredReminders.map((item: any) => (
                <div key={item.id} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  <p>{item.task_id ? `Tarea ${item.task_id}` : `Proyecto ${item.project_id}`}</p>
                  <p className="mt-1 text-xs text-slate-500">Enviado: {formatDate(item.sent_at)}</p>
                </div>
              )) : <p className="text-sm text-slate-500">Todavía no se han disparado recordatorios.</p>}
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
