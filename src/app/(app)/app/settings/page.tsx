export const dynamic = 'force-dynamic';

import { Card } from '@/components/ui/card';
import { NotificationPreferencesForm } from '@/components/notifications/notification-preferences-form';
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
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Settings</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-900">Preferencias operativas</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          Aquí decides qué avisos quieres ver, cómo se entregan y qué ventanas prefieres mantener en silencio.
        </p>
      </Card>

      {preferences ? <NotificationPreferencesForm initialPreferences={preferences} /> : null}
    </div>
  );
}
