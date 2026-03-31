import { Card } from '@/components/ui/card';
import { ProfileSettingsForm } from '@/components/settings/profile-settings-form';
import { NotificationPreferencesForm } from '@/components/notifications/notification-preferences-form';
import { AutomationControlCenter } from '@/components/settings/automation-control-center';
import { SettingsAccountOverview } from '@/components/settings/settings-account-overview';
import { getNotificationPreferences } from '@/lib/queries/notification-preferences';
import { getOrganizationContext } from '@/lib/queries/organization';
import { getCurrentProfile } from '@/lib/queries/profile';
import { safeServerCall } from '@/lib/runtime/safe-server';

export default async function SettingsPage() {
  const [profile, preferences, organizationContext] = await Promise.all([
    safeServerCall('getCurrentProfile', () => getCurrentProfile(), null),
    safeServerCall('getNotificationPreferences', () => getNotificationPreferences(), null),
    safeServerCall('getOrganizationContext', () => getOrganizationContext(), null),
  ]);

  return (
    <div className="space-y-4">
      <SettingsAccountOverview
        profile={profile}
        preferences={preferences}
        organizationContext={organizationContext}
      />
      <Card>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Ajustes</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Perfil y preferencias operativas</h1>
        <p className="mt-2 text-sm text-slate-600">Actualiza tu identidad visible, tus reglas de aviso y la forma en que quieres que FlowTask te acompañe durante el día.</p>
      </Card>
      <Card>
        <h2 className="text-lg font-semibold text-slate-900">Perfil</h2>
        <ProfileSettingsForm initialFullName={profile?.fullName ?? ''} email={profile?.email ?? ''} />
      </Card>
      {preferences ? <NotificationPreferencesForm initialPreferences={preferences} /> : null}
      {preferences ? <AutomationControlCenter preferences={preferences} /> : null}
      <Card>
        <h2 className="text-lg font-semibold text-slate-900">Contexto de workspace</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Organización activa</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{organizationContext?.activeOrganization?.name ?? 'Sin organización'}</p>
            <p className="mt-1 text-sm text-slate-600">{organizationContext?.activeOrganization?.slug ?? 'Modo personal o pendiente de contexto'}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Rol actual</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{organizationContext?.activeOrganization?.role ?? 'Sin rol detectado'}</p>
            <p className="mt-1 text-sm text-slate-600">Este rol guía visibilidad, edición y gestión dentro del workspace.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Clientes con permisos</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{organizationContext?.clientPermissions?.length ?? 0}</p>
            <p className="mt-1 text-sm text-slate-600">Resumen rápido del alcance operativo de esta cuenta.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
