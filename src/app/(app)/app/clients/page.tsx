import { BriefcaseBusiness } from 'lucide-react';
import { ClientListPanel } from '@/components/clients/client-list-panel';
import { Card } from '@/components/ui/card';
import { ErrorState } from '@/components/ui/error-state';
import { SectionHeader } from '@/components/ui/section-header';
import { FilterPresets } from '@/components/ui/filter-presets';
import { getClients } from '@/lib/queries/clients';
import { canUser } from '@/lib/permissions/checks';
import { safeServerCall } from '@/lib/runtime/safe-server';
import { normalizeClientSearch, toQueryString, type SearchParamsRecord } from '@/lib/runtime/search-params';

export default async function ClientsPage({ searchParams }: { searchParams?: Promise<SearchParamsRecord> }) {
  const q = normalizeClientSearch((await searchParams) ?? {});
  const [clients, canManageClients] = await Promise.all([
    safeServerCall('getClients', () => getClients(q), null as Awaited<ReturnType<typeof getClients>> | null),
    safeServerCall('canUser(clients.manage)', () => canUser('clients.manage'), false),
  ]);
  const currentQuery = toQueryString({ q });

  if (clients === null) {
    return (
      <ErrorState
        title="No pudimos abrir clientes"
        description="La consulta de clientes falló en esta carga. Reintenta desde esta pantalla cuando la conexión se estabilice."
      />
    );
  }

  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="Workspace comercial"
        title="Clientes"
        description="Consulta cada cliente con sus proyectos, carga y actividad reciente. La navegación queda enfocada en abrir contextos de trabajo sin confusión."
        icon={<BriefcaseBusiness className="h-5 w-5" />}
      />
      <FilterPresets
        storageKey="flowtask:filters:clients"
        basePath="/app/clients"
        currentQuery={currentQuery}
        title="Búsquedas guardadas"
        emptyLabel="Guarda consultas por cliente para cambiar entre cuentas activas, prospectos o búsquedas frecuentes."
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
