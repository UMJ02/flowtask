"use client";

import { useMemo } from "react";
import type { LiveNotification } from "@/hooks/use-notifications-realtime";

export type NotificationFilterKey =
  | "all"
  | "unread"
  | "task"
  | "project"
  | "comment"
  | "reminder"
  | "delivery_failed"
  | "delivery_pending"
  | "delivery_sent";

export const NOTIFICATION_FILTERS: { value: NotificationFilterKey; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "unread", label: "No leídas" },
  { value: "task", label: "Tareas" },
  { value: "project", label: "Proyectos" },
  { value: "comment", label: "Comentarios" },
  { value: "reminder", label: "Recordatorios" },
  { value: "delivery_failed", label: "Entrega fallida" },
  { value: "delivery_pending", label: "En cola" },
  { value: "delivery_sent", label: "Entregadas" },
];

export function isNotificationFilterKey(value: string | null): value is NotificationFilterKey {
  return Boolean(value && NOTIFICATION_FILTERS.some((filter) => filter.value === value));
}

function hasDeliveryStatus(item: LiveNotification, status: "failed" | "pending" | "sent") {
  return (item.deliveries ?? []).some((delivery) => {
    if (status === "pending") return delivery.status !== "sent" && delivery.status !== "failed";
    return delivery.status === status;
  });
}

function matchesFilter(item: LiveNotification, filter: NotificationFilterKey) {
  if (filter === "all") return true;
  if (filter === "unread") return !item.is_read;
  if (filter === "delivery_failed") return hasDeliveryStatus(item, "failed");
  if (filter === "delivery_pending") return hasDeliveryStatus(item, "pending");
  if (filter === "delivery_sent") return hasDeliveryStatus(item, "sent");
  return item.entity_type === filter;
}

function buildSearchIndex(item: LiveNotification) {
  return [
    item.title,
    item.body,
    item.kind,
    item.entity_type,
    item.entity_id,
    ...(item.deliveries ?? []).flatMap((delivery) => [
      delivery.channel,
      delivery.status,
      delivery.error_message,
      delivery.retry_after,
    ]),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function useNotificationFilters(
  notifications: LiveNotification[],
  activeFilter: NotificationFilterKey,
  searchQuery: string,
) {
  return useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const indexed = notifications.map((item) => ({ item, searchIndex: buildSearchIndex(item) }));
    return indexed
      .filter(({ item, searchIndex }) => matchesFilter(item, activeFilter) && (!normalizedQuery || searchIndex.includes(normalizedQuery)))
      .map(({ item }) => item);
  }, [activeFilter, notifications, searchQuery]);
}
