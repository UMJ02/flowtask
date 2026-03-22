import { BriefcaseBusiness } from 'lucide-react';
import { ClientListPanel } from '@/components/clients/client-list-panel';
import { Card } from '@/components/ui/card';
import { SectionHeader } from '@/components/ui/section-header';
import { getClients } from '@/lib/queries/clients';
import { canUser } from '@/lib/permissions/checks';
import { normalizeClientSearch, type SearchParamsRecord } from '@/lib/runtime/search-params';

export default async function ClientsPage({ searchParams }: { searchParams?: Promise<SearchParamsRecord> }) {
  const q = normalizeClientSearch((await searchParams) ?? {});
  const [clients, canManageClients] = await Promise.all([getClients(q), canUser('clients.manage')]);

  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="Workspace comercial"
        title="Clientes"
        description="Consulta cada cliente con sus proyectos, carga y actividad reciente. La navegación queda enfocada en abrir contextos de trabajo sin confusión."
        icon={<BriefcaseBusiness className="h-5 w-5" />}
      />
      {!canManageClients ? (
        <Card className="border-amber-100 bg-amber-50/70">
          <p className="text-sm text-amber-800">Tienes acceso de lectura a clientes. El rol con gestión de clientes puede crear y editar espacios por organización.</p>
        </Card>
      ) : null}
      <ClientListPanel items={clients} search={q} />
    </div>
  );
}
