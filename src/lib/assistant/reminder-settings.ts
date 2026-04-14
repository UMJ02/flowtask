export type IntelligentAssistantSensitivity = 'critical' | 'focus' | 'balanced';

export type IntelligentAssistantSettings = {
  enabled: boolean;
  sensitivity: IntelligentAssistantSensitivity;
  cadenceMinutes: number;
  showMascot: boolean;
  showOnDashboardOnly: boolean;
};

export const INTELLIGENT_ASSISTANT_SETTINGS_KEY = 'flowtask:intelligent-attention-settings';

export const DEFAULT_INTELLIGENT_ASSISTANT_SETTINGS: IntelligentAssistantSettings = {
  enabled: true,
  sensitivity: 'focus',
  cadenceMinutes: 45,
  showMascot: true,
  showOnDashboardOnly: true,
};

export function normalizeIntelligentAssistantSettings(
  input?: Partial<IntelligentAssistantSettings> | null,
): IntelligentAssistantSettings {
  const cadence = Number(input?.cadenceMinutes ?? DEFAULT_INTELLIGENT_ASSISTANT_SETTINGS.cadenceMinutes);
  const validCadence = Number.isFinite(cadence) ? Math.min(180, Math.max(10, cadence)) : DEFAULT_INTELLIGENT_ASSISTANT_SETTINGS.cadenceMinutes;

  return {
    enabled: typeof input?.enabled === 'boolean' ? input.enabled : DEFAULT_INTELLIGENT_ASSISTANT_SETTINGS.enabled,
    sensitivity:
      input?.sensitivity === 'critical' || input?.sensitivity === 'focus' || input?.sensitivity === 'balanced'
        ? input.sensitivity
        : DEFAULT_INTELLIGENT_ASSISTANT_SETTINGS.sensitivity,
    cadenceMinutes: validCadence,
    showMascot: typeof input?.showMascot === 'boolean' ? input.showMascot : DEFAULT_INTELLIGENT_ASSISTANT_SETTINGS.showMascot,
    showOnDashboardOnly:
      typeof input?.showOnDashboardOnly === 'boolean'
        ? input.showOnDashboardOnly
        : DEFAULT_INTELLIGENT_ASSISTANT_SETTINGS.showOnDashboardOnly,
  };
}
