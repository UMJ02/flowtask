export interface OrganizationWorkspaceAccessCardSummary {
  role: "admin_global" | "manager" | "member" | "viewer" | null;
  canManageInvites: boolean;
  canManageRoles: boolean;
  canManageClientPermissions: boolean;
  canViewSensitiveOrganizationData: boolean;
}

export interface ProjectAccessSummary {
  role: "admin_global" | "manager" | "member" | "viewer" | null;
  projectMemberRole: "owner" | "editor" | "viewer" | null;
  canEdit: boolean;
  canManageMembers: boolean;
  canComment: boolean;
  canUploadAttachments: boolean;
  canShare: boolean;
  canCreateTask: boolean;
  canViewActivity: boolean;
}

export interface TaskAccessSummary {
  role: "admin_global" | "manager" | "member" | "viewer" | null;
  projectMemberRole: "owner" | "editor" | "viewer" | null;
  isAssignee: boolean;
  canEdit: boolean;
  canManageAssignees: boolean;
  canComment: boolean;
  canUploadAttachments: boolean;
  canShare: boolean;
  canViewActivity: boolean;
}
