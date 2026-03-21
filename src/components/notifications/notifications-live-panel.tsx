"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { isToday, isYesterday, parseISO } from "date-fns";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { MarkNotificationReadButton } from "@/components/notifications/mark-notification-read-button";
import { MarkAllNotificationsReadButton } from "@/components/notifications/mark-all-notifications-read-button";
import { useNotificationsRealtime, type LiveNotification, type NotificationDelivery } from "@/hooks/use-notifications-realtime";
import { useNotificationsState } from "@/components/notifications/notifications-provider";
import { formatDate } from "@/lib/utils/dates";
import { NOTIFICATION_FILTERS, isNotificationFilterKey, useNotificationFilters, type NotificationFilterKey } from "@/hooks/use-notification-filters";

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

const GROUP_LABELS: Record<GroupKey, string> = { today: "Hoy", yesterday: "Ayer", earlier: "Anteriores" };

function getGroupKey(createdAt: string): GroupKey {
  const date = parseISO(createdAt);
  if (isToday(date)) return "today";
  if (isYesterday(date)) return "yesterday";
  return "earlier";
}

function buildNotificationHref(item: LiveNotification) {
  if (!item.entity_id) return null;
  if (item.entity_type === "task") return `/app/tasks/${item.entity_id}`;
  if (item.entity_type === "project") return `/app/projects/${item.entity_id}`;
  if (item.entity_type === "comment" && item.kind?.toLowerCase().includes("project")) return `/app/projects/${item.entity_id}`;
  if (item.entity_type === "comment") return `/app/tasks/${item.entity_id}`;
  return null;
}

function deliveryLabel(status: string) {
  if (status === "sent") return "Enviado";
  if (status === "failed") return "Falló";
  if (status === "skipped") return "Omitido";
  return "En cola";
}

function withDelivery(current: LiveNotification[], delivery: NotificationDelivery & { notification_id: string }) {
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

export function NotificationsLivePanel({
  userId,
  initialNotifications,
  assignedTasks,
  triggeredReminders,
  digestPreview,
  deliverySummary,
}: {
  userId: string;
  initialNotifications: LiveNotification[];
  assignedTasks: AssignedTask[];
  triggeredReminders: TriggeredReminder[];
  digestPreview: DigestPreview;
  deliverySummary: DeliverySummary;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialFilterFromUrl = searchParams.get("filter");
  const initialSearchFromUrl = searchParams.get("q") ?? "";
  const [notifications, setNotifications] = useState(initialNotifications);
  const [activeFilter, setActiveFilter] = useState<NotificationFilterKey>(isNotificationFilterKey(initialFilterFromUrl) ? initialFilterFromUrl : "all");
  const [searchQuery, setSearchQuery] = useState(initialSearchFromUrl);
  const [liveDeliverySummary, setLiveDeliverySummary] = useState(deliverySummary);
  const { unreadCount, markOneAsRead, markAllAsRead } = useNotificationsState();

  useNotificationsRealtime({
    userId,
    onInsert: (row) =>
      setNotifications((current) => [row, ...current.filter((item) => item.id !== row.id)].slice(0, 100)),
    onUpdate: (row) =>
      setNotifications((current) => current.map((item) => (item.id === row.id ? { ...item, ...row } : item))),
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

  useEffect(() => {
    const filterFromUrl = searchParams.get("filter");
    const q = searchParams.get("q") ?? "";
    if (isNotificationFilterKey(filterFromUrl) && filterFromUrl !== activeFilter) setActiveFilter(filterFromUrl);
    if (!filterFromUrl && activeFilter !== "all") setActiveFilter("all");
    if (q !== searchQuery) setSearchQuery(q);
  }, [activeFilter, searchParams, searchQuery]);

  const syncUrl = (nextFilter: NotificationFilterKey, nextQuery: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (nextFilter === "all") params.delete("filter");
    else params.set("filter", nextFilter);
    if (nextQuery.trim()) params.set("q", nextQuery.trim());
    else params.delete("q");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
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

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4 xl:grid-cols-8">
        <Card><p className="text-sm text-slate-500">No leídas</p><p className="mt-2 text-3xl font-semibold text-slate-900">{unreadCount}</p></Card>
        <Card><p className="text-sm text-slate-500">Tareas asignadas</p><p className="mt-2 text-3xl font-semibold text-slate-900">{assignedTasks.length}</p></Card>
        <Card><p className="text-sm text-slate-500">Recordatorios disparados</p><p className="mt-2 text-3xl font-semibold text-slate-900">{triggeredReminders.length}</p></Card>
        <Card><p className="text-sm text-slate-500">Resumen diario</p><p className="mt-2 text-lg font-semibold text-slate-900">{digestPreview ? digestPreview.status : "Pendiente"}</p></Card>
        <Card><p className="text-sm text-slate-500">Entregas</p><p className="mt-2 text-3xl font-semibold text-slate-900">{liveDeliverySummary.total}</p></Card>
        <Card><p className="text-sm text-slate-500">Enviadas</p><p className="mt-2 text-3xl font-semibold text-emerald-700">{liveDeliverySummary.sent}</p></Card>
        <Card><p className="text-sm text-slate-500">Fallidas</p><p className="mt-2 text-3xl font-semibold text-rose-700">{liveDeliverySummary.failed}</p></Card>
        <Card><p className="text-sm text-slate-500">Pendientes</p><p className="mt-2 text-3xl font-semibold text-amber-700">{liveDeliverySummary.pending}</p></Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Centro de notificaciones</h2>
              <p className="text-sm text-slate-500">Actualización en vivo y estado de entrega por canal.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">En vivo</span>
              <MarkAllNotificationsReadButton
                ids={unreadVisibleIds}
                disabled={!unreadVisibleIds.length}
                onMarked={() => {
                  setNotifications((current) => current.map((row) => (unreadVisibleIds.includes(row.id) ? { ...row, is_read: true } : row)));
                  markAllAsRead(unreadVisibleIds.length);
                }}
              />
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
            <input
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                syncUrl(activeFilter, event.target.value);
              }}
              placeholder="Buscar por texto, cliente o proyecto..."
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 placeholder:text-slate-400"
            />
            <div className="flex flex-wrap gap-2">
              {NOTIFICATION_FILTERS.map((filter) => {
                const isActive = filter.value === activeFilter;
                return (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => {
                      setActiveFilter(filter.value);
                      syncUrl(filter.value, searchQuery);
                    }}
                    className={
                      isActive
                        ? "rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white"
                        : "rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    }
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 space-y-5">
            {visibleNotifications.length ? (
              (["today", "yesterday", "earlier"] as GroupKey[]).map((groupKey) => {
                const items = groupedNotifications[groupKey];
                if (!items.length) return null;
                return (
                  <div key={groupKey} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{GROUP_LABELS[groupKey]}</h3>
                      <span className="text-xs text-slate-400">{items.length} elemento(s)</span>
                    </div>
                    {items.map((item) => {
                      const href = buildNotificationHref(item);
                      return (
                        <div key={item.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="truncate text-sm font-medium text-slate-900">{item.title}</p>
                                {!item.is_read ? <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">Nueva</span> : null}
                                {item.entity_type ? <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-600">{item.entity_type}</span> : null}
                              </div>
                              {item.body ? <p className="mt-1 text-sm text-slate-600">{item.body}</p> : null}
                              {item.deliveries?.length ? (
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {item.deliveries.slice(0, 4).map((delivery, index) => (
                                    <span
                                      key={`${delivery.channel}-${index}`}
                                      className={
                                        delivery.status === "sent"
                                          ? "rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-semibold text-emerald-700"
                                          : delivery.status === "failed"
                                            ? "rounded-full bg-rose-100 px-2 py-1 text-[11px] font-semibold text-rose-700"
                                            : "rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600"
                                      }
                                    >
                                      {delivery.channel}: {deliveryLabel(delivery.status)}{delivery.attempt_number ? ` · intento ${delivery.attempt_number}` : ""}
                                    </span>
                                  ))}
                                </div>
                              ) : null}
                              <div className="mt-3 flex flex-wrap items-center gap-2">
                                {href ? (
                                  <Link href={href} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                                    {href.includes("/tasks/") ? "Ir a tarea" : "Ir a proyecto"}
                                  </Link>
                                ) : null}
                                <MarkNotificationReadButton
                                  id={item.id}
                                  isRead={item.is_read}
                                  onMarked={() => {
                                    setNotifications((current) => current.map((row) => (row.id === item.id ? { ...row, is_read: true } : row)));
                                    if (!item.is_read) markOneAsRead(item.id);
                                  }}
                                />
                              </div>
                              <p className="mt-2 text-xs text-slate-500">{formatDate(item.created_at)}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-slate-500">No hay notificaciones para este filtro.</p>
            )}
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <h2 className="text-lg font-semibold text-slate-900">Último resumen diario</h2>
            {digestPreview ? (
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <p className="font-semibold text-slate-900">{digestPreview.summary_title}</p>
                <p>{digestPreview.summary_body}</p>
                <p className="text-xs text-slate-500">Fecha: {digestPreview.digest_date} · Estado: {digestPreview.status}</p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500">Todavía no se ha generado un resumen diario.</p>
            )}
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-slate-900">Entregas fallidas</h2>
            <div className="mt-4 space-y-3">
              {notifications
                .flatMap((item) => (item.deliveries ?? []).map((delivery) => ({ delivery, title: item.title })))
                .filter((item) => item.delivery.status === "failed")
                .slice(0, 6)
                .map((item, index) => (
                  <div key={`${item.title}-${index}`} className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-800">
                    <p className="font-medium">{item.title}</p>
                    <p className="mt-1 text-xs">{item.delivery.channel} · intento {item.delivery.attempt_number ?? 1}</p>
                    {item.delivery.error_message ? <p className="mt-1 text-xs">{item.delivery.error_message}</p> : null}
                    {item.delivery.retry_after ? <p className="mt-1 text-xs">Reintento después de: {formatDate(item.delivery.retry_after)}</p> : null}
                  </div>
                ))}
              {!notifications.some((item) => (item.deliveries ?? []).some((delivery) => delivery.status === "failed")) ? (
                <p className="text-sm text-slate-500">No hay entregas fallidas recientes.</p>
              ) : null}
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-slate-900">Tareas asignadas</h2>
            <div className="mt-4 space-y-3">
              {assignedTasks.length ? (
                assignedTasks.map((item) => (
                  <div key={item.id} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                    <p className="font-medium text-slate-900">{item.tasks?.title ?? "Tarea"}</p>
                    <p className="mt-1 text-xs text-slate-500">Estado: {item.tasks?.status ?? "-"}</p>
                    {item.tasks?.id ? (
                      <Link href={`/app/tasks/${item.tasks.id}`} className="mt-2 inline-flex rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-white">
                        Ir a tarea
                      </Link>
                    ) : null}
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No tienes tareas asignadas recientes.</p>
              )}
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
