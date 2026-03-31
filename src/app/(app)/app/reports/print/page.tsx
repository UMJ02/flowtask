import { Card } from '@/components/ui/card';
import { getReportsOverview } from '@/lib/queries/reports';
import { safeServerCall } from '@/lib/runtime/safe-server';

export default async function ReportsPrintPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const params = (await searchParams) ?? {};
  const type = typeof params.type === 'string' ? params.type : 'summary';
  const summary = await safeServerCall('getReportsOverview', () => getReportsOverview(), null);

  return (
    <div className="mx-auto max-w-5xl space-y-4 p-4 print:p-0">
      <Card>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Reporte imprimible</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Vista {type}</h1>
        <p className="mt-2 text-sm text-slate-500">Versión simple para impresión o exportación rápida desde el navegador.</p>
      </Card>
      <Card>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Tareas activas" value={summary?.kpis.activeTasks ?? 0} />
          <Metric label="Vencidas" value={summary?.kpis.overdueTasks ?? 0} />
          <Metric label="Proyectos activos" value={summary?.kpis.activeProjects ?? 0} />
          <Metric label="Clientes activos" value={summary?.kpis.clients ?? 0} />
        </div>
      </Card>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
