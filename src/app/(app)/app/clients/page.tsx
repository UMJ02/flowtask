
export const dynamic = 'force-dynamic';

import { ClientManagerPanel } from '@/components/clients/client-manager-panel';
import { getClients } from '@/lib/queries/clients';
import { safeServerCall } from '@/lib/runtime/safe-server';

export default async function ClientsPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const params = (await searchParams) ?? {};
  const q = typeof params.q === 'string' ? params.q : '';
  const clients = await safeServerCall('getClients', () => getClients(q), []);

  return <ClientManagerPanel items={clients} initialQuery={q} />;
}
