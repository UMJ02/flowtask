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
    <Card className="ft-notifications-hero p-5 md:p-6">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_430px] lg:items-center">
        <div className="flex min-w-0 gap-5">
          <div className="ft-notifications-icon-tile shrink-0">
            <BellRing className="h-9 w-9" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#047857]">Notification Command</p>
            <h1 className="mt-2 text-[26px] font-extrabold tracking-[-0.035em] text-[#0F172A] md:text-[32px]">
              Centro claro para revisar avisos
            </h1>
            <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-[#475569] md:text-base">
              Busca, filtra y resuelve notificaciones con una cabecera compacta y sin elementos repetidos.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="ft-notification-metric">
            <div className="flex items-center gap-2 text-[#16C784]">
              <BellRing className="h-5 w-5" />
              <p className="text-xs font-extrabold uppercase tracking-[0.16em]">Pendientes</p>
            </div>
            <p className="mt-3 text-[26px] font-extrabold text-[#0F172A]">{unreadCount}</p>
            <p className="mt-1 text-sm font-medium text-[#475569]">{helperLabel}</p>
          </div>
          <div className="ft-notification-metric">
            <div className="flex items-center gap-2 text-[#16C784]">
              <Clock3 className="h-5 w-5" />
              <p className="text-xs font-extrabold uppercase tracking-[0.16em]">Entrega</p>
            </div>
            <p className="mt-3 text-base font-extrabold text-[#0F172A]">{cadenceLabel}</p>
            <p className="mt-1 text-sm font-medium text-[#475569]">
              {deliverySummary.total ? `${deliverySummary.total} evento(s) de entrega registrados` : 'Aún no hay historial de entregas.'}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
