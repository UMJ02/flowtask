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

function hourLabel(hour: number) {
  return `${hour.toString().padStart(2, "0")}:00`;
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
            <p className="mt-1 text-sm text-slate-500">Elige qué avisos quieres ver y cuándo prefieres recibirlos.</p>
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
          <ToggleRow label="Tareas" description="Avisos cuando te asignan algo o cambia una tarea importante." checked={state.enable_task} onChange={(value) => updateField("enable_task", value)} />
          <ToggleRow label="Proyectos" description="Cambios clave dentro de proyectos donde participas." checked={state.enable_project} onChange={(value) => updateField("enable_project", value)} />
          <ToggleRow label="Comentarios" description="Comentarios nuevos para que no se te pase una respuesta." checked={state.enable_comment} onChange={(value) => updateField("enable_comment", value)} />
          <ToggleRow label="Recordatorios" description="Recordatorios sobre pendientes cercanos o atrasados." checked={state.enable_reminder} onChange={(value) => updateField("enable_reminder", value)} />
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
                  ? "Recibirás un solo resumen al día con lo más importante."
                  : "Verás los avisos al momento mientras trabajas dentro de la app."}
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
                    {hourLabel(hour)}
                  </option>
                ))}
              </select>
            </label>

            <ToggleRow label="Toasts dentro de la app" description="Mensajes breves en pantalla para avisarte sin interrumpir demasiado." checked={state.enable_toasts} onChange={(value) => updateField("enable_toasts", value)} />
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Canales externos</h3>
          <div className="mt-4 space-y-3">
            <ToggleRow label="Correo electrónico" description="Recibe un correo cuando haya algo importante o cuando actives automatizaciones." checked={state.enable_email} onChange={(value) => updateField("enable_email", value)} />
            <ToggleRow label="WhatsApp" description="Envía avisos por WhatsApp cuando conectes tu proveedor preferido." checked={state.enable_whatsapp} onChange={(value) => updateField("enable_whatsapp", value)} />
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">Cómo funciona</p>
              <ul className="mt-2 space-y-1">
                <li>• Inmediato: ves los avisos en el momento dentro de la app.</li>
                <li>• Resumen diario: ideal si prefieres revisar todo junto una vez al día.</li>
                <li>• Correo y WhatsApp: se pueden activar cuando termines esa integración.</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Horas silenciosas</h3>
          <div className="mt-4 space-y-4">
            <ToggleRow
              label="Activar horas silenciosas"
              description="Pausa las alertas visuales en las horas que elijas. Todo sigue guardándose en el centro de notificaciones."
              checked={state.quiet_hours_enabled}
              onChange={(value) => updateField("quiet_hours_enabled", value)}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <p className="text-sm font-semibold text-slate-900">Inicio</p>
                <select
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700"
                  value={state.quiet_hours_start}
                  onChange={(event) => updateField("quiet_hours_start", Number(event.target.value))}
                  disabled={!state.quiet_hours_enabled}
                >
                  {Array.from({ length: 24 }).map((_, hour) => (
                    <option key={hour} value={hour}>{hourLabel(hour)}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <p className="text-sm font-semibold text-slate-900">Fin</p>
                <select
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700"
                  value={state.quiet_hours_end}
                  onChange={(event) => updateField("quiet_hours_end", Number(event.target.value))}
                  disabled={!state.quiet_hours_enabled}
                >
                  {Array.from({ length: 24 }).map((_, hour) => (
                    <option key={hour} value={hour}>{hourLabel(hour)}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">Vista previa</p>
              <p className="mt-1">
                {state.quiet_hours_enabled
                  ? `Las alertas visuales se pausarán de ${hourLabel(state.quiet_hours_start)} a ${hourLabel(state.quiet_hours_end)}.`
                  : "No tienes un horario silencioso activo. Las alertas aparecerán según tus preferencias."}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Resumen diario</h3>
          <div className="mt-4 space-y-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-semibold text-slate-900">Qué incluirá</p>
            <p>• Tareas nuevas o pendientes que requieren atención.</p>
            <p>• Cambios importantes en proyectos del equipo.</p>
            <p>• Comentarios recientes y recordatorios cercanos.</p>
            <p className="pt-2 text-xs text-slate-500">Horario actual configurado: {hourLabel(state.daily_digest_hour)}.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
