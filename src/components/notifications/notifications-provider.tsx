"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { useNotificationsRealtime, type LiveNotification } from "@/hooks/use-notifications-realtime";

type ToastItem = Pick<LiveNotification, "id" | "title" | "body" | "kind">;

type NotificationsContextValue = {
  unreadCount: number;
  markOneAsRead: (id: string) => void;
  setUnreadCount: (value: number) => void;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

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
      if (!row.is_read) setUnreadCount((current) => current + 1);
      pushToast({ id: row.id, title: row.title, body: row.body, kind: row.kind });
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

  const value = useMemo(() => ({ unreadCount, markOneAsRead, setUnreadCount }), [markOneAsRead, unreadCount]);

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
