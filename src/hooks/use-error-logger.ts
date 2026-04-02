"use client";

import { useCallback } from "react";
import type { ErrorLogInput } from "@/types/observability";

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack ?? null,
    };
  }

  return {
    name: "UnknownError",
    message: typeof error === "string" ? error : "Unexpected error",
    stack: null,
  };
}

export function useErrorLogger(defaults?: Pick<ErrorLogInput, "source" | "organizationId">) {
  return useCallback(async (error: unknown, extra?: Omit<ErrorLogInput, "message"> & { message?: string }) => {
    const serialized = serializeError(error);
    const payload: ErrorLogInput = {
      level: extra?.level ?? "error",
      source: extra?.source ?? defaults?.source ?? "frontend",
      route: extra?.route ?? (typeof window !== "undefined" ? window.location.pathname : null),
      organizationId: extra?.organizationId ?? defaults?.organizationId ?? null,
      message: extra?.message ?? serialized.message,
      details: {
        error_name: serialized.name,
        stack: serialized.stack,
        ...(extra?.details ?? {}),
      },
    };

    try {
      await fetch("/api/internal/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify(payload),
      });
    } catch {
      // Silent by design.
    }
  }, [defaults?.organizationId, defaults?.source]);
}
