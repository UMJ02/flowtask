import { Card } from "@/components/ui/card";
import type { SupportReadinessSummary, SupportTicketSummary } from "@/types/support";

export function SupportReadinessPanel({ summary, tickets, organizationName }: { summary: SupportReadinessSummary; tickets: SupportTicketSummary[]; organizationName?: string | null }) {
  const readiness = Math.max(0, 100 - summary.open * 8 - summary.inProgress * 5 - summary.critical * 12 + Math.min(summary.resolvedLast30Days * 2, 12));

  return (
    <Card>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Support center</p>
          <h2 className="mt-1 text-xl font-bold text-slate-900">Mesa interna y salud de soporte</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">Centraliza incidencias de plataforma por organización para detectar presión operativa antes de que escale en producción.</p>
        </div>
        <div className="rounded-2xl bg-emerald-950 px-5 py-4 text-white">
          <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-200">Support readiness</p>
          <p className="mt-1 text-3xl font-bold">{readiness}%</p>
          <p className="mt-2 text-sm text-emerald-100">{organizationName ?? "Sin organización activa"}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="Abiertos" value={summary.open} hint="Casos esperando primer movimiento" />
        <Metric label="En progreso" value={summary.inProgress} hint="Casos con seguimiento activo" />
        <Metric label="Críticos" value={summary.critical} hint="Impacto alto o bloqueo" />
        <Metric label="Resueltos 30d" value={summary.resolvedLast30Days} hint="Capacidad de cierre reciente" />
      </div>

      <div className="mt-4 space-y-3">
        {tickets.length ? tickets.map((ticket) => (
          <div key={ticket.id} className="rounded-2xl border border-slate-200 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700">{ticket.status.replaceAll('_', ' ')}</span>
              <span className="rounded-full bg-rose-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-rose-700">{ticket.priority}</span>
              <span className="rounded-full bg-sky-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-700">{ticket.source}</span>
            </div>
            <p className="mt-3 font-semibold text-slate-900">{ticket.subject}</p>
            <p className="mt-1 text-sm text-slate-600">Solicitante: {ticket.requesterEmail}</p>
            <p className="mt-2 text-xs text-slate-500">Creado: {ticket.createdAtLabel}</p>
          </div>
        )) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">No hay casos de soporte registrados para la organización activa.</div>
        )}
      </div>
    </Card>
  );
}

function Metric({ label, value, hint }: { label: string; value: number; hint: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-sm text-slate-600">{hint}</p>
    </div>
  );
}
