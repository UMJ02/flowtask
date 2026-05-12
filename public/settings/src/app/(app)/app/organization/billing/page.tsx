export const dynamic = 'force-dynamic';

import { OrganizationBillingSummary } from '@/components/organization/organization-billing-summary';
import { OrganizationPlanLimitsPanel } from '@/components/organization/organization-plan-limits-panel';
import { OrganizationUsagePanel } from '@/components/organization/organization-usage-panel';
import { BillingCommandCenter } from '@/components/organization/billing-command-center';
import { getOrganizationContext } from '@/lib/queries/organization';
import { getOrganizationBillingSummary, getOrganizationUsageMetrics, getOrganizationInvoices } from '@/lib/queries/billing';
import { safeServerCall } from '@/lib/runtime/safe-server';

export default async function OrganizationBillingPage() {
  const context = await safeServerCall('getOrganizationContext', () => getOrganizationContext(), null);
  const activeId = context?.activeOrganization?.id ?? null;
  const [summary, usage, invoices] = await Promise.all([
    safeServerCall('getOrganizationBillingSummary', () => getOrganizationBillingSummary(activeId), null),
    safeServerCall('getOrganizationUsageMetrics', () => getOrganizationUsageMetrics(activeId), []),
    safeServerCall('getOrganizationInvoices', () => getOrganizationInvoices(activeId), []),
  ]);

  return (
    <div className="space-y-4">
      <BillingCommandCenter summary={summary} usage={usage} />
      <OrganizationBillingSummary summary={summary} />
      <OrganizationPlanLimitsPanel items={usage} />
      <OrganizationUsagePanel invoices={invoices} />
    </div>
  );
}
