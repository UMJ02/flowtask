const DEFAULT_COOLDOWN_SECONDS = 90;
const MAX_COOLDOWN_SECONDS = 300;

export type AuthCooldown = {
  email: string;
  attempts: number;
  seconds: number;
  until: number;
  source: 'supabase' | 'local';
};

export function normalizeAuthEmail(value?: string | null) {
  return (value ?? '').trim().toLowerCase();
}

export function isAuthRateLimitMessage(message?: string | null) {
  const value = (message ?? '').toLowerCase();
  return (
    value.includes('rate limit') ||
    value.includes('too many') ||
    value.includes('security purposes') ||
    value.includes('over email send rate limit') ||
    value.includes('email rate limit') ||
    value.includes('for security')
  );
}

export function getCooldownSecondsFromMessage(message?: string | null) {
  const value = message ?? '';
  const secondsMatch = value.match(/(\d+)\s*(seconds?|segundos?|s)\b/i);
  if (secondsMatch?.[1]) {
    return Math.min(Math.max(Number(secondsMatch[1]), DEFAULT_COOLDOWN_SECONDS), MAX_COOLDOWN_SECONDS);
  }
  const minuteMatch = value.match(/(\d+)\s*(minutes?|minutos?|m)\b/i);
  if (minuteMatch?.[1]) {
    return Math.min(Math.max(Number(minuteMatch[1]) * 60, DEFAULT_COOLDOWN_SECONDS), MAX_COOLDOWN_SECONDS);
  }
  return DEFAULT_COOLDOWN_SECONDS;
}

function getStorageKey(scope: string, email: string) {
  return `flowtask:${scope}:cooldown:${email}`;
}

export function readAuthCooldown(scope: string, email: string): AuthCooldown | null {
  if (typeof window === 'undefined') return null;
  const normalizedEmail = normalizeAuthEmail(email);
  if (!normalizedEmail) return null;
  try {
    const raw = window.localStorage.getItem(getStorageKey(scope, normalizedEmail));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthCooldown;
    if (!parsed.until || parsed.until <= Date.now()) {
      window.localStorage.removeItem(getStorageKey(scope, normalizedEmail));
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveAuthCooldown(scope: string, email: string, seconds: number, attempts = 1, source: AuthCooldown['source'] = 'supabase') {
  if (typeof window === 'undefined') return null;
  const normalizedEmail = normalizeAuthEmail(email);
  if (!normalizedEmail) return null;
  const safeSeconds = Math.min(Math.max(seconds, DEFAULT_COOLDOWN_SECONDS), MAX_COOLDOWN_SECONDS);
  const current = readAuthCooldown(scope, normalizedEmail);
  const cooldown: AuthCooldown = {
    email: normalizedEmail,
    attempts: Math.max(current?.attempts ?? 0, attempts),
    seconds: safeSeconds,
    until: Date.now() + safeSeconds * 1000,
    source,
  };
  window.localStorage.setItem(getStorageKey(scope, normalizedEmail), JSON.stringify(cooldown));
  return cooldown;
}

export function clearAuthCooldown(scope: string, email: string) {
  if (typeof window === 'undefined') return;
  const normalizedEmail = normalizeAuthEmail(email);
  if (!normalizedEmail) return;
  window.localStorage.removeItem(getStorageKey(scope, normalizedEmail));
}
