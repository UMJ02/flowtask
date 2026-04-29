export const PERSONAL_WORKSPACE_ID = "personal" as const;

export const ACCOUNT_MODEL_VERSION = "v58.17.1a" as const;

export type WorkspaceKind = "personal" | "organization";
export type InternalPlanCode = "personal_free" | "personal_pro" | "team" | "business" | string;

export interface AccountModelContract {
  primaryIdentity: "individual_user";
  personalWorkspace: {
    alwaysAvailable: true;
    workspaceId: typeof PERSONAL_WORKSPACE_ID;
  };
  organizationWorkspace: {
    createdByIndividualUser: true;
    organizationIsNotAUser: true;
    creatorBecomesOwnerAdmin: true;
  };
  planNaming: {
    commercialNamesAreProvisional: true;
    recommendedInternalCodes: readonly ["personal_free", "personal_pro", "team", "business"];
  };
}

export const FLOWTASK_ACCOUNT_MODEL: AccountModelContract = {
  primaryIdentity: "individual_user",
  personalWorkspace: {
    alwaysAvailable: true,
    workspaceId: PERSONAL_WORKSPACE_ID,
  },
  organizationWorkspace: {
    createdByIndividualUser: true,
    organizationIsNotAUser: true,
    creatorBecomesOwnerAdmin: true,
  },
  planNaming: {
    commercialNamesAreProvisional: true,
    recommendedInternalCodes: ["personal_free", "personal_pro", "team", "business"],
  },
};

export function isPersonalWorkspaceId(value: unknown): value is typeof PERSONAL_WORKSPACE_ID {
  return value === PERSONAL_WORKSPACE_ID;
}

export function isOrganizationWorkspaceId(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0 && value !== PERSONAL_WORKSPACE_ID;
}
