export const PERSONAL_WORKSPACE_ID = "personal" as const;

// Internal contract version only. Do not couple this to package.json or Vercel release gates.
export const ACCOUNT_MODEL_VERSION = "v58.17.1b" as const;

export type WorkspaceKind = "personal" | "organization";
export type InternalPlanCode = "personal_free" | "personal_pro" | "team" | "business" | "starter" | string;

export const NEUTRAL_INTERNAL_PLAN_CODES = ["personal_free", "personal_pro", "team", "business"] as const;
export const LEGACY_COMPATIBLE_PLAN_CODES = ["starter"] as const;

export interface AccountModelContract {
  primaryIdentity: "individual_user";
  personalWorkspace: { alwaysAvailable: true; defaultWorkspace: true; workspaceId: typeof PERSONAL_WORKSPACE_ID };
  organizationWorkspace: { createdByIndividualUser: true; organizationIsNotAUser: true; requiresExplicitSelection: true; creatorBecomesOwnerAdmin: true };
  planNaming: { commercialNamesAreProvisional: true; recommendedInternalCodes: typeof NEUTRAL_INTERNAL_PLAN_CODES; legacyCodesAcceptedForExistingData: typeof LEGACY_COMPATIBLE_PLAN_CODES };
}

export const FLOWTASK_ACCOUNT_MODEL: AccountModelContract = {
  primaryIdentity: "individual_user",
  personalWorkspace: { alwaysAvailable: true, defaultWorkspace: true, workspaceId: PERSONAL_WORKSPACE_ID },
  organizationWorkspace: { createdByIndividualUser: true, organizationIsNotAUser: true, requiresExplicitSelection: true, creatorBecomesOwnerAdmin: true },
  planNaming: { commercialNamesAreProvisional: true, recommendedInternalCodes: NEUTRAL_INTERNAL_PLAN_CODES, legacyCodesAcceptedForExistingData: LEGACY_COMPATIBLE_PLAN_CODES },
};

export function isPersonalWorkspaceId(value: unknown): value is typeof PERSONAL_WORKSPACE_ID { return value === PERSONAL_WORKSPACE_ID; }
export function isOrganizationWorkspaceId(value: unknown): value is string { return typeof value === "string" && value.trim().length > 0 && value !== PERSONAL_WORKSPACE_ID; }
export function normalizeInternalPlanCode(value: unknown): InternalPlanCode { if (typeof value !== "string") return "personal_free"; const normalized = value.trim().toLowerCase(); return normalized || "personal_free"; }
