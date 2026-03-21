"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { MarkNotificationReadButton } from "@/components/notifications/mark-notification-read-button";
import { useNotificationsRealtime, type LiveNotification } from "@/hooks/use-notifications-realtime";
import { useNotificationsState } from "@/components/notifications/notifications-provider";
import { formatDate } from "@/lib/utils/dates";

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
  const [notifications, setNotifications] = useState(initialNotifications);
  const { unreadCount, markOneAsRead } = useNotificationsState();

  useNotificationsRealtime({
    userId,
    onInsert: (row) => {
      setNotifications((current) => [row, ...current.filter((item) => item.id !== row.id)].slice(0, 50));
    },
    onUpdate: (row) => {
      setNotifications((current) => current.map((item) => (item.id === row.id ? row : item)));
    },
  });

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
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Centro de notificaciones</h2>
              <p className="text-sm text-slate-500">Actualización en vivo sin refresh.</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">En vivo</span>
          </div>
          <div className="mt-4 space-y-3">
            {notifications.length ? notifications.map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-900">{item.title}</p>
                      {!item.is_read ? <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">Nueva</span> : null}
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
