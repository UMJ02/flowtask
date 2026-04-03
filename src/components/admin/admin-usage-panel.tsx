import { BarChart3 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { AdminUsageInsightSummary } from '@/types/admin';

export function AdminUsagePanel({ insights }: { insights: AdminUsageInsightSummary }) {
  return (
    <Card className="rounded-[26px] border border-slate-200/80 bg-white/[0.96]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Uso de plataforma</p>
          <h2 className="mt-1 text-xl font-bold text-slate-900">Actividad real y eventos dominantes</h2>
        </div>
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          <BarChart3 className="h-5 w-5" />
        </span>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border border-slate-200 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Top eventos</p>
          <div className="mt-3 space-y-3">
            {insights.topEvents.length ? (
              insights.topEvents.map((item) => (
                <div key={item.eventName} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-2.5">
                  <p className="text-sm font-medium text-slate-700">{item.eventName}</p>
                  <span className="rounded-full bg-slate-950 px-2.5 py-1 text-xs font-semibold text-white">{item.count}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">Todavía no hay eventos suficientes para ranking.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Actividad reciente</p>
          <div className="mt-3 space-y-3">
            {insights.recentEvents.length ? (
              insights.recentEvents.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-100 p-3.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">{item.eventName}</span>
                    <span className="text-xs text-slate-500">{item.createdAtLabel}</span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{item.actorLabel}</p>
                  <p className="mt-1 text-sm text-slate-600">{item.organizationName}</p>
                  <p className="mt-2 text-xs text-slate-500">Ruta: {item.route}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No hay actividad reciente registrada.</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
