const REQUIRED_ENV_KEYS = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'] as const;

type RequiredEnvKey = (typeof REQUIRED_ENV_KEYS)[number];

export type RuntimeEnv = Record<RequiredEnvKey, string>;

function readEnvValue(key: RequiredEnvKey): string {
  const value = process.env[key];

  if (!value || !value.trim()) {
    throw new Error(`[runtime] Missing required environment variable: ${key}`);
  }

  return value;
}

export function getRuntimeEnv(): RuntimeEnv {
  return {
    NEXT_PUBLIC_SUPABASE_URL: readEnvValue('NEXT_PUBLIC_SUPABASE_URL'),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: readEnvValue('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  };
}

export function getRuntimeEnvStatus() {
  return REQUIRED_ENV_KEYS.map((key) => ({
    key,
    present: Boolean(process.env[key] && process.env[key]?.trim()),
  }));
}
