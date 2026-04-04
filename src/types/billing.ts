export interface OrganizationPlanSummary {
  planCode: string;
  planName: string;
  status: "trial" | "active" | "past_due" | "canceled";
  billingCycle: "monthly" | "annual";
  trialEndsAtLabel?: string | null;
  renewalDateLabel?: string | null;
  expiresAtLabel?: string | null;
  lastRenewedAtLabel?: string | null;
  renewalGraceEndsAtLabel?: string | null;
  autoRenew: boolean;
  softLocked: boolean;
  softLockReason?: string | null;
  scheduledPlanCode?: string | null;
  scheduledPlanName?: string | null;
  activationCode?: string | null;
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
