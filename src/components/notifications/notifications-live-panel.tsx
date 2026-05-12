"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { isToday, isYesterday, parseISO } from "date-fns";
import { Search, SlidersHorizontal, Trash2, CheckCheck, Eye, BellRing, CheckSquare, FolderOpen, MessageSquare, UserPlus, BarChart3, Settings } from "lucide-react";
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

function filterCount(notifications: LiveNotification[], filter: NotificationFilterKey) {
  if (filter === "all") return notifications.length;
  if (filter === "unread") return notifications.filter((item) => !item.is_read).length;
  if (filter === "task") return notifications.filter((item) => item.entity_type === "task").length;
  if (filter === "project") return notifications.filter((item) => item.entity_type === "project").length;
  if (filter === "comment") return notifications.filter((item) => item.entity_type === "comment").length;
  if (filter === "reminder") return notifications.filter((item) => item.entity_type === "reminder").length;
  return notifications.length;
}

function displayFilterLabel(value: NotificationFilterKey, baseLabel: string) {
  if (value === "task") return "Asignadas a mí";
  if (value === "project") return "Actualizaciones";
  if (value === "comment") return "Menciones";
  if (value === "reminder") return "Sistema";
  return baseLabel;
}

function getNotificationVisual(item: LiveNotification) {
  const kind = `${item.entity_type ?? item.kind ?? ""}`.toLowerCase();
  if (kind.includes("task")) return { icon: CheckSquare, bg: "bg-[#ECFDF5]", color: "text-[#16C784]" };
  if (kind.includes("comment")) return { icon: MessageSquare, bg: "bg-[#EFF6FF]", color: "text-[#2563EB]" };
  if (kind.includes("project")) return { icon: FolderOpen, bg: "bg-[#FEF3C7]", color: "text-[#D97706]" };
  if (kind.includes("reminder")) return { icon: BellRing, bg: "bg-[#F5F3FF]", color: "text-[#7C3AED]" };
  if (kind.includes("user")) return { icon: UserPlus, bg: "bg-[#F5F3FF]", color: "text-[#7C3AED]" };
  if (kind.includes("report")) return { icon: BarChart3, bg: "bg-[#ECFDF5]", color: "text-[#16C784]" };
  return { icon: Settings, bg: "bg-[#F1F5F9]", color: "text-[#64748B]" };
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
    <Card className="ft-notifications-ui-panel overflow-hidden p-0">
      <div className="p-3 md:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-[18px] font-extrabold tracking-[-0.03em] text-[#0F172A]">Centro de notificaciones</h2>
            <p className="mt-1 max-w-3xl text-sm font-medium text-[#475569]">
              Usa búsqueda y filtros inteligentes para revisar solo lo que de verdad requiere atención.
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#ECFDF5] px-4 py-2 text-xs font-extrabold text-[#0E9F6E]">
            <span className="h-2 w-2 rounded-full bg-[#16C784]" />
            En vivo · {visibleNotifications.length}
          </span>
        </div>

        <div className="mt-5 flex flex-col gap-3 lg:flex-row">
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <input
              value={searchQuery}
              onChange={(event) => {
                const nextValue = event.target.value;
                setSearchQuery(nextValue);
                syncUrl(activeFilter, nextValue);
              }}
              placeholder="Buscar por texto, cliente o proyecto"
              className="ft-notification-search w-full px-4 py-3 text-sm font-semibold text-[#334155] outline-none transition focus:border-[#16C784]"
            />
          </label>
          <Button type="button" variant="secondary" onClick={() => setFiltersOpen((value) => !value)} className="h-[50px] rounded-full ft-border px-3 font-extrabold">
            <SlidersHorizontal className="h-4 w-4" />
            {filtersOpen ? 'Ocultar filtros' : 'Filtros'}
          </Button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {NOTIFICATION_FILTERS.filter((filter) => ["all", "unread", "comment", "task", "project", "reminder"].includes(filter.value)).map((filter) => {
            const active = activeFilter === filter.value;
            const count = filterCount(notifications, filter.value);
            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => {
                  setActiveFilter(filter.value);
                  syncUrl(filter.value, searchQuery);
                }}
                className={active ? "ft-notifications-system-chip ft-notification-chip-active" : "ft-notifications-system-chip"}
              >
                {displayFilterLabel(filter.value, filter.label)}{filter.value !== "all" ? ` · ${count}` : ""}
              </button>
            );
          })}
        </div>

        {filtersOpen ? (
          <div className="mt-4 rounded-[16px] border ft-border bg-[#F8FAFC] p-4">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#64748B]">Filtros de entrega</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {NOTIFICATION_FILTERS.filter((filter) => ["delivery_failed", "delivery_pending", "delivery_sent"].includes(filter.value)).map((filter) => {
                const active = activeFilter === filter.value;
                return (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => {
                      setActiveFilter(filter.value);
                      syncUrl(filter.value, searchQuery);
                    }}
                    className={active ? "ft-notifications-system-chip ft-notification-chip-active" : "ft-notifications-system-chip"}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {message ? <p className="mt-3 text-sm font-bold text-[#0E9F6E]">{message}</p> : null}
        {error ? <p className="mt-3 text-sm font-bold text-rose-700">{error}</p> : null}
      </div>

      <div className="border-t ft-border bg-[#FBFCFE] px-3 py-4 md:px-4">
        <div className="space-y-3">
          {(["today", "yesterday", "earlier"] as GroupKey[]).map((groupKey) => {
            const items = groupedNotifications[groupKey];
            if (!items.length) return null;
            return (
              <div key={groupKey}>
                <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.16em] text-[#0F172A]">{GROUP_LABELS[groupKey]}</p>
                <div className="space-y-3">
                  {items.map((item) => {
                    const href = buildNotificationHref(item);
                    const checked = selectedIds.includes(item.id);
                    const visual = getNotificationVisual(item);
                    const Icon = visual.icon;
                    return (
                      <div key={item.id} className={`ft-notification-system-row ${checked ? "border-[#16C784] bg-[#ECFDF5]" : ""}`}>
                        <div className="flex items-center gap-4">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleSelect(item.id)}
                            className="h-4 w-4 rounded border-slate-300 accent-[#16C784]"
                            aria-label={`Seleccionar ${item.title}`}
                          />
                          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] ${visual.bg}`}>
                            <Icon className={`h-5 w-5 ${visual.color}`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-extrabold text-[#0F172A]">{item.title}</p>
                                <p className="mt-1 line-clamp-2 text-sm font-medium leading-6 text-[#334155]">{item.body}</p>
                              </div>
                              <div className="flex shrink-0 items-center gap-3 text-sm font-semibold text-[#475569]">
                                <span>{formatDate(item.created_at)}</span>
                                {!item.is_read ? <span className="ft-notification-status">No leída</span> : <span className="rounded-full bg-[#F1F5F9] px-3 py-1 text-[11px] font-extrabold text-[#64748B]">Leída</span>}
                                <button type="button" aria-label="Más opciones" className="text-[#64748B]">•••</button>
                              </div>
                            </div>
                            {(item.deliveries ?? []).length ? (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {item.deliveries?.slice(0, 3).map((delivery) => (
                                  <span key={delivery.id} className="rounded-full bg-[#F1F5F9] px-3 py-1 text-xs font-bold text-[#475569]">
                                    {delivery.channel}: {deliveryLabel(delivery.status)}
                                  </span>
                                ))}
                              </div>
                            ) : null}
                            {href ? (
                              <div className="mt-3">
                                <Link href={href} className="inline-flex rounded-full border ft-border bg-white px-3 py-2 text-xs font-extrabold text-[#334155] transition hover:bg-[#F8FAFC]">
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
            <div className="rounded-[18px] border border-dashed border-[#CBD5E1] bg-white p-4 text-sm font-semibold text-[#64748B]">
              No hay notificaciones para este filtro. Ajusta la búsqueda o abre los filtros inteligentes.
            </div>
          ) : null}
        </div>
      </div>

      <div className="ft-notification-actionbar flex flex-col gap-3 px-3 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between md:px-4">
        <div>
          <p className="text-sm font-extrabold text-[#334155]">{selectedVisibleIds.length ? `${selectedVisibleIds.length} seleccionada(s)` : '0 seleccionadas'}</p>
          <p className="mt-1 text-sm font-medium text-[#64748B]">Selecciona una o varias notificaciones para aplicar acciones.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="secondary" onClick={handleMarkSelectedRead} disabled={!selectedVisibleIds.length || isMarkingRead} className="rounded-[14px] ft-border">
            <CheckCheck className="h-4 w-4" />
            {isMarkingRead ? "Marcando..." : "Marcar como leídas"}
          </Button>
          <Button type="button" variant="secondary" onClick={handleSelectVisible} disabled={!visibleIds.length} className="rounded-[14px] ft-border">
            <Eye className="h-4 w-4" />
            Marcar visibles
          </Button>
          <Button type="button" variant="secondary" onClick={handleDeleteSelected} disabled={!selectedVisibleIds.length || isDeleting} className="rounded-[14px] border-rose-200 text-rose-600 hover:bg-rose-50">
            <Trash2 className="h-4 w-4" />
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </div>
      </div>
    </Card>
  );

}
