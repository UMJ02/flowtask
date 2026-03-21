export interface OrganizationSummary {
  id: string;
  name: string;
  slug: string;
  role: "admin_global" | "manager" | "member" | "viewer";
  isDefault?: boolean;
}

export interface ClientPermissionSummary {
  clientName: string;
  canView: boolean;
  canEdit: boolean;
  canManageMembers: boolean;
}
