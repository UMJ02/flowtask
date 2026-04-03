export interface AdminMetricSummary {
  organizations: number;
  users: number;
  activeSubscriptions: number;
  openSupportTickets: number;
  usageEvents7d: number;
  criticalErrors7d: number;
}

export interface AdminOrganizationSummary {
  id: string;
  name: string;
  slug: string;
  ownerEmail: string;
  membersCount: number;
  clientsCount: number;
  planName: string;
  status: string;
  createdAtLabel: string;
}

export interface AdminUserSummary {
  id: string;
  email: string;
  fullName: string;
  organizationsCount: number;
  defaultRole: string;
}

export interface AdminSupportTicketSummary {
  id: string;
  subject: string;
  organizationName: string;
  requesterEmail: string;
  status: string;
  priority: string;
  source: string;
  createdAtLabel: string;
}

export interface AdminErrorLogSummary {
  id: string;
  level: string;
  source: string;
  route: string;
  message: string;
  createdAtLabel: string;
}

export interface AdminUsageTopEvent {
  eventName: string;
  count: number;
}

export interface AdminUsageEventSummary {
  id: string;
  eventName: string;
  organizationName: string;
  actorLabel: string;
  route: string;
  createdAtLabel: string;
}

export interface AdminUsageInsightSummary {
  topEvents: AdminUsageTopEvent[];
  recentEvents: AdminUsageEventSummary[];
}

export interface AdminPlatformPulse {
  readinessScore: number;
  queueHealthLabel: string;
  eventsTrendLabel: string;
  riskLabel: string;
}
