
export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { ClientDetailPanels } from '@/components/clients/client-detail-panels';
import { Card } from '@/components/ui/card';
import { getClientById } from '@/lib/queries/clients';
import { safeServerCall } from '@/lib/runtime/safe-server';

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await safeServerCall('getClientById', () => getClientById(id), null);

  if (!client) notFound();

  return (
    <div className="space-y-4">
      <Card className="rounded-[28px] border border-slate-200/90 bg-white/[0.92] p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
        <Link href="/app/clients" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" />
          Volver a clientes
        </Link>
      </Card>
      <ClientDetailPanels client={client!} />
    </div>
  );
}
