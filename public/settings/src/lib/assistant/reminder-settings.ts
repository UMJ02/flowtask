export type IntelligentAssistantSensitivity = "critical" | "focus" | "balanced" | "adaptive";
export type IntelligentAssistantVerbosity = "minimal" | "guided";
export type IntelligentAssistantAnimationLevel = "off" | "soft" | "expressive";

export type IntelligentAssistantSettings = {
  enabled: boolean;
  sensitivity: IntelligentAssistantSensitivity;
  cadenceMinutes: number;
  showMascot: boolean;
  showOnDashboardOnly: boolean;
  verbosity: IntelligentAssistantVerbosity;
  animationLevel: IntelligentAssistantAnimationLevel;
  defaultSnoozeMinutes: number;
  maxPreviewItems: number;
  allowWorkspaceSpecificHistory: boolean;
  showWorkspaceAlertsInOrganizations: boolean;
  alertTypes: {
    overdue: boolean;
    dueToday: boolean;
    dueSoon: boolean;
    waitingReview: boolean;
  };
};

export const INTELLIGENT_ASSISTANT_SETTINGS_KEY = "flowtask:intelligent-attention-settings";

export const DEFAULT_INTELLIGENT_ASSISTANT_SETTINGS: IntelligentAssistantSettings = {
  enabled: true,
  sensitivity: "adaptive",
  cadenceMinutes: 45,
  showMascot: true,
  showOnDashboardOnly: false,
  verbosity: "minimal",
  animationLevel: "soft",
  defaultSnoozeMinutes: 45,
  maxPreviewItems: 3,
  allowWorkspaceSpecificHistory: true,
  showWorkspaceAlertsInOrganizations: true,
  alertTypes: {
    overdue: true,
    dueToday: true,
    dueSoon: true,
    waitingReview: true,
  },
};

export function normalizeIntelligentAssistantSettings(
  input?: Partial<IntelligentAssistantSettings> | null,
): IntelligentAssistantSettings {
  const cadence = Number(input?.cadenceMinutes ?? DEFAULT_INTELLIGENT_ASSISTANT_SETTINGS.cadenceMinutes);
  const validCadence = Number.isFinite(cadence)
    ? Math.min(240, Math.max(10, cadence))
    : DEFAULT_INTELLIGENT_ASSISTANT_SETTINGS.cadenceMinutes;

  const snooze = Number(input?.defaultSnoozeMinutes ?? DEFAULT_INTELLIGENT_ASSISTANT_SETTINGS.defaultSnoozeMinutes);
  const validSnooze = Number.isFinite(snooze)
    ? Math.min(240, Math.max(15, snooze))
    : DEFAULT_INTELLIGENT_ASSISTANT_SETTINGS.defaultSnoozeMinutes;

  const maxPreviewItems = Number(input?.maxPreviewItems ?? DEFAULT_INTELLIGENT_ASSISTANT_SETTINGS.maxPreviewItems);
  const validMaxPreviewItems = Number.isFinite(maxPreviewItems)
    ? Math.min(6, Math.max(2, maxPreviewItems))
    : DEFAULT_INTELLIGENT_ASSISTANT_SETTINGS.maxPreviewItems;

  return {
    enabled: typeof input?.enabled === "boolean" ? input.enabled : DEFAULT_INTELLIGENT_ASSISTANT_SETTINGS.enabled,
    sensitivity:
      input?.sensitivity === "critical" || input?.sensitivity === "focus" || input?.sensitivity === "balanced" || input?.sensitivity === "adaptive"
        ? input.sensitivity
        : DEFAULT_INTELLIGENT_ASSISTANT_SETTINGS.sensitivity,
    cadenceMinutes: validCadence,
    showMascot: typeof input?.showMascot === "boolean" ? input.showMascot : DEFAULT_INTELLIGENT_ASSISTANT_SETTINGS.showMascot,
    showOnDashboardOnly:
      typeof input?.showOnDashboardOnly === "boolean"
        ? input.showOnDashboardOnly
        : DEFAULT_INTELLIGENT_ASSISTANT_SETTINGS.showOnDashboardOnly,
    verbosity: input?.verbosity === "guided" || input?.verbosity === "minimal" ? input.verbosity : DEFAULT_INTELLIGENT_ASSISTANT_SETTINGS.verbosity,
    animationLevel:
      input?.animationLevel === "off" || input?.animationLevel === "soft" || input?.animationLevel === "expressive"
        ? input.animationLevel
        : DEFAULT_INTELLIGENT_ASSISTANT_SETTINGS.animationLevel,
    defaultSnoozeMinutes: validSnooze,
    maxPreviewItems: validMaxPreviewItems,
    allowWorkspaceSpecificHistory:
      typeof input?.allowWorkspaceSpecificHistory === "boolean"
        ? input.allowWorkspaceSpecificHistory
        : DEFAULT_INTELLIGENT_ASSISTANT_SETTINGS.allowWorkspaceSpecificHistory,
    showWorkspaceAlertsInOrganizations:
      typeof input?.showWorkspaceAlertsInOrganizations === "boolean"
        ? input.showWorkspaceAlertsInOrganizations
        : DEFAULT_INTELLIGENT_ASSISTANT_SETTINGS.showWorkspaceAlertsInOrganizations,
    alertTypes: {
      overdue:
        typeof input?.alertTypes?.overdue === "boolean"
          ? input.alertTypes.overdue
          : DEFAULT_INTELLIGENT_ASSISTANT_SETTINGS.alertTypes.overdue,
      dueToday:
        typeof input?.alertTypes?.dueToday === "boolean"
          ? input.alertTypes.dueToday
          : DEFAULT_INTELLIGENT_ASSISTANT_SETTINGS.alertTypes.dueToday,
      dueSoon:
        typeof input?.alertTypes?.dueSoon === "boolean"
          ? input.alertTypes.dueSoon
          : DEFAULT_INTELLIGENT_ASSISTANT_SETTINGS.alertTypes.dueSoon,
      waitingReview:
        typeof input?.alertTypes?.waitingReview === "boolean"
          ? input.alertTypes.waitingReview
          : DEFAULT_INTELLIGENT_ASSISTANT_SETTINGS.alertTypes.waitingReview,
    },
  };
}
