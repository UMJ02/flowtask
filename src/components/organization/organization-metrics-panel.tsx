import { Card } from "@/components/ui/card";
import type { OrganizationMetricSummary } from "@/types/organization";

export function OrganizationMetricsPanel({ metrics }: { metrics?: OrganizationMetricSummary | null }) {
  return (
    <Card>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Dashboard por organización</p>
      <h2 className="mt-1 text-lg font-semibold text-slate-900">Salud operativa consolidada</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Miembros" value={String(metrics?.members ?? 0)} />
        <Metric label="Clientes" value={String(metrics?.clients ?? 0)} />
        <Metric label="Proyectos activos" value={String(metrics?.activeProjects ?? 0)} />
        <Metric label="Tareas abiertas" value={String(metrics?.openTasks ?? 0)} />
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 p-4">
          <p className="text-sm font-semibold text-slate-900">Roles del equipo</p>
          <div className="mt-3 space-y-2 text-sm text-slate-600">
            <Row label="Admins globales" value={metrics?.roleBreakdown.admin_global ?? 0} />
            <Row label="Managers" value={metrics?.roleBreakdown.manager ?? 0} />
            <Row label="Members" value={metrics?.roleBreakdown.member ?? 0} />
            <Row label="Viewers" value={metrics?.roleBreakdown.viewer ?? 0} />
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 p-4">
          <p className="text-sm font-semibold text-slate-900">Permisos por cliente</p>
          <div className="mt-3 space-y-2 text-sm text-slate-600">
            <Row label="Clientes editables" value={metrics?.editableClients ?? 0} />
            <Row label="Con gestión de miembros" value={metrics?.memberManagedClients ?? 0} />
            <Row label="Solo lectura" value={metrics?.readOnlyClients ?? 0} />
          </div>
        </div>
      </div>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-900 px-4 py-3 text-white">
      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2">
      <span>{label}</span>
      <strong className="text-slate-900">{value}</strong>
    </div>
  );
}
