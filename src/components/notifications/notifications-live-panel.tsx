"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { MarkNotificationReadButton } from "@/components/notifications/mark-notification-read-button";
import { MarkAllNotificationsReadButton } from "@/components/notifications/mark-all-notifications-read-button";
import { useNotificationsRealtime, type LiveNotification } from "@/hooks/use-notifications-realtime";
import { useNotificationsState } from "@/components/notifications/notifications-provider";
import { formatDate } from "@/lib/utils/dates";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { isToday, isYesterday, parseISO } from "date-fns";

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

type FilterKey = "all" | "unread" | "task" | "project" | "comment" | "reminder";
type GroupKey = "today" | "yesterday" | "earlier";

const FILTERS: { value: FilterKey; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "unread", label: "No leídas" },
  { value: "task", label: "Tareas" },
  { value: "project", label: "Proyectos" },
  { value: "comment", label: "Comentarios" },
  { value: "reminder", label: "Recordatorios" },
];

function matchesFilter(item: LiveNotification, filter: FilterKey) {
  if (filter === "all") return true;
  if (filter === "unread") return !item.is_read;
  return item.entity_type === filter;
}


function isFilterKey(value: string | null): value is FilterKey {
  return Boolean(value && FILTERS.some((filter) => filter.value === value));
}

function getGroupKey(createdAt: string): GroupKey {
  const date = parseISO(createdAt);
  if (isToday(date)) return "today";
  if (isYesterday(date)) return "yesterday";
  return "earlier";
}

const GROUP_LABELS: Record<GroupKey, string> = {
  today: "Hoy",
  yesterday: "Ayer",
  earlier: "Anteriores",
};

export function NotificationsLivePanel({
  userId,
  initialNotifications,
  assignedTasks,
  triggeredReminders,
}: {
  userId: string;
  initialNotifications: LiveNotification[];
  assignedTasks: AssignedTask[];
  triggeredReminders: TriggeredReminder[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialFilterFromUrl = searchParams.get("filter");
  const [notifications, setNotifications] = useState(initialNotifications);
  const [activeFilter, setActiveFilter] = useState<FilterKey>(isFilterKey(initialFilterFromUrl) ? initialFilterFromUrl : "all");
  const { unreadCount, markOneAsRead, markAllAsRead } = useNotificationsState();

  useNotificationsRealtime({
    userId,
    onInsert: (row) => {
      setNotifications((current) => [row, ...current.filter((item) => item.id !== row.id)].slice(0, 50));
    },
    onUpdate: (row) => {
      setNotifications((current) => current.map((item) => (item.id === row.id ? row : item)));
    },
  });

  useEffect(() => {
    const filterFromUrl = searchParams.get("filter");
    if (isFilterKey(filterFromUrl) && filterFromUrl !== activeFilter) {
      setActiveFilter(filterFromUrl);
      return;
    }
    if (!filterFromUrl && activeFilter !== "all") {
      setActiveFilter("all");
    }
  }, [activeFilter, searchParams]);

  const setFilter = (value: FilterKey) => {
    setActiveFilter(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") params.delete("filter");
    else params.set("filter", value);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const visibleNotifications = useMemo(
    () => notifications.filter((item) => matchesFilter(item, activeFilter)),
    [activeFilter, notifications],
  );

  const groupedNotifications = useMemo(() => {
    return visibleNotifications.reduce<Record<GroupKey, LiveNotification[]>>((acc, item) => {
      const key = getGroupKey(item.created_at);
      acc[key].push(item);
      return acc;
    }, { today: [], yesterday: [], earlier: [] });
  }, [visibleNotifications]);

  const unreadVisibleIds = useMemo(
    () => visibleNotifications.filter((item) => !item.is_read).map((item) => item.id),
    [visibleNotifications],
  );

  const stats = useMemo(
    () => ({
      unreadCount,
      assignedCount: assignedTasks.length,
      remindersCount: triggeredReminders.length,
    }),
    [assignedTasks.length, triggeredReminders.length, unreadCount],
  );

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-slate-500">No leídas</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{stats.unreadCount}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Tareas asignadas</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{stats.assignedCount}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Recordatorios disparados</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{stats.remindersCount}</p>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Centro de notificaciones</h2>
              <p className="text-sm text-slate-500">Actualización en vivo sin refresh.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">En vivo</span>
              <MarkAllNotificationsReadButton
                ids={unreadVisibleIds}
                disabled={!unreadVisibleIds.length}
                onMarked={() => {
                  setNotifications((current) => current.map((row) => (
                    unreadVisibleIds.includes(row.id) ? { ...row, is_read: true } : row
                  )));
                  markAllAsRead(unreadVisibleIds.length);
                }}
              />
              <MarkAllNotificationsReadButton
                ids={notifications.filter((item) => !item.is_read).map((item) => item.id)}
                disabled={!notifications.some((item) => !item.is_read)}
                onMarked={() => {
                  const totalUnread = notifications.filter((item) => !item.is_read).length;
                  setNotifications((current) => current.map((row) => ({ ...row, is_read: true })));
                  markAllAsRead(totalUnread);
                }}
                label="Marcar todas como leídas"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {FILTERS.map((filter) => {
              const isActive = filter.value === activeFilter;
              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setFilter(filter.value)}
                  className={isActive
                    ? "rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white"
                    : "rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>

          <div className="mt-4 space-y-5">
            {visibleNotifications.length ? (["today", "yesterday", "earlier"] as GroupKey[]).map((groupKey) => {
              const items = groupedNotifications[groupKey];
              if (!items.length) return null;
              return (
                <div key={groupKey} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{GROUP_LABELS[groupKey]}</h3>
                    <span className="text-xs text-slate-400">{items.length} elemento(s)</span>
                  </div>
                  {items.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-medium text-slate-900">{item.title}</p>
                            {!item.is_read ? <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">Nueva</span> : null}
                            {item.entity_type ? <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-600">{item.entity_type}</span> : null}
                          </div>
                          {item.body ? <p className="mt-1 text-sm text-slate-600">{item.body}</p> : null}
                          <p className="mt-2 text-xs text-slate-500">{formatDate(item.created_at)}</p>
                        </div>
                        <MarkNotificationReadButton
                          id={item.id}
                          isRead={item.is_read}
                          onMarked={() => {
                            setNotifications((current) => current.map((row) => (row.id === item.id ? { ...row, is_read: true } : row)));
                            if (!item.is_read) markOneAsRead(item.id);
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              );
            }) : <p className="text-sm text-slate-500">No hay notificaciones para este filtro.</p>}
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Tareas asignadas</h2>
              <p className="text-sm text-slate-500">Lo que te asignaron recientemente.</p>
            </div>
            <div className="mt-4 space-y-3">
              {assignedTasks.length ? assignedTasks.map((item) => (
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
              {triggeredReminders.length ? triggeredReminders.map((item) => (
                <div key={item.id} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  <p>{item.task_id ? `Tarea ${item.task_id}` : `Proyecto ${item.project_id}`}</p>
                  <p className="mt-1 text-xs text-slate-500">Enviado: {formatDate(item.sent_at ?? new Date().toISOString())}</p>
                </div>
              )) : <p className="text-sm text-slate-500">Todavía no se han disparado recordatorios.</p>}
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
