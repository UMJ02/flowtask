import { Card } from "@/components/ui/card";
import type { AdminOrganizationSummary } from "@/types/admin";

export function AdminOrganizationsPanel({ items }: { items: AdminOrganizationSummary[] }) {
  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Organizaciones</p>
          <h2 className="mt-1 text-xl font-bold text-slate-900">Vista global de cuentas</h2>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{items.length} recientes</span>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-slate-500">
            <tr>
              <th className="pb-2 pr-4 font-medium">Organización</th>
              <th className="pb-2 pr-4 font-medium">Owner</th>
              <th className="pb-2 pr-4 font-medium">Miembros</th>
              <th className="pb-2 pr-4 font-medium">Clientes</th>
              <th className="pb-2 pr-4 font-medium">Plan</th>
              <th className="pb-2 pr-4 font-medium">Estado</th>
              <th className="pb-2 font-medium">Alta</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-slate-100 text-slate-700">
                <td className="py-3 pr-4">
                  <p className="font-semibold text-slate-900">{item.name}</p>
                  <p className="text-xs text-slate-500">/{item.slug}</p>
                </td>
                <td className="py-3 pr-4">{item.ownerEmail}</td>
                <td className="py-3 pr-4">{item.membersCount}</td>
                <td className="py-3 pr-4">{item.clientsCount}</td>
                <td className="py-3 pr-4">{item.planName}</td>
                <td className="py-3 pr-4 capitalize">{item.status.replaceAll("_", " ")}</td>
                <td className="py-3">{item.createdAtLabel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
