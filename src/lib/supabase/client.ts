import { createBrowserClient } from '@supabase/ssr';
import { getRuntimeEnv } from '@/lib/runtime/env';

export function createClient() {
  const env = getRuntimeEnv();

  return createBrowserClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
