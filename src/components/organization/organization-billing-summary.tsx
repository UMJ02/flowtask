import { Card } from "@/components/ui/card";
import type { OrganizationPlanSummary } from "@/types/billing";

const statusCopy: Record<string, string> = {
  trial: "Prueba",
  active: "Activa",
  past_due: "Pendiente de pago",
  canceled: "Cancelada",
};

export function OrganizationBillingSummary({ summary }: { summary?: OrganizationPlanSummary | null }) {
  if (!summary) {
    return (
      <Card>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Suscripción</p>
        <h2 className="mt-1 text-lg font-semibold text-slate-900">Sin plan configurado</h2>
        <p className="mt-2 text-sm text-slate-600">Crea una suscripción por organización para activar límites, renovación y facturación.</p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Suscripción</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">Plan {summary.planName}</h2>
          <p className="mt-2 text-sm text-slate-600">Estado: {statusCopy[summary.status] ?? summary.status} · Ciclo {summary.billingCycle === "annual" ? "anual" : "mensual"}</p>
        </div>
        <a href="/app/organization/billing" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Gestionar plan</a>
      </div>
      {summary.softLocked ? (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <p className="font-semibold">Bloqueo suave activo</p>
          <p className="mt-1">{summary.softLockReason ?? 'La organización conserva acceso de lectura, pero debe regularizar su plan para seguir creciendo.'}</p>
        </div>
      ) : null}
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Metric label="Usuarios" value={`${summary.seatsUsed}/${summary.seatsIncluded}`} />
        <Metric label="Proyectos" value={`${summary.projectsUsed}/${summary.projectsIncluded}`} />
        <Metric label="Storage" value={`${summary.storageGbUsed}/${summary.storageGbIncluded} GB`} />
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4 text-sm text-slate-600">
        <div className="rounded-2xl border border-slate-200 p-4">Renovación: <strong className="text-slate-900">{summary.renewalDateLabel ?? "-"}</strong></div>
        <div className="rounded-2xl border border-slate-200 p-4">Vigencia: <strong className="text-slate-900">{summary.expiresAtLabel ?? summary.trialEndsAtLabel ?? "-"}</strong></div>
        <div className="rounded-2xl border border-slate-200 p-4">Renovación auto: <strong className="text-slate-900">{summary.autoRenew ? 'Activa' : 'Desactivada'}</strong></div>
        <div className="rounded-2xl border border-slate-200 p-4">Código corporativo: <strong className="text-slate-900">{summary.activationCode ?? 'Self-serve'}</strong></div>
      </div>
      {summary.scheduledPlanName ? (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-semibold">Cambio programado</p>
          <p className="mt-1">El plan cambiará a <strong>{summary.scheduledPlanName}</strong> en la próxima renovación.</p>
        </div>
      ) : null}
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
