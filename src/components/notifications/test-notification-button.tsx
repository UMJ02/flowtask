"use client";

import { useState, useTransition } from "react";

export function TestNotificationButton({ variant = "default" }: { variant?: "default" | "embedded-dark" }) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isEmbeddedDark = variant === "embedded-dark";

  const handleClick = () => {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const response = await fetch("/api/notifications/test", { method: "POST" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(result.error ?? "No se pudo crear la notificación de prueba.");
        return;
      }
      setMessage("Notificación de prueba creada. Revisa el centro de notificaciones y el toast en vivo.");
    });
  };

  return (
    <div className={isEmbeddedDark ? "rounded-[24px] bg-white/6 p-4 text-white" : "rounded-2xl border border-slate-200 bg-white p-4"}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className={isEmbeddedDark ? "text-sm font-semibold text-white" : "text-sm font-semibold text-slate-900"}>Prueba rápida</p>
          <p className={isEmbeddedDark ? "mt-1 text-sm text-slate-300" : "mt-1 text-sm text-slate-500"}>Genera una notificación interna para validar toasts, badge y preferencias.</p>
        </div>
        <button
          type="button"
          onClick={handleClick}
          disabled={isPending}
          className={isEmbeddedDark ? "rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 disabled:opacity-60" : "rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"}
        >
          {isPending ? "Probando..." : "Enviar prueba"}
        </button>
      </div>
      {message ? <p className={isEmbeddedDark ? "mt-3 text-sm font-medium text-emerald-300" : "mt-3 text-sm font-medium text-emerald-700"}>{message}</p> : null}
      {error ? <p className={isEmbeddedDark ? "mt-3 text-sm font-medium text-rose-300" : "mt-3 text-sm font-medium text-rose-700"}>{error}</p> : null}
    </div>
  );
}
