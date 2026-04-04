"use client";

import { useState, useTransition } from "react";

export function TestNotificationButton() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

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
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">Prueba rápida</p>
          <p className="mt-1 text-sm text-slate-500">Genera una notificación interna para validar toasts, badge y preferencias.</p>
        </div>
        <button
          type="button"
          onClick={handleClick}
          disabled={isPending}
          className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isPending ? "Probando..." : "Enviar prueba"}
        </button>
      </div>
      {message ? <p className="mt-3 text-sm font-medium text-emerald-700">{message}</p> : null}
      {error ? <p className="mt-3 text-sm font-medium text-rose-700">{error}</p> : null}
    </div>
  );
}
