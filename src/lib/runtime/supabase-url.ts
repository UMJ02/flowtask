import { getRuntimeEnv } from '@/lib/runtime/env';

export function getSupabaseUrl() {
  return getRuntimeEnv().NEXT_PUBLIC_SUPABASE_URL;
}
