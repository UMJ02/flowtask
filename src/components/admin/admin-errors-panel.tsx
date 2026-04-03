import { AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import type { AdminErrorLogSummary } from '@/types/admin';

export function AdminErrorsPanel({ items }: { items: AdminErrorLogSummary[] }) {
  return (
    <Card className="rounded-[26px] border border-slate-200/80 bg-white/[0.96]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Errores recientes</p>
          <h2 className="mt-1 text-xl font-bold text-slate-900">Observabilidad de incidentes</h2>
        </div>
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
          <AlertTriangle className="h-5 w-5" />
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {items.length ? (
          items.map((item) => (
            <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge value={item.level} className={item.level === 'critical' ? 'bg-rose-100 text-rose-700 ring-rose-200' : undefined} />
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700">{item.source}</span>
                <span className="text-xs text-slate-500">{item.createdAtLabel}</span>
              </div>
              <p className="mt-3 text-sm font-semibold leading-6 text-slate-900">{item.message}</p>
              <p className="mt-2 text-xs text-slate-500">Ruta: {item.route}</p>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/70 p-4 text-sm text-emerald-700">
            No hay errores recientes registrados en la plataforma.
          </div>
        )}
      </div>
    </Card>
  );
}
