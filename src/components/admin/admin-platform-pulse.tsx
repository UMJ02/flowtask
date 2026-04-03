import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import type { AdminMetricSummary, AdminPlatformPulse } from '@/types/admin';

export function AdminPlatformPulseCard({
  pulse,
  metrics,
}: {
  pulse: AdminPlatformPulse;
  metrics: AdminMetricSummary;
}) {
  return (
    <Card className="rounded-[28px] border border-slate-900/90 bg-slate-950 text-white shadow-[0_18px_48px_rgba(15,23,42,0.22)]">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-300">Platform readiness</p>
          <div className="mt-3 flex items-end gap-3">
            <p className="text-4xl font-bold md:text-5xl">{pulse.readinessScore}%</p>
            <StatusBadge value={pulse.queueHealthLabel} className="bg-white/10 text-white ring-white/15" />
          </div>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
            Vista operacional consolidada para tomar decisiones rápidas sobre cuentas, soporte, observabilidad y uso real de la plataforma.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 md:w-[420px] md:grid-cols-1 xl:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Cola</p>
            <p className="mt-2 text-sm font-semibold text-white">{pulse.queueHealthLabel}</p>
            <p className="mt-2 text-xs text-slate-400">{metrics.openSupportTickets} tickets abiertos o en proceso.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Uso</p>
            <p className="mt-2 text-sm font-semibold text-white">{pulse.eventsTrendLabel}</p>
            <p className="mt-2 text-xs text-slate-400">{metrics.usageEvents7d} eventos registrados en 7 días.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Riesgo</p>
            <p className="mt-2 text-sm font-semibold text-white">{pulse.riskLabel}</p>
            <p className="mt-2 text-xs text-slate-400">{metrics.criticalErrors7d} incidentes críticos recientes.</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
