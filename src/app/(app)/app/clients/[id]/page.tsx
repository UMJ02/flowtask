export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { ClientDetailPanels } from '@/components/clients/client-detail-panels';
import { getClientById } from '@/lib/queries/clients';
import { safeServerCall } from '@/lib/runtime/safe-server';

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await safeServerCall('getClientById', () => getClientById(id), null);
  if (!client) notFound();
  return <ClientDetailPanels client={client} />;
}
