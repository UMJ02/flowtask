import Link from "next/link";
import { Bell, Bot, CalendarClock, CheckCircle2, FileArchive, Sparkles, Zap } from "lucide-react";
import { notificationsRoute } from "@/lib/navigation/routes";
import type { WorkspaceActivityItem, WorkspaceFileSummary, WorkspaceNotificationSummary, WorkspaceTaskItem } from "@/lib/workspace-system/view-state";

function isOverdue(task: WorkspaceTaskItem) {
  if (task.isOverdue) return true;
  if (!task.dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(`${task.dueDate}T00:00:00`);
  return !Number.isNaN(due.getTime()) && due < today && !["concluido", "completado"].includes(task.status);
}

function buildAutomationSignals({
  tasks,
  files,
  activity,
  notifications,
}: {
  tasks: WorkspaceTaskItem[];
  files: WorkspaceFileSummary[];
  activity: WorkspaceActivityItem[];
  notifications: WorkspaceNotificationSummary;
}) {
  const overdue = tasks.filter(isOverdue).length;
  const today = tasks.filter((task) => task.isDueToday).length;
  const important = tasks.filter((task) => task.priority === "alta").length;
  const recentUploads = files.length;
  const recentActivity = activity.length;

  return [
    overdue > 0
      ? { id: "overdue", icon: CalendarClock, tone: "rose", title: `${overdue} tareas vencidas`, description: "Prioriza notificar responsables o mover fechas desde Timeline.", href: "/app/workspace?view=timeline", label: "Abrir Timeline" }
      : null,
    notifications.unread > 0
      ? { id: "unread", icon: Bell, tone: "amber", title: `${notifications.unread} notificaciones sin leer`, description: "Revisa alertas antes de cerrar el día operativo.", href: notificationsRoute(), label: "Ver notificaciones" }
      : null,
    important > 0
      ? { id: "important", icon: Sparkles, tone: "violet", title: `${important} tareas importantes`, description: "Buen candidato para generar resumen diario o recordatorio interno.", href: "/app/workspace?status=todos&sort=priority", label: "Ordenar prioridad" }
      : null,
    today > 0
      ? { id: "today", icon: Zap, tone: "blue", title: `${today} tareas para hoy`, description: "Mantén el foco con una revisión rápida del Home del proyecto.", href: "/app/workspace?view=home", label: "Abrir Home" }
      : null,
    recentUploads > 0
      ? { id: "files", icon: FileArchive, tone: "blue", title: `${recentUploads} archivos visibles`, description: "Conecta archivos recientes con tareas o pizarras para no perder contexto.", href: "/app/workspace?view=files", label: "Abrir Archivos" }
      : null,
    recentActivity > 0
      ? { id: "activity", icon: CheckCircle2, tone: "emerald", title: `${recentActivity} movimientos recientes`, description: "La actividad del workspace está viva y lista para resumen ejecutivo.", href: "/app/workspace?view=home", label: "Ver actividad" }
      : null,
  ].filter(Boolean).slice(0, 4) as Array<{ id: string; icon: typeof Bell; tone: string; title: string; description: string; href: string; label: string }>;
}

export function WorkspaceNotificationsAutomationPanel({
  tasks,
  files,
  activity,
  notifications,
}: {
  tasks: WorkspaceTaskItem[];
  files: WorkspaceFileSummary[];
  activity: WorkspaceActivityItem[];
  notifications: WorkspaceNotificationSummary;
}) {
  const signals = buildAutomationSignals({ tasks, files, activity, notifications });
  const latest = notifications.latest.slice(0, 3);

  return (
    <section className="ft-ws-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[.18em] text-violet-600">Automatización contextual</p>
          <h3 className="mt-1 flex items-center gap-2 font-extrabold text-[var(--ft-workspace-text)]"><Bot className="h-4 w-4 text-violet-500" /> Notificaciones + actividad</h3>
        </div>
        <Link href={notificationsRoute()} className="rounded-full bg-violet-50 px-3 py-1 text-[11px] font-black text-violet-700">{notifications.unread} sin leer</Link>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2">
        <div className="ft-ws-auto-stat"><b>{notifications.total}</b><span>Total</span></div>
        <div className="ft-ws-auto-stat"><b>{notifications.task}</b><span>Tareas</span></div>
        <div className="ft-ws-auto-stat"><b>{notifications.project}</b><span>Proyectos</span></div>
        <div className="ft-ws-auto-stat"><b>{notifications.reminder}</b><span>Alertas</span></div>
      </div>

      <div className="mt-4 space-y-2">
        {signals.length ? signals.map((signal) => {
          const Icon = signal.icon;
          return (
            <Link key={signal.id} href={signal.href} className="ft-ws-automation-signal" data-tone={signal.tone}>
              <span><Icon className="h-4 w-4" /></span>
              <div className="min-w-0 flex-1">
                <b>{signal.title}</b>
                <p>{signal.description}</p>
              </div>
              <em>{signal.label}</em>
            </Link>
          );
        }) : <div className="rounded-[18px] bg-emerald-50 p-4 text-sm font-bold text-emerald-700">No hay señales críticas. El workspace está listo para seguimiento normal.</div>}
      </div>

      {latest.length ? (
        <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
          {latest.map((item) => (
            <div key={item.id} className="ft-ws-notification-mini" data-unread={!item.isRead ? "true" : "false"}>
              <Bell className="h-4 w-4" />
              <div className="min-w-0">
                <b>{item.title}</b>
                <p>{item.body ?? item.entityType ?? "Notificación del workspace"}</p>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
