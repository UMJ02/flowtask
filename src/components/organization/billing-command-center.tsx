import { Card } from "@/components/ui/card";
import type { OrganizationPlanSummary, OrganizationUsageMetric } from "@/types/billing";

function toneClass(percent: number) {
  if (percent >= 90) return "bg-rose-50 text-rose-700 ring-1 ring-rose-200";
  if (percent >= 75) return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
  return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
}

export function BillingCommandCenter({ summary, usage }: { summary?: OrganizationPlanSummary | null; usage: OrganizationUsageMetric[] }) {
  const hottest = [...usage].sort((a, b) => b.percentage - a.percentage)[0] ?? null;
  const readiness = summary?.softLocked ? 18 : hottest ? Math.max(0, 100 - hottest.percentage) : 100;

  return (
    <Card>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Billing command center</p>
          <h2 className="mt-1 text-xl font-bold text-slate-900">Pulso financiero y capacidad operativa</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">Resume el estado del plan actual, la vigencia, la renovación anual y el nivel de presión sobre límites para que la organización no choque con bloqueos evitables.</p>
        </div>
        <div className="rounded-2xl bg-slate-950 px-5 py-4 text-white">
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Readiness</p>
          <p className="mt-1 text-3xl font-bold">{readiness}%</p>
          <p className="mt-2 text-sm text-slate-300">{summary ? `${summary.planName} · ${summary.billingCycle === "annual" ? "anual" : "mensual"}` : "Sin suscripción activa"}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="Plan" value={summary?.planName ?? "Sin plan"} hint={summary ? `Estado ${summary.status}` : "Configura suscripción"} />
        <Metric label="Vigencia" value={summary?.expiresAtLabel ?? summary?.trialEndsAtLabel ?? "Pendiente"} hint={summary?.autoRenew ? "Renueva automáticamente" : "Requiere renovación manual"} />
        <Metric label="Uso más presionado" value={hottest ? hottest.label : "Estable"} hint={hottest ? `${hottest.percentage}% del límite` : "Sin presión detectada"} />
        <Metric label="Asientos libres" value={summary ? String(Math.max(summary.seatsIncluded - summary.seatsUsed, 0)) : "0"} hint="Capacidad disponible hoy" />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {usage.map((item) => (
          <div key={item.key} className="rounded-2xl border border-slate-200 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                <p className="mt-1 text-xs text-slate-500">{item.used} de {item.limit} {item.unit}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${toneClass(item.percentage)}`}>{item.percentage}%</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Metric({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-sm text-slate-600">{hint}</p>
    </div>
  );
}
