import { Card } from "@/components/ui/card";
import { NotificationPreferencesForm } from "@/components/notifications/notification-preferences-form";
import { TestNotificationButton } from "@/components/notifications/test-notification-button";
import { getNotificationPreferences } from "@/lib/queries/notification-preferences";

export default async function SettingsPage() {
  const preferences = await getNotificationPreferences();

  return (
    <div className="space-y-4">
      <Card>
        <h1 className="text-2xl font-bold text-slate-900">Configuración</h1>
        <p className="mt-2 text-sm text-slate-500">Administra personalización del tablero, notificaciones, enlaces compartidos y permisos por proyecto.</p>
      </Card>

      {preferences ? <NotificationPreferencesForm initialPreferences={preferences} /> : null}
      <TestNotificationButton />

      <Card>
        <h2 className="text-lg font-semibold text-slate-900">Entrega externa y resumen diario</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm font-semibold text-slate-900">Inmediato</p><p className="mt-1 text-sm text-slate-600">Envía alertas por email o WhatsApp según tus preferencias cuando la frecuencia es inmediata.</p></div>
          <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm font-semibold text-slate-900">Resumen diario</p><p className="mt-1 text-sm text-slate-600">Consolida actividad relevante y genera un envío diario con plantilla lista para jefatura.</p></div>
          <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm font-semibold text-slate-900">Estado por canal</p><p className="mt-1 text-sm text-slate-600">En el centro de notificaciones podrás ver si cada envío salió, falló u omitió un canal.</p></div>
        </div>
      </Card>
    </div>
  );
}
