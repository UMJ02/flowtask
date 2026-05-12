export const dynamic = "force-dynamic";

import { SupportCenter } from "@/components/support/support-center";
import { getOrganizationContext } from "@/lib/queries/organization";
import { getMySupportTickets, getRecentErrorLogs, getUsageEventMetrics } from "@/lib/queries/observability";
import { safeServerCall } from "@/lib/runtime/safe-server";

export default async function SupportPage() {
  const context = await safeServerCall("getOrganizationContext", () => getOrganizationContext(), null);
  const activeOrganizationId = context?.activeOrganization?.id ?? null;

  const [usage, tickets, errors] = await Promise.all([
    safeServerCall("getUsageEventMetrics", () => getUsageEventMetrics(activeOrganizationId), { loginEvents: 0, projectEvents: 0, taskEvents: 0, supportEvents: 0 }),
    safeServerCall("getMySupportTickets", () => getMySupportTickets(activeOrganizationId), []),
    safeServerCall("getRecentErrorLogs", () => getRecentErrorLogs(activeOrganizationId), []),
  ]);

  return <SupportCenter organizationId={activeOrganizationId} usage={usage} tickets={tickets} errors={errors} />;
}
