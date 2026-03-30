import { Card } from '@/components/ui/card';
import { ProfileSettingsForm } from '@/components/settings/profile-settings-form';
import { NotificationPreferencesForm } from '@/components/notifications/notification-preferences-form';
import { AutomationControlCenter } from '@/components/settings/automation-control-center';
import { getCurrentProfile } from '@/lib/queries/profile';
import { getNotificationPreferences } from '@/lib/queries/notification-preferences';
import { safeServerCall } from '@/lib/runtime/safe-server';

export default async function SettingsPage() {
  const [profile, preferences] = await Promise.all([
    safeServerCall('getCurrentProfile', () => getCurrentProfile(), null),
    safeServerCall('getNotificationPreferences', () => getNotificationPreferences(), null),
  ]);

  return (
    <div className="space-y-4">
      <Card>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Ajustes</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Perfil y preferencias</h1>
      </Card>
      <Card>
        <h2 className="text-lg font-semibold text-slate-900">Perfil</h2>
        <ProfileSettingsForm initialFullName={profile?.fullName ?? ''} email={profile?.email ?? ''} />
      </Card>
      {preferences ? <NotificationPreferencesForm initialPreferences={preferences} /> : null}
      {preferences ? <AutomationControlCenter preferences={preferences} /> : null}
    </div>
  );
}
