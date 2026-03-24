import { AlertTriangle, BriefcaseBusiness, CheckCircle2, UsersRound } from 'lucide-react';
import { ClientListPanel } from '@/components/clients/client-list-panel';
import { CoreMetricStrip } from '@/components/core/core-metric-strip';
import { Card } from '@/components/ui/card';
import { SectionHeader } from '@/components/ui/section-header';
import { FilterPresets } from '@/components/ui/filter-presets';
import { getClients } from '@/lib/queries/clients';
import { canUser } from '@/lib/permissions/checks';
import { normalizeClientSearch, toQueryString, type SearchParamsRecord } from '@/lib/runtime/search-params';

export default async function ClientsPage({ searchParams }: { searchParams?: Promise<SearchParamsRecord> }) {
  const q = normalizeClientSearch((await searchParams) ?? {});
  const [clients, canManageClients] = await Promise.all([getClients(q), canUser('clients.manage')]);
  const currentQuery = toQueryString({ q });

  const activeCount = clients.filter((client) => client.status === 'activo').length;
  const withWorkloadCount = clients.filter((client) => client.openTasksCount > 0 || client.projectsCount > 0).length;
  const overdueCount = clients.filter((client) => client.overdueTasks > 0).length;
  const healthyCount = clients.filter((client) => client.openTasksCount === 0 && client.overdueTasks === 0 && client.projectsCount > 0).length;

  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="Workspace comercial"
        title="Clientes"
        description="Consulta cada cliente con sus proyectos, carga y actividad reciente. La navegación queda enfocada en abrir contextos de trabajo sin confusión."
        icon={<BriefcaseBusiness className="h-5 w-5" />}
      />

      <CoreMetricStrip
        eyebrow="Core hardening"
        title="Visión rápida por cuenta"
        description="Esta lectura inicial ayuda a entrar a clientes con más contexto: quién está activo, quién tiene carga y dónde hay vencimientos que afectan la relación."
        items={[
          {
            label: 'Activos',
            value: activeCount,
            helper: 'Clientes marcados como activos en la organización.',
            icon: <UsersRound className="h-5 w-5" />,
            tone: activeCount ? 'stable' : 'default',
          },
          {
            label: 'Con carga',
            value: withWorkloadCount,
            helper: 'Cuentas con proyectos o tareas en movimiento.',
            icon: <BriefcaseBusiness className="h-5 w-5" />,
            tone: withWorkloadCount ? 'stable' : 'default',
          },
          {
            label: 'Con vencidas',
            value: overdueCount,
            helper: 'Clientes que hoy arrastran presión operativa.',
            icon: <AlertTriangle className="h-5 w-5" />,
            tone: overdueCount ? 'attention' : 'default',
          },
          {
            label: 'Limpios',
            value: healthyCount,
            helper: 'Sin pendientes abiertos y con señal de operación sana.',
            icon: <CheckCircle2 className="h-5 w-5" />,
            tone: healthyCount ? 'stable' : 'default',
          },
        ]}
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
