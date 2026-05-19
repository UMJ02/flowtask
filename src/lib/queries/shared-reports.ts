import { createClient } from '@/lib/supabase/server';
import type { SharedAnalyticsPayload } from '@/lib/share/analytics-share';

export async function getStoredSharedAnalyticsPayload(token: string): Promise<SharedAnalyticsPayload | null> {
  if (!token || !token.startsWith('rpt_')) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('shared_reports')
    .select('payload')
    .eq('token', token)
    .is('revoked_at', null)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .maybeSingle();

  if (error || !data?.payload) return null;
  return data.payload as SharedAnalyticsPayload;
}
