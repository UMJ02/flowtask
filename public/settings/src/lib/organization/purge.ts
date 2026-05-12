import { createAdminClient } from '@/lib/supabase/admin';

export type PurgeOrganizationsResult = {
  scanned: number;
  purged: number;
  purgedIds: string[];
  results?: unknown[];
};

type PurgeRpcResult = {
  ok?: boolean;
  results?: Array<{
    ok?: boolean;
    organization_id?: string;
    [key: string]: unknown;
  }>;
  error?: string;
};

export async function purgeExpiredOrganizations(): Promise<PurgeOrganizationsResult> {
  const supabase = createAdminClient();

  const { data, error } = await supabase.rpc('purge_expired_organizations');

  if (error) {
    if (error.code === '42883' || /function .* does not exist/i.test(error.message)) {
      throw new Error('La función purge_expired_organizations no existe. Aplica la migración v58.24.9 antes de ejecutar el cron.');
    }
    throw new Error(error.message);
  }

  const result = data as PurgeRpcResult | null;
  if (result?.ok === false) {
    throw new Error(result.error ?? 'No fue posible ejecutar la purga automática.');
  }

  const results = Array.isArray(result?.results) ? result.results : [];
  const purgedIds = results
    .filter((item) => item?.ok !== false && typeof item?.organization_id === 'string')
    .map((item) => item.organization_id as string);

  return {
    scanned: results.length,
    purged: purgedIds.length,
    purgedIds,
    results,
  };
}
