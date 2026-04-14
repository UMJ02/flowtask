export type IntelligentAssistantSensitivity = 'critical' | 'focus' | 'balanced' | 'adaptive';

export type IntelligentAssistantRuleKey =
  | 'overdue'
  | 'dueToday'
  | 'dueSoon'
  | 'waitingReview'
  | 'stale'
  | 'noDueDate';

export type IntelligentAssistantSettings = {
  enabled: boolean;
  sensitivity: IntelligentAssistantSensitivity;
  cadenceMinutes: number;
  showMascot: boolean;
  showOnDashboardOnly: boolean;
  compactMode: boolean;
  workspaceAware: boolean;
  maxCards: 1 | 2 | 3;
  rules: Record<IntelligentAssistantRuleKey, boolean>;
};

export const INTELLIGENT_ASSISTANT_SETTINGS_KEY = 'flowtask:intelligent-attention-settings';

export const DEFAULT_INTELLIGENT_ASSISTANT_SETTINGS: IntelligentAssistantSettings = {
  enabled: true,
  sensitivity: 'adaptive',
  cadenceMinutes: 45,
  showMascot: true,
  showOnDashboardOnly: true,
  compactMode: true,
  workspaceAware: true,
  maxCards: 2,
  rules: {
    overdue: true,
    dueToday: true,
    dueSoon: true,
    waitingReview: true,
    stale: true,
    noDueDate: false,
  },
};

export function normalizeIntelligentAssistantSettings(input: Partial<IntelligentAssistantSettings> | null | undefined): IntelligentAssistantSettings {
  const cadence = Number(input?.cadenceMinutes ?? DEFAULT_INTELLIGENT_ASSISTANT_SETTINGS.cadenceMinutes);
  const validCadence = Number.isFinite(cadence) ? Math.min(180, Math.max(10, cadence)) : DEFAULT_INTELLIGENT_ASSISTANT_SETTINGS.cadenceMinutes;
  const rawMaxCards = Number((input as { maxCards?: number } | null | undefined)?.maxCards ?? DEFAULT_INTELLIGENT_ASSISTANT_SETTINGS.maxCards);
  const maxCards = rawMaxCards === 3 ? 3 : rawMaxCards === 1 ? 1 : 2;
  const rulesInput = (input as { rules?: Partial<Record<IntelligentAssistantRuleKey, boolean>> } | null | undefined)?.rules ?? {};

  return {
    enabled: typeof input?.enabled === 'boolean' ? input.enabled : DEFAULT_INTELLIGENT_ASSISTANT_SETTINGS.enabled,
    sensitivity:
      input?.sensitivity === 'critical' || input?.sensitivity === 'focus' || input?.sensitivity === 'balanced' || input?.sensitivity === 'adaptive'
        ? input.sensitivity
        : DEFAULT_INTELLIGENT_ASSISTANT_SETTINGS.sensitivity,
    cadenceMinutes: validCadence,
    showMascot: typeof input?.showMascot === 'boolean' ? input.showMascot : DEFAULT_INTELLIGENT_ASSISTANT_SETTINGS.showMascot,
    showOnDashboardOnly:
      typeof input?.showOnDashboardOnly === 'boolean'
        ? input.showOnDashboardOnly
        : DEFAULT_INTELLIGENT_ASSISTANT_SETTINGS.showOnDashboardOnly,
    compactMode: typeof (input as { compactMode?: boolean } | null | undefined)?.compactMode === 'boolean'
      ? Boolean((input as { compactMode?: boolean }).compactMode)
      : DEFAULT_INTELLIGENT_ASSISTANT_SETTINGS.compactMode,
    workspaceAware: typeof (input as { workspaceAware?: boolean } | null | undefined)?.workspaceAware === 'boolean'
      ? Boolean((input as { workspaceAware?: boolean }).workspaceAware)
      : DEFAULT_INTELLIGENT_ASSISTANT_SETTINGS.workspaceAware,
    maxCards,
    rules: {
      overdue: typeof rulesInput.overdue === 'boolean' ? rulesInput.overdue : DEFAULT_INTELLIGENT_ASSISTANT_SETTINGS.rules.overdue,
      dueToday: typeof rulesInput.dueToday === 'boolean' ? rulesInput.dueToday : DEFAULT_INTELLIGENT_ASSISTANT_SETTINGS.rules.dueToday,
      dueSoon: typeof rulesInput.dueSoon === 'boolean' ? rulesInput.dueSoon : DEFAULT_INTELLIGENT_ASSISTANT_SETTINGS.rules.dueSoon,
      waitingReview: typeof rulesInput.waitingReview === 'boolean' ? rulesInput.waitingReview : DEFAULT_INTELLIGENT_ASSISTANT_SETTINGS.rules.waitingReview,
      stale: typeof rulesInput.stale === 'boolean' ? rulesInput.stale : DEFAULT_INTELLIGENT_ASSISTANT_SETTINGS.rules.stale,
      noDueDate: typeof rulesInput.noDueDate === 'boolean' ? rulesInput.noDueDate : DEFAULT_INTELLIGENT_ASSISTANT_SETTINGS.rules.noDueDate,
    },
  };
}
