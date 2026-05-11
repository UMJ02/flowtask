import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { getRuntimeEnv } from '@/lib/runtime/env';

function decodeJwtPayload(token: string) {
  const parts = token.split('.');
  if (parts.length < 2) return null;
  try {
    return JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8')) as { role?: string; ref?: string; iss?: string };
  } catch {
    return null;
  }
}

function getSupabaseProjectRef(url: string) {
  try {
    const host = new URL(url).host;
    return host.endsWith('.supabase.co') ? host.split('.')[0] : null;
  } catch {
    return null;
  }
}

export function assertServiceRoleKey() {
  const env = getRuntimeEnv();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!serviceRoleKey) {
    throw new Error('[supabase-admin] Missing required environment variable: SUPABASE_SERVICE_ROLE_KEY');
  }

  const payload = decodeJwtPayload(serviceRoleKey);
  if (payload?.role && payload.role !== 'service_role') {
    throw new Error('[supabase-admin] SUPABASE_SERVICE_ROLE_KEY is not a service_role key.');
  }

  const expectedRef = getSupabaseProjectRef(env.NEXT_PUBLIC_SUPABASE_URL);
  if (payload?.ref && expectedRef && payload.ref !== expectedRef) {
    throw new Error(`[supabase-admin] SUPABASE_SERVICE_ROLE_KEY belongs to project ${payload.ref}, but NEXT_PUBLIC_SUPABASE_URL points to ${expectedRef}.`);
  }

  return { env, serviceRoleKey };
}

export function createAdminClient() {
  const { env, serviceRoleKey } = assertServiceRoleKey();

  return createSupabaseClient(env.NEXT_PUBLIC_SUPABASE_URL, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
