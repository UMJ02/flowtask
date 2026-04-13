export const ACTIVE_WORKSPACE_COOKIE = 'flowtask-active-workspace';
export const PERSONAL_WORKSPACE_VALUE = 'personal';

export type ActiveWorkspacePreference = typeof PERSONAL_WORKSPACE_VALUE | string | null;

export function normalizeWorkspacePreference(value: unknown): ActiveWorkspacePreference {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  if (!normalized) return null;
  if (normalized === PERSONAL_WORKSPACE_VALUE) return PERSONAL_WORKSPACE_VALUE;
  return normalized;
}

export function isPersonalWorkspacePreference(value: ActiveWorkspacePreference) {
  return value === PERSONAL_WORKSPACE_VALUE;
}

export function parseWorkspaceCookieValue(cookieHeader?: string | null): ActiveWorkspacePreference {
  if (!cookieHeader) return null;
  const chunks = cookieHeader.split(';');
  for (const chunk of chunks) {
    const [rawName, ...rest] = chunk.trim().split('=');
    if (rawName !== ACTIVE_WORKSPACE_COOKIE) continue;
    const rawValue = rest.join('=');
    if (!rawValue) return null;
    return normalizeWorkspacePreference(decodeURIComponent(rawValue));
  }
  return null;
}
