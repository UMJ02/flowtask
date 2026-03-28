export interface AdminMetricSummary {
  organizations: number;
  users: number;
  activeSubscriptions: number;
  openSupportTickets: number;
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
