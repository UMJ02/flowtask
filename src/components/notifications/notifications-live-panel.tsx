"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { isToday, isYesterday, parseISO } from "date-fns";
import { Search, SlidersHorizontal, Trash2, CheckCheck, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  void assignedTasks;
  void triggeredReminders;
  void digestPreview;
  void deliverySummary;

  const router = useRouter();
  const [notifications, setNotifications] = useState(initialNotifications);
  const [activeFilter, setActiveFilter] = useState<NotificationFilterKey>(initialFilter);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [isMarkingRead, setIsMarkingRead] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { unreadCount, markOneAsRead, markAllAsRead, setUnreadCount } = useNotificationsState();

  useNotificationsRealtime({
    userId,
    onInsert: (row) => setNotifications((current) => [row, ...current.filter((item) => item.id !== row.id)].slice(0, 100)),
    onUpdate: (row) => {
      if (row.deleted_at) {
        setNotifications((current) => current.filter((item) => item.id !== row.id));
        return;
      }
      setNotifications((current) => current.map((item) => (item.id === row.id ? { ...item, ...row } : item)));
    },
    onDeliveryInsert: (delivery) => {
      setNotifications((current) => withDelivery(current, delivery));
    },
  });

  const syncUrl = (nextFilter: NotificationFilterKey, nextQuery: string) => {
    const params = new URLSearchParams();
    if (nextFilter !== "all") params.set("filter", nextFilter);
    if (nextQuery.trim()) params.set("q", nextQuery.trim());
    router.replace(notificationsRoute(params.toString()), { scroll: false });
  };

  const filteredNotifications = useNotificationFilters(notifications, activeFilter, searchQuery);
  const visibleNotifications = useMemo(() => filteredNotifications, [filteredNotifications]);

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

  const visibleIds = useMemo(() => visibleNotifications.map((item) => item.id), [visibleNotifications]);
  const selectedVisibleIds = useMemo(() => selectedIds.filter((id) => visibleIds.includes(id)), [selectedIds, visibleIds]);
  const selectedUnreadCount = useMemo(
    () => visibleNotifications.filter((item) => selectedVisibleIds.includes(item.id) && !item.is_read).length,
    [selectedVisibleIds, visibleNotifications],
  );

  const toggleSelect = (id: string) => {
    setSelectedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const handleMarkSelectedRead = async () => {
    if (!selectedVisibleIds.length) return;
    setIsMarkingRead(true);
    setMessage(null);
    setError(null);
    const supabase = createClient();
    const { error: updateError } = await supabase.from("notifications").update({ is_read: true }).in("id", selectedVisibleIds);
    setIsMarkingRead(false);

    if (updateError) {
      setError("No se pudieron marcar las notificaciones seleccionadas.");
      return;
    }

    setNotifications((current) => current.map((item) => (selectedVisibleIds.includes(item.id) ? { ...item, is_read: true } : item)));
    if (selectedUnreadCount === 1) {
      const unreadItem = visibleNotifications.find((item) => selectedVisibleIds.includes(item.id) && !item.is_read);
      if (unreadItem) markOneAsRead(unreadItem.id);
    } else if (selectedUnreadCount > 1) {
      markAllAsRead(selectedUnreadCount);
    }
    setSelectedIds([]);
    setMessage("Las notificaciones seleccionadas ya se marcaron como leídas.");
  };

  const handleSelectVisible = () => {
    setSelectedIds(visibleIds);
    setMessage(visibleIds.length ? "Se seleccionaron las notificaciones visibles." : null);
    setError(null);
  };

  const handleDeleteSelected = async () => {
    if (!selectedVisibleIds.length) return;
    setIsDeleting(true);
    setMessage(null);
    setError(null);
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("notifications")
      .update({ deleted_at: new Date().toISOString() })
      .in("id", selectedVisibleIds);
    setIsDeleting(false);

    if (updateError) {
      setError("No se pudieron eliminar las notificaciones seleccionadas.");
      return;
    }

    const unreadHidden = visibleNotifications.filter((item) => selectedVisibleIds.includes(item.id) && !item.is_read).length;
    if (unreadHidden > 0) {
      setUnreadCount(Math.max(0, unreadCount - unreadHidden));
    }
    setNotifications((current) => current.filter((item) => !selectedVisibleIds.includes(item.id)));
    setSelectedIds([]);
    setMessage("Las seleccionadas se eliminaron del centro de notificaciones.");
    setError(null);
  };

  return (
    <Card className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Centro de notificaciones</h2>
          <p className="max-w-2xl text-sm text-slate-500">Usa búsqueda y filtros inteligentes para revisar solo lo que de verdad requiere atención.</p>
        </div>
        <span className="inline-flex w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          En vivo · {visibleNotifications.length}
        </span>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row">
        <label className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={searchQuery}
            onChange={(event) => {
              const nextValue = event.target.value;
              setSearchQuery(nextValue);
              syncUrl(activeFilter, nextValue);
            }}
            placeholder="Buscar por texto, cliente o proyecto"
            className="w-full rounded-2xl border border-slate-200 bg-white px-11 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-300"
          />
        </label>
        <Button type="button" variant="secondary" onClick={() => setFiltersOpen((value) => !value)} className="rounded-2xl">
          <SlidersHorizontal className="h-4 w-4" />
          {filtersOpen ? 'Ocultar filtros' : 'Filtros'}
        </Button>
      </div>

      {filtersOpen ? (
        <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Filtros inteligentes</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {NOTIFICATION_FILTERS.map((filter) => {
              const active = activeFilter === filter.value;
              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => {
                    setActiveFilter(filter.value);
                    syncUrl(filter.value, searchQuery);
                  }}
                  className={active
                    ? "rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white"
                    : "rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {message ? <p className="text-sm font-medium text-emerald-700">{message}</p> : null}
      {error ? <p className="text-sm font-medium text-rose-700">{error}</p> : null}

      <div className="min-h-[360px] rounded-[26px] border border-slate-200 bg-slate-50 p-4 md:p-5">
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
                    const checked = selectedIds.includes(item.id);
                    return (
                      <div key={item.id} className={`rounded-[24px] border px-4 py-4 transition ${checked ? "border-emerald-300 bg-emerald-50/60" : "border-slate-200 bg-white"}`}>
                        <div className="flex gap-3">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleSelect(item.id)}
                            className="mt-1 h-4 w-4 rounded border-slate-300"
                            aria-label={`Seleccionar ${item.title}`}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              {!item.is_read ? <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">Nueva</span> : null}
                              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">{item.entity_type ?? item.kind}</span>
                              <span className="text-xs text-slate-400">{formatDate(item.created_at)}</span>
                            </div>
                            <p className="mt-3 text-sm font-semibold text-slate-900">{item.title}</p>
                            <p className="mt-1 text-sm leading-6 text-slate-600">{item.body}</p>
                            {(item.deliveries ?? []).length ? (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {item.deliveries?.slice(0, 3).map((delivery) => (
                                  <span key={delivery.id} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                                    {delivery.channel}: {deliveryLabel(delivery.status)}
                                  </span>
                                ))}
                              </div>
                            ) : null}
                            {href ? (
                              <div className="mt-3">
                                <Link href={href} className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100">
                                  Abrir detalle
                                </Link>
                              </div>
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
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-600">
              No hay notificaciones para este filtro. Ajusta la búsqueda o abre los filtros inteligentes.
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="text-sm text-slate-500">{selectedVisibleIds.length ? `${selectedVisibleIds.length} seleccionada(s)` : 'Selecciona una o varias notificaciones para aplicar acciones.'}</div>
        <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="secondary" onClick={handleMarkSelectedRead} disabled={!selectedVisibleIds.length || isMarkingRead}>
          <CheckCheck className="h-4 w-4" />
          {isMarkingRead ? "Marcando..." : "Marcar como leídas"}
        </Button>
        <Button type="button" variant="secondary" onClick={handleSelectVisible} disabled={!visibleIds.length}>
          <Eye className="h-4 w-4" />
          Marcar visibles
        </Button>
        <Button type="button" variant="secondary" onClick={handleDeleteSelected} disabled={!selectedVisibleIds.length || isDeleting}>
          <Trash2 className="h-4 w-4" />
          {isDeleting ? 'Eliminando...' : 'Eliminar'}
        </Button>
        </div>
      </div>
    </Card>
  );
}
