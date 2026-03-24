"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { useNotificationsRealtime, type LiveNotification } from "@/hooks/use-notifications-realtime";

type ToastItem = Pick<LiveNotification, "id" | "title" | "body" | "kind">;
type DeliveryFrequency = "immediate" | "daily";

type ClientNotificationPreferences = {
  enable_task: boolean;
  enable_project: boolean;
  enable_comment: boolean;
  enable_reminder: boolean;
  enable_toasts: boolean;
  delivery_frequency: DeliveryFrequency;
  quiet_hours_enabled: boolean;
  quiet_hours_start: number;
  quiet_hours_end: number;
};

type NotificationsContextValue = {
  unreadCount: number;
  markOneAsRead: (id: string) => void;
  markAllAsRead: (count?: number) => void;
  setUnreadCount: (value: number) => void;
  recentToasts: ToastItem[];
};

const DEFAULT_PREFERENCES: ClientNotificationPreferences = {
  enable_task: true,
  enable_project: true,
  enable_comment: true,
  enable_reminder: true,
  enable_toasts: true,
  delivery_frequency: "immediate",
  quiet_hours_enabled: false,
  quiet_hours_start: 22,
  quiet_hours_end: 7,
};

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

function isEnabledByType(item: LiveNotification, preferences: ClientNotificationPreferences) {
  if (item.entity_type === "task") return preferences.enable_task;
  if (item.entity_type === "project") return preferences.enable_project;
  if (item.entity_type === "comment") return preferences.enable_comment;
  if (item.entity_type === "reminder") return preferences.enable_reminder;
  return true;
}

function isWithinQuietHours(preferences: ClientNotificationPreferences, date = new Date()) {
  if (!preferences.quiet_hours_enabled) return false;
  const hour = date.getHours();
  const start = preferences.quiet_hours_start;
  const end = preferences.quiet_hours_end;
  if (start === end) return true;
  if (start < end) return hour >= start && hour < end;
  return hour >= start || hour < end;
}

export function NotificationsProvider({
  children,
  userId,
  initialUnreadCount,
}: {
  children: React.ReactNode;
  userId: string;
  initialUnreadCount: number;
}) {
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [preferences, setPreferences] = useState<ClientNotificationPreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    let cancelled = false;
    async function loadPreferences() {
      try {
        const response = await fetch('/api/notification-preferences', { cache: 'no-store' });
        if (!response.ok) return;
        const result = await response.json();
        if (!cancelled && result?.data) {
          setPreferences({
            enable_task: Boolean(result.data.enable_task),
            enable_project: Boolean(result.data.enable_project),
            enable_comment: Boolean(result.data.enable_comment),
            enable_reminder: Boolean(result.data.enable_reminder),
            enable_toasts: Boolean(result.data.enable_toasts),
            delivery_frequency: result.data.delivery_frequency === 'daily' ? 'daily' : 'immediate',
            quiet_hours_enabled: Boolean(result.data.quiet_hours_enabled),
            quiet_hours_start: Number.isFinite(Number(result.data.quiet_hours_start)) ? Number(result.data.quiet_hours_start) : 22,
            quiet_hours_end: Number.isFinite(Number(result.data.quiet_hours_end)) ? Number(result.data.quiet_hours_end) : 7,
          });
        }
      } catch {}
    }
    void loadPreferences();
    return () => {
      cancelled = true;
    };
  }, []);

  const pushToast = useCallback((item: ToastItem) => {
    setToasts((current) => {
      if (current.some((toast) => toast.id === item.id)) return current;
      return [item, ...current].slice(0, 4);
    });
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== item.id));
    }, 5000);
  }, []);

  useNotificationsRealtime({
    userId,
    onInsert: (row) => {
      if (!isEnabledByType(row, preferences)) return;
      if (!row.is_read) setUnreadCount((current) => current + 1);
      if (
        preferences.enable_toasts &&
        preferences.delivery_frequency === 'immediate' &&
        !isWithinQuietHours(preferences)
      ) {
        pushToast({ id: row.id, title: row.title, body: row.body, kind: row.kind });
      }
    },
    onUpdate: (row) => {
      if (row.is_read) {
        setUnreadCount((current) => Math.max(0, current - 1));
      }
    },
  });

  const markOneAsRead = useCallback((id: string) => {
    void id;
    setUnreadCount((current) => Math.max(0, current - 1));
  }, []);

  const markAllAsRead = useCallback((count?: number) => {
    setUnreadCount((current) => {
      if (typeof count === "number") {
        return Math.max(0, current - count);
      }
      return 0;
    });
  }, []);

  const value = useMemo(
    () => ({ unreadCount, markOneAsRead, markAllAsRead, setUnreadCount, recentToasts: toasts }),
    [markAllAsRead, markOneAsRead, unreadCount, toasts],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-50 space-y-3">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto w-[320px] rounded-2xl border border-slate-200 bg-white p-4 shadow-lg">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-full bg-slate-900/5 p-2 text-slate-700">
                <Bell className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900">{toast.title}</p>
                {toast.body ? <p className="mt-1 text-sm text-slate-600">{toast.body}</p> : null}
                <Link className="mt-3 inline-flex text-xs font-medium text-slate-900 underline underline-offset-2" href="/app/notifications">
                  Ver notificaciones
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </NotificationsContext.Provider>
  );
}

export function useNotificationsState() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error("useNotificationsState debe usarse dentro de NotificationsProvider");
  }
  return context;
}
