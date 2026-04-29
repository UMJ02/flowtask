export const PERSONAL_WORKSPACE_ID = "personal" as const;

export const INTERNAL_PLAN_CODES = {
  PERSONAL_FREE: "personal_free",
  PERSONAL_PRO: "personal_pro",
  TEAM: "team",
  BUSINESS: "business",
} as const;

export type InternalPlanCode = (typeof INTERNAL_PLAN_CODES)[keyof typeof INTERNAL_PLAN_CODES];

export type AccountMode = "individual" | "organization";

export type WorkspaceMode =
  | { kind: "personal"; userId: string; organizationId: null }
  | { kind: "organization"; userId: string; organizationId: string; role: "admin_global" | "manager" | "member" | "viewer" };

export function isPersonalWorkspace(workspace: WorkspaceMode): workspace is Extract<WorkspaceMode, { kind: "personal" }> {
  return workspace.kind === "personal";
}

export function isOrganizationWorkspace(workspace: WorkspaceMode): workspace is Extract<WorkspaceMode, { kind: "organization" }> {
  return workspace.kind === "organization";
}

export function resolveWorkspaceScope(userId: string, organizationId?: string | null): WorkspaceMode {
  if (organizationId) {
    return { kind: "organization", userId, organizationId, role: "member" };
  }

  return { kind: "personal", userId, organizationId: null };
}

/**
 * Flowtask account model contract:
 * - The individual user is always the primary identity.
 * - Personal workspace exists by default for every user.
 * - Organizations are workspaces created by an individual user.
 * - The creator becomes owner/admin of the organization.
 * - Organizations are never standalone user accounts.
 * - Plan limits may later unlock organization creation/count/member seats.
 */
export const ACCOUNT_MODEL_CONTRACT = {
  primaryIdentity: "individual_user",
  personalWorkspaceAlwaysAvailable: true,
  organizationAsUser: false,
  organizationCreatorRole: "admin_global",
} as const;
