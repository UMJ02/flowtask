"use client";

import type { UsageEventInput } from "@/types/observability";

const MAX_EVENT_NAME_LENGTH = 80;

export async function trackEvent(input: UsageEventInput): Promise<void> {
  const payload = {
    eventName: input.eventName.slice(0, MAX_EVENT_NAME_LENGTH),
    route: input.route ?? (typeof window !== "undefined" ? window.location.pathname : null),
    organizationId: input.organizationId ?? null,
    metadata: input.metadata ?? {},
  };

  try {
    await fetch("/api/usage/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify(payload),
    });
  } catch {
    // Silent by design: telemetry must not break product flows.
  }
}
