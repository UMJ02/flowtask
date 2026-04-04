export type OrganizationRole = "admin_global" | "manager" | "member" | "viewer";

export interface OrganizationSummary {
  id: string;
  name: string;
  slug: string;
  role: OrganizationRole;
  ownerId?: string | null;
  isDefault?: boolean;
}

export interface ClientPermissionSummary {
  clientName: string;
  canView: boolean;
  canEdit: boolean;
  canManageMembers: boolean;
}

export interface OrganizationInviteSummary {
  id: string;
  email: string;
  role: OrganizationRole;
  status: string;
  createdAtLabel: string;
}

export interface OrganizationMemberSummary {
  id: string;
  userId: string;
  role: OrganizationRole;
  isDefault: boolean;
  isOwner: boolean;
  fullName: string;
  email: string;
}

export interface OrganizationMetricSummary {
  members: number;
  clients: number;
  activeProjects: number;
  openTasks: number;
  editableClients: number;
  memberManagedClients: number;
  readOnlyClients: number;
  roleBreakdown: {
    admin_global: number;
    manager: number;
    member: number;
    viewer: number;
  };
}

export interface PermissionDefinitionSummary {
  key: string;
  label: string;
  description: string;
  category: "tasks" | "projects" | "clients" | "team" | "reports";
}

export interface OrganizationRoleTemplateSummary {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  memberCount: number;
  permissions: string[];
}


export interface OrganizationAccessSummary {
  role: "admin_global" | "manager" | "member" | "viewer" | null;
  canManageInvites: boolean;
  canManageRoles: boolean;
  canManageClientPermissions: boolean;
  canViewSensitiveOrganizationData: boolean;
}
