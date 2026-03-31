export const dynamic = 'force-dynamic';

import { SupportReadinessPanel } from '@/components/organization/support-readiness-panel';
import { getOrganizationContext } from '@/lib/queries/organization';
import { getOrganizationSupportReadiness, getOrganizationSupportTickets } from '@/lib/queries/support';
import { safeServerCall } from '@/lib/runtime/safe-server';

export default async function OrganizationSupportPage() {
  const context = await safeServerCall('getOrganizationContext', () => getOrganizationContext(), null);
  const activeId = context?.activeOrganization?.id ?? null;

  const [summary, tickets] = await Promise.all([
    safeServerCall('getOrganizationSupportReadiness', () => getOrganizationSupportReadiness(activeId), { open: 0, inProgress: 0, critical: 0, resolvedLast30Days: 0 }),
    safeServerCall('getOrganizationSupportTickets', () => getOrganizationSupportTickets(activeId), []),
  ]);

  return (
    <div className="space-y-4">
      <SupportReadinessPanel
        summary={summary}
        tickets={tickets}
        organizationName={context?.activeOrganization?.name ?? null}
      />
    </div>
  );
}
