import { BellRing, Clock3, Mail, MessageSquareText, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { NotificationPreferences } from '@/lib/queries/notification-preferences';

type DeliverySummary = {
  total: number;
  sent: number;
  failed: number;
  pending: number;
};

function hourLabel(hour: number) {
  return `${hour.toString().padStart(2, '0')}:00`;
}

function readinessLabel(preferences: NotificationPreferences | null) {
  if (!preferences) return 'Base';
  const score = [
    preferences.enable_task,
    preferences.enable_project,
    preferences.enable_comment,
    preferences.enable_reminder,
    preferences.enable_toasts,
    preferences.enable_email,
    preferences.enable_whatsapp,
    preferences.delivery_frequency === 'daily',
    preferences.quiet_hours_enabled,
  ].filter(Boolean).length;

  if (score >= 8) return 'Alta';
  if (score >= 5) return 'Media';
  return 'Inicial';
}

export function NotificationsCommandCenter({
  unreadCount,
  deliverySummary,
  preferences,
}: {
  unreadCount: number;
  deliverySummary: DeliverySummary;
  preferences: NotificationPreferences | null;
}) {
  const channels = [
    preferences?.enable_toasts !== false ? 'In-app' : null,
    preferences?.enable_email ? 'Correo' : null,
    preferences?.enable_whatsapp ? 'WhatsApp' : null,
  ].filter(Boolean) as string[];

  const digestCopy = preferences?.delivery_frequency === 'daily'
    ? `Resumen diario a las ${hourLabel(preferences.daily_digest_hour)}`
    : 'Flujo inmediato dentro de la app';

  const quietHoursCopy = preferences?.quiet_hours_enabled
    ? `${hourLabel(preferences.quiet_hours_start)} → ${hourLabel(preferences.quiet_hours_end)}`
    : 'Sin horario silencioso';

  return (
    <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
      <Card className="bg-[linear-gradient(135deg,#062b2a_0%,#0f172a_56%,#111827_100%)] text-white shadow-[0_28px_70px_rgba(2,6,23,0.24)]">
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">Notification command</p>
            <h1 className="mt-2 text-3xl font-bold">Orquesta alertas, entregas y atención del equipo</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Esta vista combina la salud operativa de las notificaciones con tus reglas de envío para que detectes saturación, fallos o espacios de mejora sin salir del centro de avisos.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            <div className="rounded-[24px] bg-white/10 px-4 py-3 ring-1 ring-white/10">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-300">No leídas</p>
              <p className="mt-2 text-3xl font-bold">{unreadCount}</p>
            </div>
            <div className="rounded-[24px] bg-white/10 px-4 py-3 ring-1 ring-white/10">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Entregas totales</p>
              <p className="mt-2 text-3xl font-bold">{deliverySummary.total}</p>
            </div>
            <div className="rounded-[24px] bg-white/10 px-4 py-3 ring-1 ring-white/10">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Fallidas</p>
              <p className="mt-2 text-3xl font-bold">{deliverySummary.failed}</p>
            </div>
            <div className="rounded-[24px] bg-white/10 px-4 py-3 ring-1 ring-white/10">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Readiness</p>
              <p className="mt-2 text-2xl font-bold">{readinessLabel(preferences)}</p>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Política activa</h2>
        <div className="mt-4 space-y-3">
          <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <BellRing className="mt-0.5 h-4 w-4 text-slate-600" />
            <div>
              <p className="text-sm font-semibold text-slate-900">Canales</p>
              <p className="mt-1 text-sm text-slate-600">{channels.length ? channels.join(' · ') : 'Sin canales activos'}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <Clock3 className="mt-0.5 h-4 w-4 text-slate-600" />
            <div>
              <p className="text-sm font-semibold text-slate-900">Cadencia</p>
              <p className="mt-1 text-sm text-slate-600">{digestCopy}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <ShieldCheck className="mt-0.5 h-4 w-4 text-slate-600" />
            <div>
              <p className="text-sm font-semibold text-slate-900">Ventana protegida</p>
              <p className="mt-1 text-sm text-slate-600">{quietHoursCopy}</p>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-2 text-slate-700">
                <Mail className="h-4 w-4" />
                <p className="text-sm font-semibold">Correo</p>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                {preferences?.enable_email ? 'Activo para automatizaciones y entregas registradas.' : 'Disponible para activarlo cuando quieras extender el sistema fuera de la app.'}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-2 text-slate-700">
                <MessageSquareText className="h-4 w-4" />
                <p className="text-sm font-semibold">WhatsApp</p>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                {preferences?.enable_whatsapp ? 'Activo para alertas prioritarias.' : 'Siguiente capa disponible cuando conectes proveedor o flujo externo.'}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
