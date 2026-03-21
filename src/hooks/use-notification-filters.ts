"use client";

import { useMemo } from "react";
import type { LiveNotification } from "@/hooks/use-notifications-realtime";

export type NotificationFilterKey = "all" | "unread" | "task" | "project" | "comment" | "reminder";

export const NOTIFICATION_FILTERS: { value: NotificationFilterKey; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "unread", label: "No leídas" },
  { value: "task", label: "Tareas" },
  { value: "project", label: "Proyectos" },
  { value: "comment", label: "Comentarios" },
  { value: "reminder", label: "Recordatorios" },
];

export function isNotificationFilterKey(value: string | null): value is NotificationFilterKey {
  return Boolean(value && NOTIFICATION_FILTERS.some((filter) => filter.value === value));
}

function matchesFilter(item: LiveNotification, filter: NotificationFilterKey) {
  if (filter === "all") return true;
  if (filter === "unread") return !item.is_read;
  return item.entity_type === filter;
}

function matchesSearch(item: LiveNotification, query: string) {
  if (!query) return true;
  const haystack = [item.title, item.body, item.kind, item.entity_type, item.entity_id].filter(Boolean).join(" ").toLowerCase();
  return haystack.includes(query.toLowerCase());
}

export function useNotificationFilters(notifications: LiveNotification[], activeFilter: NotificationFilterKey, searchQuery: string) {
  return useMemo(() => notifications.filter((item) => matchesFilter(item, activeFilter) && matchesSearch(item, searchQuery.trim())), [activeFilter, notifications, searchQuery]);
}
