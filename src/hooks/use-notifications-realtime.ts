"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { tryGetRuntimeEnv } from "@/lib/runtime/env";

export type NotificationDelivery = {
  id: string;
  notification_id: string;
  channel: string;
  status: string;
  attempted_at: string;
  delivered_at: string | null;
  error_message: string | null;
  attempt_number?: number | null;
  retry_after?: string | null;
};

export type LiveNotification = {
  id: string;
  user_id: string;
  title: string;
  body: string | null;
  kind: string;
  entity_type: string | null;
  entity_id: string | null;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
  deliveries?: NotificationDelivery[];
};

type Options = {
  userId?: string;
  enabled?: boolean;
  onInsert?: (row: LiveNotification) => void;
  onUpdate?: (row: LiveNotification) => void;
  onDeliveryInsert?: (delivery: NotificationDelivery) => void;
};

export function useNotificationsRealtime({ userId, enabled = true, onInsert, onUpdate, onDeliveryInsert }: Options) {
  useEffect(() => {
    if (!enabled || !userId || process.env.NEXT_PUBLIC_ENABLE_REALTIME !== "true") return;

    let supabase;
    try {
      supabase = createClient();
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[notifications] realtime disabled because runtime env is unavailable', error);
      }
      return;
    }

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload: { new: LiveNotification }) => {
          onInsert?.({ ...(payload.new as LiveNotification), deliveries: [] });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload: { new: LiveNotification }) => {
          onUpdate?.(payload.new as LiveNotification);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notification_deliveries",
          filter: `user_id=eq.${userId}`,
        },
        (payload: { new: NotificationDelivery }) => {
          onDeliveryInsert?.(payload.new as NotificationDelivery);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [enabled, onDeliveryInsert, onInsert, onUpdate, userId]);
}
