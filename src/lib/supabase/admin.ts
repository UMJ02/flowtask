import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { getRuntimeEnv } from '@/lib/runtime/env';

export function createAdminClient() {
  const env = getRuntimeEnv();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!serviceRoleKey) {
    throw new Error('[supabase-admin] Missing required environment variable: SUPABASE_SERVICE_ROLE_KEY');
  }

  return createSupabaseClient(env.NEXT_PUBLIC_SUPABASE_URL, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
