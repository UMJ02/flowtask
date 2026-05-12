export interface SupportTicketSummary {
  id: string;
  subject: string;
  status: string;
  priority: string;
  source: string;
  requesterEmail: string;
  createdAtLabel: string;
}

export interface SupportReadinessSummary {
  open: number;
  inProgress: number;
  critical: number;
  resolvedLast30Days: number;
}
