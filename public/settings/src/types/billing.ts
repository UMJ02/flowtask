export interface OrganizationPlanSummary {
  planCode: string;
  planName: string;
  status: "trial" | "active" | "past_due" | "canceled";
  billingCycle: "monthly" | "annual";
  trialEndsAtLabel?: string | null;
  renewalDateLabel?: string | null;
  seatsIncluded: number;
  seatsUsed: number;
  projectsIncluded: number;
  projectsUsed: number;
  storageGbIncluded: number;
  storageGbUsed: number;
}

export interface OrganizationUsageMetric {
  key: string;
  label: string;
  used: number;
  limit: number;
  unit: string;
  percentage: number;
  tone: "ok" | "warning" | "danger";
}

export interface OrganizationInvoiceSummary {
  id: string;
  amountLabel: string;
  status: string;
  periodLabel: string;
  issuedAtLabel: string;
}
