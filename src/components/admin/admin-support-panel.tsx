import { Card } from "@/components/ui/card";
import type { AdminSupportTicketSummary } from "@/types/admin";

export function AdminSupportPanel({ items }: { items: AdminSupportTicketSummary[] }) {
  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Soporte interno</p>
          <h2 className="mt-1 text-xl font-bold text-slate-900">Casos recientes de plataforma</h2>
        </div>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">Mesa interna</span>
      </div>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700">{item.status.replaceAll("_", " ")}</span>
              <span className="rounded-full bg-rose-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-rose-700">{item.priority}</span>
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">{item.source}</span>
            </div>
            <p className="mt-3 font-semibold text-slate-900">{item.subject}</p>
            <p className="mt-1 text-sm text-slate-600">{item.organizationName} · {item.requesterEmail}</p>
            <p className="mt-2 text-xs text-slate-500">Creado: {item.createdAtLabel}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
