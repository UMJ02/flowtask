const REQUIRED_ENV_KEYS = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'] as const;

type RequiredEnvKey = (typeof REQUIRED_ENV_KEYS)[number];

export type RuntimeEnv = Record<RequiredEnvKey, string>;

type RuntimeEnvSource = Record<RequiredEnvKey, string | undefined>;

function getRawRuntimeEnv(): RuntimeEnvSource {
  return {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };
}

function readEnvValue(key: RequiredEnvKey, source: RuntimeEnvSource): string {
  const value = source[key];

  if (!value || !value.trim()) {
    throw new Error(`[runtime] Missing required environment variable: ${key}`);
  }

  return value;
}

export function getRuntimeEnv(): RuntimeEnv {
  const source = getRawRuntimeEnv();

  return {
    NEXT_PUBLIC_SUPABASE_URL: readEnvValue('NEXT_PUBLIC_SUPABASE_URL', source),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: readEnvValue('NEXT_PUBLIC_SUPABASE_ANON_KEY', source),
  };
}

export function tryGetRuntimeEnv(): RuntimeEnv | null {
  const source = getRawRuntimeEnv();
  const url = source.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = source.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !key) {
    return null;
  }

  return {
    NEXT_PUBLIC_SUPABASE_URL: url,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: key,
  };
}

export function getRuntimeEnvStatus() {
  const source = getRawRuntimeEnv();

  return REQUIRED_ENV_KEYS.map((key) => ({
    key,
    present: Boolean(source[key] && source[key]?.trim()),
  }));
}
