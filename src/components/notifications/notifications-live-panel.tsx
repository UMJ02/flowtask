"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { isToday, isYesterday, parseISO } from "date-fns";
import { ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { MarkNotificationReadButton } from "@/components/notifications/mark-notification-read-button";
import { MarkAllNotificationsReadButton } from "@/components/notifications/mark-all-notifications-read-button";
import { ArchiveReadNotificationsButton } from "@/components/notifications/archive-read-notifications-button";
import { useNotificationsRealtime, type LiveNotification, type NotificationDelivery } from "@/hooks/use-notifications-realtime";
import { useNotificationsState } from "@/components/notifications/notifications-provider";
import { notificationsRoute, projectDetailRoute, taskDetailRoute, type AppRoute } from "@/lib/navigation/routes";
import { formatDate } from "@/lib/utils/dates";
import { NOTIFICATION_FILTERS, useNotificationFilters, type NotificationFilterKey } from "@/hooks/use-notification-filters";

type AssignedTask = {
  id: string;
  assigned_at: string;
  tasks?: { id?: string; title?: string; status?: string; due_date?: string | null; client_name?: string | null } | null;
};

type TriggeredReminder = {
  id: string;
  sent_at: string | null;
  task_id: string | null;
  project_id: string | null;
};

type DigestPreview = {
  id: string;
  digest_date: string;
  status: string;
  total_notifications: number;
  summary_title: string;
  summary_body: string | null;
  processed_at: string | null;
} | null;

type DeliverySummary = {
  total: number;
  sent: number;
  failed: number;
  pending: number;
};

type GroupKey = "today" | "yesterday" | "earlier";
type InsightKey = "digest" | "failed" | "tasks";

const GROUP_LABELS: Record<GroupKey, string> = { today: "Hoy", yesterday: "Ayer", earlier: "Anteriores" };

function getGroupKey(createdAt: string): GroupKey {
  const date = parseISO(createdAt);
  if (isToday(date)) return "today";
  if (isYesterday(date)) return "yesterday";
  return "earlier";
}

function buildNotificationHref(item: LiveNotification): AppRoute | null {
  if (!item.entity_id) return null;
  if (item.entity_type === "task") return taskDetailRoute(item.entity_id);
  if (item.entity_type === "project") return projectDetailRoute(item.entity_id);
  if (item.entity_type === "comment" && item.kind?.toLowerCase().includes("project")) return projectDetailRoute(item.entity_id);
  if (item.entity_type === "comment") return taskDetailRoute(item.entity_id);
  return null;
}

function deliveryLabel(status: string) {
  if (status === "sent") return "Enviado";
  if (status === "failed") return "Falló";
  if (status === "skipped") return "Omitido";
  return "En cola";
}

function withDelivery(current: LiveNotification[], delivery: NotificationDelivery) {
  return current.map((item) => {
    if (item.id !== delivery.notification_id) return item;
    return {
      ...item,
      deliveries: [delivery, ...(item.deliveries ?? [])],
    };
  });
}

function summarizeDeliveries(notifications: LiveNotification[]): DeliverySummary {
  return notifications
    .flatMap((item) => item.deliveries ?? [])
    .reduce(
      (acc, item) => {
        acc.total += 1;
        if (item.status === "sent") acc.sent += 1;
        else if (item.status === "failed") acc.failed += 1;
        else acc.pending += 1;
        return acc;
      },
      { total: 0, sent: 0, failed: 0, pending: 0 } as DeliverySummary,
    );
}

function InsightSelector({
  active,
  onChange,
  hasFailed,
  assignedCount,
}: {
  active: InsightKey;
  onChange: (value: InsightKey) => void;
  hasFailed: boolean;
  assignedCount: number;
}) {
  const items: Array<{ key: InsightKey; label: string; meta: string }> = [
    { key: "digest", label: "Resumen diario", meta: "Último consolidado" },
    { key: "failed", label: "Entregas fallidas", meta: hasFailed ? "Requieren atención" : "Sin alertas" },
    { key: "tasks", label: "Tareas asignadas", meta: assignedCount ? `${assignedCount} activas` : "Sin pendientes" },
  ];

  return (
    <div className="grid gap-2 md:grid-cols-3">
      {items.map((item) => {
        const isActive = item.key === active;
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onChange(item.key)}
            className={isActive
              ? "rounded-2xl border border-slate-900 bg-slate-900 px-4 py-3 text-left text-white shadow-sm"
              : "rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-slate-700 transition hover:border-slate-300 hover:bg-white"}
          >
            <p className={isActive ? "text-sm font-semibold text-white" : "text-sm font-semibold text-slate-900"}>{item.label}</p>
            <p className={isActive ? "mt-1 text-xs text-slate-200" : "mt-1 text-xs text-slate-500"}>{item.meta}</p>
          </button>
        );
      })}
    </div>
  );
}

export function NotificationsLivePanel({
  userId,
  initialNotifications,
  assignedTasks,
  triggeredReminders,
  digestPreview,
  deliverySummary,
  initialFilter = "all",
  initialSearch = "",
}: {
  userId: string;
  initialNotifications: LiveNotification[];
  assignedTasks: AssignedTask[];
  triggeredReminders: TriggeredReminder[];
  digestPreview: DigestPreview;
  deliverySummary: DeliverySummary;
  initialFilter?: NotificationFilterKey;
  initialSearch?: string;
}) {
  const router = useRouter();
  const [notifications, setNotifications] = useState(initialNotifications);
  const [activeFilter, setActiveFilter] = useState<NotificationFilterKey>(initialFilter);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [liveDeliverySummary, setLiveDeliverySummary] = useState(deliverySummary);
  const [activeInsight, setActiveInsight] = useState<InsightKey>("digest");
  const [advancedOpen, setAdvancedOpen] = useState(initialFilter !== "all");
  const { markOneAsRead, markAllAsRead } = useNotificationsState();

  useNotificationsRealtime({
    userId,
    onInsert: (row) => setNotifications((current) => [row, ...current.filter((item) => item.id !== row.id)].slice(0, 100)),
    onUpdate: (row) => setNotifications((current) => current.map((item) => (item.id === row.id ? { ...item, ...row } : item))),
    onDeliveryInsert: (delivery) => {
      setNotifications((current) => {
        const next = withDelivery(current, delivery);
        setLiveDeliverySummary(summarizeDeliveries(next));
        return next;
      });
    },
  });

  useEffect(() => {
    setLiveDeliverySummary(summarizeDeliveries(notifications));
  }, [notifications]);

  const syncUrl = (nextFilter: NotificationFilterKey, nextQuery: string) => {
    const params = new URLSearchParams();
    if (nextFilter !== "all") params.set("filter", nextFilter);
    if (nextQuery.trim()) params.set("q", nextQuery.trim());
    router.replace(notificationsRoute(params.toString()), { scroll: false });
  };

  const visibleNotifications = useNotificationFilters(notifications, activeFilter, searchQuery);
  const groupedNotifications = useMemo(
    () =>
      visibleNotifications.reduce<Record<GroupKey, LiveNotification[]>>(
        (acc, item) => {
          const key = getGroupKey(item.created_at);
          acc[key].push(item);
          return acc;
        },
        { today: [], yesterday: [], earlier: [] },
      ),
    [visibleNotifications],
  );
  const unreadVisibleIds = useMemo(() => visibleNotifications.filter((item) => !item.is_read).map((item) => item.id), [visibleNotifications]);
  const readVisibleIds = useMemo(() => visibleNotifications.filter((item) => item.is_read).map((item) => item.id), [visibleNotifications]);
  const failedDeliveries = useMemo(
    () => notifications.flatMap((item) => item.deliveries ?? []).filter((delivery) => delivery.status === "failed").slice(0, 4),
    [notifications],
  );
  const latestReminderText = triggeredReminders.length
    ? `${triggeredReminders.length} recordatorio${triggeredReminders.length === 1 ? "" : "s"} enviado${triggeredReminders.length === 1 ? "" : "s"} recientemente.`
    : "Sin recordatorios recientes.";

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <Card className="border-slate-200/80 bg-[linear-gradient(180deg,rgba(15,23,42,0.035)_0%,rgba(255,255,255,0.98)_100%)] space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Centro de notificaciones</h2>
              <p className="text-sm text-slate-500">Revisa avisos del equipo y el estado de sus entregas en un solo lugar.</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">En vivo</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <MarkAllNotificationsReadButton
              ids={unreadVisibleIds}
              disabled={!unreadVisibleIds.length}
              onMarked={() => {
                setNotifications((current) => current.map((row) => (unreadVisibleIds.includes(row.id) ? { ...row, is_read: true } : row)));
                markAllAsRead(unreadVisibleIds.length);
              }}
            />
            <ArchiveReadNotificationsButton
              disabled={!readVisibleIds.length}
              onArchived={() => {
                setNotifications((current) => current.filter((row) => !readVisibleIds.includes(row.id)));
              }}
            />
          </div>

          <div className="border-t border-slate-200/80" />

          <div className="space-y-3">
            <div className="flex flex-col gap-3 lg:flex-row">
              <label className="min-w-0 flex-1">
                <span className="sr-only">Buscar notificaciones</span>
                <input
                  value={searchQuery}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    setSearchQuery(nextValue);
                    syncUrl(activeFilter, nextValue);
                  }}
                  placeholder="Buscar por texto, cliente o proyecto"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-300"
                />
              </label>

              <button
                type="button"
                onClick={() => setAdvancedOpen((current) => !current)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Búsqueda avanzada
                {advancedOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </div>

            {advancedOpen ? (
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                <div className="grid gap-3 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-end">
                  <label>
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Filtro</span>
                    <select
                      value={activeFilter}
                      onChange={(event) => {
                        const nextFilter = event.target.value as NotificationFilterKey;
                        setActiveFilter(nextFilter);
                        syncUrl(nextFilter, searchQuery);
                      }}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-300"
                    >
                      {NOTIFICATION_FILTERS.map((filter) => (
                        <option key={filter.value} value={filter.value}>
                          {filter.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <p className="text-sm text-slate-500">Usa filtros cuando quieras separar solo pendientes, errores de entrega o notificaciones por tipo.</p>
                </div>
              </div>
            ) : null}
          </div>

          <div className="space-y-4">
            {(["today", "yesterday", "earlier"] as GroupKey[]).map((groupKey) => {
              const items = groupedNotifications[groupKey];
              if (!items.length) return null;
              return (
                <div key={groupKey}>
                  <p className="mb-2 text-sm font-semibold text-slate-500">{GROUP_LABELS[groupKey]}</p>
                  <div className="space-y-3">
                    {items.map((item) => {
                      const href = buildNotificationHref(item);
                      return (
                        <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4">
                          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                {!item.is_read ? <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">Nuevo</span> : null}
                                <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200">{item.entity_type}</span>
                                <span className="text-xs text-slate-400">{formatDate(item.created_at)}</span>
                              </div>
                              <p className="mt-3 text-sm font-semibold text-slate-900">{item.title}</p>
                              <p className="mt-1 text-sm leading-6 text-slate-600">{item.body}</p>
                              {(item.deliveries ?? []).length ? (
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {item.deliveries?.slice(0, 3).map((delivery) => (
                                    <span key={delivery.id} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                                      {delivery.channel}: {deliveryLabel(delivery.status)}
                                    </span>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                              {href ? (
                                <Link href={href} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100">
                                  Abrir
                                </Link>
                              ) : null}
                              {!item.is_read ? (
                                <MarkNotificationReadButton
                                  id={item.id}
                                  isRead={item.is_read}
                                  onMarked={() => {
                                    setNotifications((current) => current.map((row) => (row.id === item.id ? { ...row, is_read: true } : row)));
                                    markOneAsRead(item.id);
                                  }}
                                />
                              ) : null}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {!visibleNotifications.length ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
                No hay notificaciones para este filtro. Prueba con otro tipo o busca un texto diferente.
              </div>
            ) : null}
          </div>
        </Card>

        <Card className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Panel de seguimiento</h3>
            <p className="mt-1 text-sm text-slate-500">Concentra el resumen diario, las fallas de entrega y las tareas asignadas en un solo bloque para reducir ruido visual.</p>
          </div>

          <InsightSelector
            active={activeInsight}
            onChange={setActiveInsight}
            hasFailed={failedDeliveries.length > 0 || liveDeliverySummary.failed > 0}
            assignedCount={assignedTasks.length}
          />

          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
            {activeInsight === "digest" ? (
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">{digestPreview?.status ?? "Pendiente"}</span>
                  <span className="text-xs text-slate-400">{digestPreview?.processed_at ? formatDate(digestPreview.processed_at) : latestReminderText}</span>
                </div>
                <h4 className="mt-4 text-lg font-semibold text-slate-900">Último resumen diario</h4>
                <p className="mt-2 text-sm leading-6 text-slate-600">{digestPreview?.summary_body ?? "Todavía no se ha generado un resumen diario."}</p>
              </div>
            ) : null}

            {activeInsight === "failed" ? (
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">{liveDeliverySummary.failed} fallidas</span>
                  <span className="text-xs text-slate-400">{liveDeliverySummary.total} entregas revisadas</span>
                </div>
                <h4 className="mt-4 text-lg font-semibold text-slate-900">Entregas fallidas</h4>
                <div className="mt-3 space-y-3">
                  {failedDeliveries.length ? (
                    failedDeliveries.map((delivery) => (
                      <div key={delivery.id} className="rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-600">
                        <p className="font-semibold text-slate-900">{delivery.channel}</p>
                        <p className="mt-1">{delivery.error_message ?? "No se pudo completar el envío."}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-600">No hay entregas fallidas recientes.</p>
                  )}
                </div>
              </div>
            ) : null}

            {activeInsight === "tasks" ? (
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">{assignedTasks.length} asignadas</span>
                  <span className="text-xs text-slate-400">{latestReminderText}</span>
                </div>
                <h4 className="mt-4 text-lg font-semibold text-slate-900">Tareas asignadas</h4>
                <div className="mt-3 space-y-3">
                  {assignedTasks.length ? (
                    assignedTasks.slice(0, 4).map((task) => (
                      <div key={task.id} className="rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-600">
                        <p className="font-semibold text-slate-900">{task.tasks?.title ?? "Tarea sin título"}</p>
                        <p className="mt-1">{task.tasks?.client_name ?? "Sin cliente"} · {task.tasks?.status ?? "Pendiente"}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-600">No tienes tareas asignadas recientes.</p>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </Card>
      </section>
    </div>
  );
}
