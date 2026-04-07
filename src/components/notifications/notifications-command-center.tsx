import { BellRing, Clock3 } from 'lucide-react';
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
  const cadenceLabel = preferences?.delivery_frequency === 'daily' ? `Resumen diario · ${hourLabel(preferences.daily_digest_hour)}` : 'Entrega inmediata';

  const helperLabel = deliverySummary.failed
    ? `${deliverySummary.failed} aviso(s) con fallo por revisar`
    : unreadCount
      ? `${unreadCount} pendiente(s) por leer`
      : 'Todo limpio por ahora';

  return (
    <Card className="overflow-hidden bg-[linear-gradient(135deg,#062b2a_0%,#0f172a_58%,#111827_100%)] text-white shadow-[0_24px_60px_rgba(2,6,23,0.2)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">Notification command</p>
          <h1 className="mt-2 text-2xl font-bold md:text-3xl">Centro claro para revisar avisos</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300 md:text-base">
            Busca, filtra y resuelve notificaciones con una cabecera compacta y sin elementos repetidos.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[360px]">
          <div className="rounded-[22px] bg-white/10 px-4 py-3 ring-1 ring-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-emerald-300">
              <BellRing className="h-4 w-4" />
              <p className="text-xs uppercase tracking-[0.16em]">Pendientes</p>
            </div>
            <p className="mt-2 text-2xl font-bold text-white">{unreadCount}</p>
            <p className="mt-1 text-xs text-slate-300">{helperLabel}</p>
          </div>
          <div className="rounded-[22px] bg-white/10 px-4 py-3 ring-1 ring-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-emerald-300">
              <Clock3 className="h-4 w-4" />
              <p className="text-xs uppercase tracking-[0.16em]">Entrega</p>
            </div>
            <p className="mt-2 text-sm font-semibold text-white">{cadenceLabel}</p>
            <p className="mt-1 text-xs text-slate-300">
              {deliverySummary.total ? `${deliverySummary.total} evento(s) de entrega registrados` : 'Aún no hay historial de entregas.'}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
