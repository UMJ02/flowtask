"use client";

import { useMemo, useState, useTransition } from "react";
import { ChevronDown, ChevronUp, Layers3 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { NotificationPreferences } from "@/lib/queries/notification-preferences";

type Props = {
  initialPreferences: NotificationPreferences;
};

type SettingsTab = "delivery" | "channels" | "quiet";

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
    <label className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition hover:border-slate-300 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-900">{label}</p>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      <input
        type="checkbox"
        className="h-4 w-4 shrink-0 rounded border-slate-300 self-end sm:mt-1 sm:self-auto"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
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
  const [typesExpanded, setTypesExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingsTab>("delivery");
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

  const tabButton = (value: SettingsTab, label: string) => {
    const active = activeTab === value;
    return (
      <button
        key={value}
        type="button"
        onClick={() => setActiveTab(value)}
        className={active
          ? "rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm"
          : "rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="space-y-4 md:space-y-5">
      <Card className="overflow-hidden rounded-[22px]">
        <div className="flex flex-col gap-4 md:gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Preferencias de notificaciones</h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">Elige qué avisos quieres ver y cuándo prefieres recibirlos, con una vista más clara y compacta.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <Button type="button" variant="secondary" onClick={() => setTypesExpanded((value) => !value)} aria-expanded={typesExpanded} className="w-full sm:w-auto">
              {typesExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              Seleccionar
            </Button>
            <Button type="button" onClick={handleSave} disabled={isPending} className="w-full rounded-full sm:w-auto">
              {isPending ? "Guardando..." : "Guardar preferencias"}
            </Button>
          </div>
        </div>

        {message ? <p className="mt-3 text-sm font-medium text-emerald-700">{message}</p> : null}
        {error ? <p className="mt-3 text-sm font-medium text-rose-700">{error}</p> : null}

        {typesExpanded ? (
          <div className="mt-4 rounded-[24px] border border-slate-200 bg-slate-50 p-4 md:p-5">
            <div className="flex items-center gap-2 text-slate-900">
              <Layers3 className="h-4 w-4" />
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Tipos de notificación</h3>
            </div>
            <div className="mt-4 space-y-3">
              <ToggleRow label="Tareas" description="Avisos cuando te asignan algo o cambia una tarea importante." checked={state.enable_task} onChange={(value) => updateField("enable_task", value)} />
              <ToggleRow label="Proyectos" description="Cambios clave dentro de proyectos donde participas." checked={state.enable_project} onChange={(value) => updateField("enable_project", value)} />
              <ToggleRow label="Comentarios" description="Comentarios nuevos para que no se te pase una respuesta." checked={state.enable_comment} onChange={(value) => updateField("enable_comment", value)} />
              <ToggleRow label="Recordatorios" description="Recordatorios sobre pendientes cercanos o atrasados." checked={state.enable_reminder} onChange={(value) => updateField("enable_reminder", value)} />
            </div>
          </div>
        ) : null}
      </Card>

      <Card className="overflow-hidden rounded-[22px]">
        <div className="flex flex-col gap-3 md:gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Canales y automatización</h3>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">Agrupamos la configuración en una sola vista con cejillas para reducir ruido visual y mantener una lectura más limpia.</p>
          </div>
          <div className="flex flex-wrap gap-2 md:gap-3">
            {tabButton("delivery", "Entrega y frecuencia")}
            {tabButton("channels", "Canales externos")}
            {tabButton("quiet", "Horas silenciosas")}
          </div>
        </div>

        <div className="mt-4 rounded-[24px] border border-slate-200 bg-slate-50 p-4 md:p-5">
          {activeTab === "delivery" ? (
            <div className="space-y-4">
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
                    ? `Recibirás un resumen diario a las ${hourLabel(state.daily_digest_hour)}.`
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

              <ToggleRow
                label="Toasts dentro de la app"
                description="Mensajes breves en pantalla para avisarte sin interrumpir demasiado."
                checked={state.enable_toasts}
                onChange={(value) => updateField("enable_toasts", value)}
              />
            </div>
          ) : null}

          {activeTab === "channels" ? (
            <div className="space-y-3">
              <ToggleRow
                label="Correo electrónico"
                description="Recibe un correo cuando haya algo importante o cuando actives automatizaciones."
                checked={state.enable_email}
                onChange={(value) => updateField("enable_email", value)}
              />
              <ToggleRow
                label="WhatsApp"
                description="Envía avisos por WhatsApp cuando conectes tu proveedor preferido."
                checked={state.enable_whatsapp}
                onChange={(value) => updateField("enable_whatsapp", value)}
              />
              <div className="rounded-2xl bg-white p-4 text-sm text-slate-600 ring-1 ring-slate-200">
                <p className="font-semibold text-slate-900">Cómo funciona</p>
                <ul className="mt-2 space-y-1">
                  <li>• Inmediato: ves los avisos en el momento dentro de la app.</li>
                  <li>• Resumen diario: concentra cambios clave en un solo envío.</li>
                  <li>• Correo y WhatsApp: quedan listos para crecer cuando actives tus integraciones.</li>
                </ul>
              </div>
            </div>
          ) : null}

          {activeTab === "quiet" ? (
            <div className="space-y-4">
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
              <div className="rounded-2xl bg-white p-4 text-sm text-slate-600 ring-1 ring-slate-200">
                <p className="font-semibold text-slate-900">Vista previa</p>
                <p className="mt-1">
                  {state.quiet_hours_enabled
                    ? `Las alertas visuales se pausarán de ${hourLabel(state.quiet_hours_start)} a ${hourLabel(state.quiet_hours_end)}.`
                    : "No hay un horario silencioso activo. Las alertas seguirán según tus preferencias."}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
