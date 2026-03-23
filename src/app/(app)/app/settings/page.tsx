import { Card } from '@/components/ui/card';
import { NotificationPreferencesForm } from '@/components/notifications/notification-preferences-form';
import { TestNotificationButton } from '@/components/notifications/test-notification-button';
import { ProfileSettingsForm } from '@/components/settings/profile-settings-form';
import { getNotificationPreferences } from '@/lib/queries/notification-preferences';
import { getOrganizationContext } from '@/lib/queries/organization';
import { getCurrentProfile } from '@/lib/queries/profile';

export default async function SettingsPage() {
  const [preferences, organizationContext, profile] = await Promise.all([
    getNotificationPreferences(),
    getOrganizationContext(),
    getCurrentProfile(),
  ]);

  return (
    <div className="space-y-4">
      <Card>
        <h1 className="text-2xl font-bold text-slate-900">Tu cuenta</h1>
        <p className="mt-2 text-sm text-slate-500">Revisa tus datos, actualiza cómo te mostramos en la app y ajusta cómo quieres recibir avisos.</p>
        {profile ? <ProfileSettingsForm initialFullName={profile.fullName} email={profile.email} /> : null}
      </Card>

      {preferences ? <NotificationPreferencesForm initialPreferences={preferences} /> : null}
      <TestNotificationButton />

      <Card>
        <h2 className="text-lg font-semibold text-slate-900">Organización y permisos</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm font-semibold text-slate-900">Organización activa</p><p className="mt-1 text-sm text-slate-600">{organizationContext?.activeOrganization?.name ?? 'Sin organización'}</p></div>
          <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm font-semibold text-slate-900">Rol actual</p><p className="mt-1 text-sm text-slate-600">{organizationContext?.activeOrganization?.role ?? 'member'}</p></div>
          <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm font-semibold text-slate-900">Clientes configurados</p><p className="mt-1 text-sm text-slate-600">{organizationContext?.clientPermissions?.length ?? 0}</p></div>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-slate-900">Avisos y entregas</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm font-semibold text-slate-900">Inmediato</p><p className="mt-1 text-sm text-slate-600">Recibe avisos apenas haya un cambio importante, según los canales que tengas activos.</p></div>
          <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm font-semibold text-slate-900">Resumen diario</p><p className="mt-1 text-sm text-slate-600">Agrupa novedades del día para que revises todo con calma en un solo envío.</p></div>
          <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm font-semibold text-slate-900">Estado por canal</p><p className="mt-1 text-sm text-slate-600">Desde notificaciones puedes ver si un aviso salió bien, sigue pendiente o necesita revisión.</p></div>
        </div>
      </Card>
    </div>
  );
}
