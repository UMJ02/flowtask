export const dynamic = 'force-dynamic';

import { Card } from '@/components/ui/card';
import { NotificationPreferencesForm } from '@/components/notifications/notification-preferences-form';
import { SettingsAccountOverview } from '@/components/settings/settings-account-overview';
import { getNotificationPreferences } from '@/lib/queries/notification-preferences';
import { getOrganizationContext } from '@/lib/queries/organization';
import { getCurrentProfile } from '@/lib/queries/profile';
import { getOrganizationWorkspaceAccessSummary } from '@/lib/queries/access-summary';
import { getOrganizationBillingSummary } from '@/lib/queries/billing';
import { safeServerCall } from '@/lib/runtime/safe-server';
import { AccessControlSettingsCard } from '@/components/settings/access-control-settings-card';
import { IntelligentAttentionSettingsCard } from '@/components/settings/intelligent-attention-settings-card';
import { AccountDangerZone } from '@/components/settings/account-danger-zone';

export default async function SettingsPage() {
  const [profile, preferences, organizationContext, accessSummary] = await Promise.all([
    safeServerCall('getCurrentProfile', () => getCurrentProfile(), null),
    safeServerCall('getNotificationPreferences', () => getNotificationPreferences(), null),
    safeServerCall('getOrganizationContext', () => getOrganizationContext(), null),
    safeServerCall('getOrganizationWorkspaceAccessSummary', () => getOrganizationWorkspaceAccessSummary(), null),
  ]);

  const resolvedBillingSummary = organizationContext?.activeOrganization?.id
    ? await safeServerCall('getOrganizationBillingSummary', () => getOrganizationBillingSummary(organizationContext.activeOrganization?.id ?? null), null)
    : null;

  return (
    <div className="ft-settings-shell">
      <SettingsAccountOverview
        profile={profile}
        preferences={preferences}
        organizationContext={organizationContext}
      />

      <AccessControlSettingsCard
        accessSummary={accessSummary}
        organizationContext={organizationContext}
        billingSummary={resolvedBillingSummary}
      />

      <Card className="ft-settings-card p-6 md:p-7">
        <p className="ft-settings-eyebrow text-[#64748B]">Settings</p>
        <h2 className="mt-2 ft-settings-title">Preferencias operativas</h2>
        <p className="mt-2 max-w-3xl ft-settings-muted">
          Aquí decides qué avisos quieres ver, cómo se entregan y qué ventanas prefieres mantener en silencio.
        </p>
        <div className="mt-6">
          {preferences ? <NotificationPreferencesForm initialPreferences={preferences} /> : null}
        </div>
      </Card>

      <IntelligentAttentionSettingsCard />
      <AccountDangerZone />
    </div>
  );
}
