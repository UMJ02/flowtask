import { Card } from "@/components/ui/card";
import { OrganizationBillingSummary } from "@/components/organization/organization-billing-summary";
import { OrganizationPlanLimitsPanel } from "@/components/organization/organization-plan-limits-panel";
import { OrganizationUsagePanel } from "@/components/organization/organization-usage-panel";
import { getOrganizationContext } from "@/lib/queries/organization";
import { getOrganizationBillingSummary, getOrganizationInvoices, getOrganizationUsageMetrics } from "@/lib/queries/billing";

export default async function OrganizationBillingPage() {
  const context = await getOrganizationContext();
  const organizationId = context?.activeOrganization?.id ?? null;
  const [summary, usage, invoices] = await Promise.all([
    getOrganizationBillingSummary(organizationId),
    getOrganizationUsageMetrics(organizationId),
    getOrganizationInvoices(organizationId),
  ]);

  return (
    <div className="space-y-4">
      <Card>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Facturación y límites</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Suscripción por organización</h1>
        <p className="mt-2 text-sm text-slate-600">Aquí puedes revisar plan activo, capacidad usada y facturación reciente. La base queda lista para conectar con Stripe en la siguiente etapa.</p>
      </Card>
      <OrganizationBillingSummary summary={summary} />
      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <OrganizationPlanLimitsPanel items={usage} />
        <OrganizationUsagePanel invoices={invoices} />
      </div>
    </div>
  );
}
