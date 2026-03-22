import { Card } from '@/components/ui/card';
import type { OrganizationPlanSummary } from '@/types/billing';

export function OrganizationPlanWidget({ summary }: { summary?: OrganizationPlanSummary | null }) {
  return (
    <Card className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Plan</p>
        <h2 className="mt-1 text-lg font-semibold text-slate-900">{summary ? summary.planName : 'Sin plan'}</h2>
        <p className="mt-2 text-sm text-slate-600">
          {summary
            ? `${summary.seatsUsed}/${summary.seatsIncluded} usuarios · ${summary.projectsUsed}/${summary.projectsIncluded} proyectos`
            : 'Activa un plan para controlar cupos y uso.'}
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Estado</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{summary?.status ?? 'Pendiente'}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Proyectos</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{summary ? `${summary.projectsUsed}/${summary.projectsIncluded}` : '0/0'}</p>
        </div>
      </div>
      <a href="/app/organization/billing" className="inline-flex rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50">
        Ver facturación
      </a>
    </Card>
  );
}
