import { Card } from "@/components/ui/card";
import type { OrganizationUsageMetric } from "@/types/billing";

export function OrganizationPlanLimitsPanel({ items }: { items: OrganizationUsageMetric[] }) {
  return (
    <Card>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Límites del plan</p>
      <h2 className="mt-1 text-lg font-semibold text-slate-900">Uso actual de la organización</h2>
      <div className="mt-4 space-y-4">
        {items.map((item) => (
          <div key={item.key} className="rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center justify-between gap-3 text-sm">
              <div>
                <p className="font-semibold text-slate-900">{item.label}</p>
                <p className="text-slate-500">{item.used} de {item.limit} {item.unit}</p>
              </div>
              <span className={badgeClass(item.tone)}>{item.percentage}%</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-slate-100">
              <div className={barClass(item.tone)} style={{ width: `${Math.min(item.percentage, 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function badgeClass(tone: OrganizationUsageMetric["tone"]) {
  return tone === "danger"
    ? "rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700"
    : tone === "warning"
      ? "rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700"
      : "rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700";
}

function barClass(tone: OrganizationUsageMetric["tone"]) {
  return tone === "danger" ? "h-2 rounded-full bg-rose-500" : tone === "warning" ? "h-2 rounded-full bg-amber-500" : "h-2 rounded-full bg-emerald-500";
}
