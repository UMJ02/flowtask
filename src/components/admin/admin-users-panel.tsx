import { Card } from "@/components/ui/card";
import type { AdminUserSummary } from "@/types/admin";

export function AdminUsersPanel({ items }: { items: AdminUserSummary[] }) {
  return (
    <Card>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Usuarios</p>
      <h2 className="mt-1 text-xl font-bold text-slate-900">Actividad y cobertura por persona</h2>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">{item.fullName}</p>
                <p className="text-sm text-slate-600">{item.email}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-700">{item.defaultRole.replaceAll("_", " ")}</span>
            </div>
            <p className="mt-3 text-sm text-slate-600">Participa en <span className="font-semibold text-slate-900">{item.organizationsCount}</span> organización(es).</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
