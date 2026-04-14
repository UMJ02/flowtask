import { createAdminClient } from '@/lib/supabase/admin';

export type PurgeOrganizationsResult = {
  scanned: number;
  purged: number;
  purgedIds: string[];
};

export async function purgeExpiredOrganizations(nowIso = new Date().toISOString()): Promise<PurgeOrganizationsResult> {
  const supabase = createAdminClient();

  const { data: expiredOrganizations, error } = await supabase
    .from('organizations')
    .select('id')
    .not('deleted_at', 'is', null)
    .lte('purge_scheduled_at', nowIso)
    .limit(100);

  if (error) {
    throw new Error(error.message);
  }

  const ids = (expiredOrganizations ?? []).map((row: { id: string }) => row.id).filter(Boolean);
  if (!ids.length) {
    return { scanned: 0, purged: 0, purgedIds: [] };
  }

  const { error: deleteError } = await supabase
    .from('organizations')
    .delete()
    .in('id', ids);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  return {
    scanned: ids.length,
    purged: ids.length,
    purgedIds: ids,
  };
}
