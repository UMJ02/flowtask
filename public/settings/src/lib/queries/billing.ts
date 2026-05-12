import { format } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import type { OrganizationPlanSummary, OrganizationUsageMetric, OrganizationInvoiceSummary } from "@/types/billing";
import { getOrganizationContext } from "@/lib/queries/organization";

function toneForUsage(percentage: number): "ok" | "warning" | "danger" {
  if (percentage >= 90) return "danger";
  if (percentage >= 75) return "warning";
  return "ok";
}

export async function getOrganizationBillingSummary(organizationId?: string | null): Promise<OrganizationPlanSummary | null> {
  const orgId = organizationId ?? (await getOrganizationContext())?.activeOrganization?.id;
  if (!orgId) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("organization_subscriptions")
    .select("plan_code, plan_name, status, billing_cycle, trial_ends_at, renews_at, seats_included, seats_used, projects_included, projects_used, storage_gb_included, storage_gb_used")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return null;

  return {
    planCode: (data.plan_code as string) ?? "starter",
    planName: (data.plan_name as string) ?? "Starter",
    status: ((data.status as string) ?? "trial") as OrganizationPlanSummary["status"],
    billingCycle: ((data.billing_cycle as string) ?? "monthly") as OrganizationPlanSummary["billingCycle"],
    trialEndsAtLabel: data.trial_ends_at ? format(new Date(data.trial_ends_at as string), "dd/MM/yyyy") : null,
    renewalDateLabel: data.renews_at ? format(new Date(data.renews_at as string), "dd/MM/yyyy") : null,
    seatsIncluded: Number(data.seats_included ?? 0),
    seatsUsed: Number(data.seats_used ?? 0),
    projectsIncluded: Number(data.projects_included ?? 0),
    projectsUsed: Number(data.projects_used ?? 0),
    storageGbIncluded: Number(data.storage_gb_included ?? 0),
    storageGbUsed: Number(data.storage_gb_used ?? 0),
  };
}

export async function getOrganizationUsageMetrics(organizationId?: string | null): Promise<OrganizationUsageMetric[]> {
  const summary = await getOrganizationBillingSummary(organizationId);
  if (!summary) return [];

  const metrics: OrganizationUsageMetric[] = [
    { key: "seats", label: "Usuarios", used: summary.seatsUsed, limit: summary.seatsIncluded, unit: "usuarios", percentage: summary.seatsIncluded > 0 ? Math.round((summary.seatsUsed / summary.seatsIncluded) * 100) : 0, tone: "ok" },
    { key: "projects", label: "Proyectos", used: summary.projectsUsed, limit: summary.projectsIncluded, unit: "proyectos", percentage: summary.projectsIncluded > 0 ? Math.round((summary.projectsUsed / summary.projectsIncluded) * 100) : 0, tone: "ok" },
    { key: "storage", label: "Storage", used: summary.storageGbUsed, limit: summary.storageGbIncluded, unit: "GB", percentage: summary.storageGbIncluded > 0 ? Math.round((summary.storageGbUsed / summary.storageGbIncluded) * 100) : 0, tone: "ok" },
  ].map((item: any) => ({ ...item, tone: toneForUsage(item.percentage) }));

  return metrics;
}

export async function getOrganizationInvoices(organizationId?: string | null): Promise<OrganizationInvoiceSummary[]> {
  const orgId = organizationId ?? (await getOrganizationContext())?.activeOrganization?.id;
  if (!orgId) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("organization_invoices")
    .select("id, amount_cents, currency, status, period_start, period_end, issued_at")
    .eq("organization_id", orgId)
    .order("issued_at", { ascending: false })
    .limit(6);

  return (data ?? []).map((row: any) => ({
    id: row.id as string,
    amountLabel: new Intl.NumberFormat("es-CR", { style: "currency", currency: ((row.currency as string) ?? "CRC").toUpperCase() }).format(Number(row.amount_cents ?? 0) / 100),
    status: (row.status as string) ?? "pendiente",
    periodLabel: row.period_start && row.period_end ? `${format(new Date(row.period_start as string), "dd/MM/yyyy")} - ${format(new Date(row.period_end as string), "dd/MM/yyyy")}` : "Sin período",
    issuedAtLabel: row.issued_at ? format(new Date(row.issued_at as string), "dd/MM/yyyy") : "-",
  }));
}
