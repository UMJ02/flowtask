import { BellRing, Clock3, Mail, MessageSquareText, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { NotificationPreferences } from "@/lib/queries/notification-preferences";

function hourLabel(hour: number) {
  return `${hour.toString().padStart(2, "0")}:00`;
}

export function AutomationControlCenter({ preferences }: { preferences: NotificationPreferences }) {
  const digestEnabled = preferences.delivery_frequency === "daily";
  const quietHours = preferences.quiet_hours_enabled
    ? `${hourLabel(preferences.quiet_hours_start)} → ${hourLabel(preferences.quiet_hours_end)}`
    : "Desactivadas";

  const activeChannels = [
    preferences.enable_toasts ? "In-app" : null,
    preferences.enable_email ? "Correo" : null,
    preferences.enable_whatsapp ? "WhatsApp" : null,
  ].filter(Boolean) as string[];

  const automationScore = [
    preferences.enable_task,
    preferences.enable_project,
    preferences.enable_comment,
    preferences.enable_reminder,
    preferences.enable_toasts,
    preferences.enable_email,
    preferences.enable_whatsapp,
    digestEnabled,
    preferences.quiet_hours_enabled,
  ].filter(Boolean).length;

  return (
    <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
      <Card className="bg-[linear-gradient(135deg,#0f172a_0%,#111827_55%,#1f2937_100%)] text-white shadow-[0_24px_60px_rgba(15,23,42,0.22)]">
        <div className="flex flex-col gap-5">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-emerald-300 ring-1 ring-white/10">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">Automation center</p>
              <h2 className="mt-2 text-2xl font-bold">Tu rutina de notificaciones ya tiene una estructura clara</h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-300">
                Aquí ves cómo se combinan tus alertas inmediatas, horas silenciosas y resúmenes para que el sistema trabaje contigo sin saturarte.
              </p>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-[26px] bg-white/10 px-4 py-3 ring-1 ring-white/10">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Cobertura</p>
              <p className="mt-2 text-3xl font-bold">{automationScore}/9</p>
              <p className="mt-1 text-sm text-slate-300">Bloques de automatización activos.</p>
            </div>
            <div className="rounded-[26px] bg-white/10 px-4 py-3 ring-1 ring-white/10">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Canales</p>
              <p className="mt-2 text-3xl font-bold">{activeChannels.length}</p>
              <p className="mt-1 text-sm text-slate-300">{activeChannels.length ? activeChannels.join(" · ") : "Sin canales externos activos"}</p>
            </div>
            <div className="rounded-[26px] bg-white/10 px-4 py-3 ring-1 ring-white/10">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Horas silenciosas</p>
              <p className="mt-2 text-lg font-bold">{quietHours}</p>
              <p className="mt-1 text-sm text-slate-300">Ventana actual de menor interrupción.</p>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Estado actual</h3>
        <div className="mt-4 space-y-3">
          <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <BellRing className="mt-0.5 h-4 w-4 text-slate-600" />
            <div>
              <p className="text-sm font-semibold text-slate-900">Frecuencia principal</p>
              <p className="mt-1 text-sm text-slate-600">{digestEnabled ? `Resumen diario a las ${hourLabel(preferences.daily_digest_hour)}.` : "Avisos inmediatos dentro de la app."}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <Clock3 className="mt-0.5 h-4 w-4 text-slate-600" />
            <div>
              <p className="text-sm font-semibold text-slate-900">Horario protegido</p>
              <p className="mt-1 text-sm text-slate-600">{preferences.quiet_hours_enabled ? `Las alertas visuales se pausarán de ${quietHours}.` : "No hay una ventana silenciosa configurada."}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <Mail className="mt-0.5 h-4 w-4 text-slate-600" />
            <div>
              <p className="text-sm font-semibold text-slate-900">Correo</p>
              <p className="mt-1 text-sm text-slate-600">{preferences.enable_email ? "Canal activo para entregas y automatizaciones." : "Canal listo para habilitar cuando quieras sacar más trabajo fuera de la app."}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <MessageSquareText className="mt-0.5 h-4 w-4 text-slate-600" />
            <div>
              <p className="text-sm font-semibold text-slate-900">WhatsApp</p>
              <p className="mt-1 text-sm text-slate-600">{preferences.enable_whatsapp ? "Canal activo para avisos prioritarios." : "Disponible como siguiente capa de automatización cuando conectes proveedor."}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
