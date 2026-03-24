const MISSING_PREFIX = '[runtime-env]';

function readEnv(name: string) {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

function missingEnvError(name: string) {
  return new Error(`${MISSING_PREFIX} Falta la variable ${name}. Revisa .env.local antes de correr la app o scripts operativos.`);
}

export function requireEnv(name: string) {
  const value = readEnv(name);
  if (!value) throw missingEnvError(name);
  return value;
}

export function getPublicSupabaseEnv() {
  return {
    url: requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    anonKey: requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  };
}

export function getServiceRoleEnv() {
  return {
    url: requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    serviceRoleKey: requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
  };
}
