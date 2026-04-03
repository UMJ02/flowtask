import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl } from '@/lib/runtime/supabase-url';

export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey || !serviceRoleKey.trim()) {
    throw new Error('[supabase-admin] Missing SUPABASE_SERVICE_ROLE_KEY');
  }

  return createClient(getSupabaseUrl(), serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
