import { Card } from '@/components/ui/card';
import { TestNotificationButton } from '@/components/notifications/test-notification-button';
import type { NotificationPreferences } from '@/lib/queries/notification-preferences';

type DeliverySummary = {
  total: number;
  sent: number;
  failed: number;
  pending: number;
};

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
  return (
    <Card className="bg-[linear-gradient(135deg,#062b2a_0%,#0f172a_58%,#111827_100%)] text-white shadow-[0_28px_70px_rgba(2,6,23,0.24)]">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_360px] xl:items-end">
        <div className="flex h-full flex-col gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">Notification command</p>
            <h1 className="mt-2 max-w-3xl text-3xl font-bold">Orquesta alertas, entregas y atención del equipo</h1>
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

        <div className="rounded-[28px] bg-white/8 p-1.5 ring-1 ring-white/10 backdrop-blur-sm">
          <TestNotificationButton variant="embedded-dark" />
        </div>
      </div>
    </Card>
  );
}
