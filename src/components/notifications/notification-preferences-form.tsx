"use client";

import { useMemo, useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import type { NotificationPreferences } from "@/lib/queries/notification-preferences";

type Props = {
  initialPreferences: NotificationPreferences;
};

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <div>
        <p className="text-sm font-semibold text-slate-900">{label}</p>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      <input type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-300" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    </label>
  );
}

export function NotificationPreferencesForm({ initialPreferences }: Props) {
  const [state, setState] = useState(initialPreferences);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const disabledByDigest = useMemo(() => state.delivery_frequency === "daily", [state.delivery_frequency]);

  const updateField = <K extends keyof NotificationPreferences>(key: K, value: NotificationPreferences[K]) => {
    setState((current) => ({ ...current, [key]: value }));
  };

  const handleSave = () => {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const response = await fetch("/api/notification-preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error ?? "No se pudo guardar la configuración.");
        return;
      }
      setState(result.data);
      setMessage("Preferencias guardadas correctamente.");
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Preferencias de notificaciones</h2>
            <p className="mt-1 text-sm text-slate-500">Activa o desactiva los tipos de aviso y define si los quieres inmediatos o en resumen diario.</p>
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isPending ? "Guardando..." : "Guardar preferencias"}
          </button>
        </div>
        {message ? <p className="mt-3 text-sm font-medium text-emerald-700">{message}</p> : null}
        {error ? <p className="mt-3 text-sm font-medium text-rose-700">{error}</p> : null}
      </Card>

      <Card>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Tipos de notificación</h3>
        <div className="mt-4 space-y-3">
          <ToggleRow label="Tareas" description="Asignaciones, cambios de estado y novedades ligadas a tareas." checked={state.enable_task} onChange={(value) => updateField("enable_task", value)} />
          <ToggleRow label="Proyectos" description="Movimientos importantes dentro de proyectos colaborativos." checked={state.enable_project} onChange={(value) => updateField("enable_project", value)} />
          <ToggleRow label="Comentarios" description="Mensajes nuevos y seguimiento dentro de tareas o proyectos." checked={state.enable_comment} onChange={(value) => updateField("enable_comment", value)} />
          <ToggleRow label="Recordatorios" description="Avisos por vencimientos y tareas pendientes." checked={state.enable_reminder} onChange={(value) => updateField("enable_reminder", value)} />
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Entrega y frecuencia</h3>
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">Frecuencia</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {[
                  { value: "immediate", label: "Inmediato" },
                  { value: "daily", label: "Resumen diario" },
                ].map((option) => {
                  const active = state.delivery_frequency === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateField("delivery_frequency", option.value as NotificationPreferences["delivery_frequency"])}
                      className={active
                        ? "rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white"
                        : "rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-sm text-slate-500">
                {disabledByDigest
                  ? "En resumen diario se prioriza consolidar avisos y reducir ruido en tiempo real."
                  : "En inmediato verás notificaciones en vivo y toasts dentro de la app."}
              </p>
            </div>

            <label className="block">
              <p className="text-sm font-semibold text-slate-900">Hora del resumen diario</p>
              <select
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700"
                value={state.daily_digest_hour}
                onChange={(event) => updateField("daily_digest_hour", Number(event.target.value))}
              >
                {Array.from({ length: 24 }).map((_, hour) => (
                  <option key={hour} value={hour}>
                    {hour.toString().padStart(2, "0")}:00
                  </option>
                ))}
              </select>
            </label>

            <ToggleRow label="Toasts dentro de la app" description="Pequeñas alertas visuales mientras trabajas." checked={state.enable_toasts} onChange={(value) => updateField("enable_toasts", value)} />
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Canales externos</h3>
          <div className="mt-4 space-y-3">
            <ToggleRow label="Correo electrónico" description="Preparado para envío opcional por email desde tus webhooks o recordatorios automatizados." checked={state.enable_email} onChange={(value) => updateField("enable_email", value)} />
            <ToggleRow label="WhatsApp" description="Base lista para integrar notificaciones por WhatsApp cuando conectes tu proveedor." checked={state.enable_whatsapp} onChange={(value) => updateField("enable_whatsapp", value)} />
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">Comportamiento esperado</p>
              <ul className="mt-2 space-y-1">
                <li>• Inmediato + toasts: experiencia en vivo dentro de la app.</li>
                <li>• Resumen diario: pensado para jefatura o usuarios que quieren menos interrupciones.</li>
                <li>• Email / WhatsApp: opcional, quedan listos para tu siguiente integración.</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
