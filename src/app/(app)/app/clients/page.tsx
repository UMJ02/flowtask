export const dynamic = 'force-dynamic';

import { ClientListPanel } from '@/components/clients/client-list-panel';
import { Card } from '@/components/ui/card';
import { getClients } from '@/lib/queries/clients';
import { safeServerCall } from '@/lib/runtime/safe-server';

export default async function ClientsPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const params = (await searchParams) ?? {};
  const q = typeof params.q === 'string' ? params.q : '';
  const clients = await safeServerCall('getClients', () => getClients(q), []);

  return (
    <div className="space-y-4">
      <Card>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Clientes</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Vista consolidada de clientes</h1>
        <p className="mt-2 text-sm text-slate-500">Consulta carga, proyectos y tareas abiertas por cada cuenta activa.</p>
      </Card>
      <ClientListPanel items={clients} />
    </div>
  );
}
