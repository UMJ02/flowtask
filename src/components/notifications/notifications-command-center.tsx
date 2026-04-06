import { BellRing, Clock3, ShieldCheck } from 'lucide-react';
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

export function NotificationsCommandCenter({
  unreadCount,
  deliverySummary,
  preferences,
}: {
  unreadCount: number;
  deliverySummary: DeliverySummary;
  preferences: NotificationPreferences | null;
}) {
  const frequencyLabel = preferences?.delivery_frequency === 'daily'
    ? `Resumen diario · ${hourLabel(preferences.daily_digest_hour)}`
    : 'Entrega inmediata';

  const quietHoursLabel = preferences?.quiet_hours_enabled
    ? `${hourLabel(preferences.quiet_hours_start)} → ${hourLabel(preferences.quiet_hours_end)}`
    : 'Sin horario silencioso';

  return (
    <Card className="bg-[linear-gradient(135deg,#062b2a_0%,#0f172a_54%,#111827_100%)] text-white shadow-[0_24px_60px_rgba(2,6,23,0.2)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">Notification command</p>
          <h1 className="mt-2 text-2xl font-bold md:text-3xl">Centro limpio para revisar avisos del equipo</h1>
          <p className="mt-2 text-sm text-slate-300 md:text-base">
            Busca, filtra y resuelve notificaciones sin paneles repetidos ni bloques que distraigan de la acción principal.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-[24px] bg-white/10 px-4 py-3 ring-1 ring-white/10">
            <div className="flex items-center gap-2 text-emerald-300">
              <BellRing className="h-4 w-4" />
              <p className="text-xs uppercase tracking-[0.16em]">No leídas</p>
            </div>
            <p className="mt-3 text-2xl font-bold">{unreadCount}</p>
          </div>
          <div className="rounded-[24px] bg-white/10 px-4 py-3 ring-1 ring-white/10">
            <div className="flex items-center gap-2 text-emerald-300">
              <Clock3 className="h-4 w-4" />
              <p className="text-xs uppercase tracking-[0.16em]">Cadencia</p>
            </div>
            <p className="mt-3 text-sm font-semibold text-white">{frequencyLabel}</p>
          </div>
          <div className="rounded-[24px] bg-white/10 px-4 py-3 ring-1 ring-white/10">
            <div className="flex items-center gap-2 text-emerald-300">
              <ShieldCheck className="h-4 w-4" />
              <p className="text-xs uppercase tracking-[0.16em]">Ventana</p>
            </div>
            <p className="mt-3 text-sm font-semibold text-white">{deliverySummary.failed ? `${deliverySummary.failed} fallo(s) por revisar` : quietHoursLabel}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
