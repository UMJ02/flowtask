import { Card } from "@/components/ui/card";
import type { OrganizationInvoiceSummary } from "@/types/billing";

export function OrganizationUsagePanel({ invoices }: { invoices: OrganizationInvoiceSummary[] }) {
  return (
    <Card>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Facturación</p>
      <h2 className="mt-1 text-lg font-semibold text-slate-900">Últimas facturas</h2>
      <div className="mt-4 space-y-3">
        {invoices.length === 0 ? <p className="text-sm text-slate-500">No hay facturas registradas todavía.</p> : null}
        {invoices.map((invoice) => (
          <div key={invoice.id} className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-600">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">{invoice.amountLabel}</p>
                <p>{invoice.periodLabel}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{invoice.status}</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">Emitida: {invoice.issuedAtLabel}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
