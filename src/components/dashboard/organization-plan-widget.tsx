import { Card } from "@/components/ui/card";
import type { OrganizationPlanSummary } from "@/types/billing";

export function OrganizationPlanWidget({ summary }: { summary?: OrganizationPlanSummary | null }) {
  return (
    <Card>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Plan de organización</p>
      <h2 className="mt-1 text-lg font-semibold text-slate-900">{summary ? summary.planName : "Sin plan"}</h2>
      <p className="mt-2 text-sm text-slate-600">
        {summary ? `Estado ${summary.status} · ${summary.seatsUsed}/${summary.seatsIncluded} usuarios · ${summary.projectsUsed}/${summary.projectsIncluded} proyectos` : "Configura una suscripción para habilitar límites, renovación y reportes de uso."}
      </p>
      <a href="/app/organization/billing" className="mt-4 inline-flex rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-900">Ver facturación</a>
    </Card>
  );
}
