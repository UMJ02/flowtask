import { Card } from "@/components/ui/card";
import type { ClientPermissionSummary } from "@/types/organization";

export function ClientPermissionsPanel({ items }: { items: ClientPermissionSummary[] }) {
  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Permisos por cliente</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">Acceso fino para jefatura y managers</h2>
        </div>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left text-slate-500">
            <tr>
              <th className="pb-2 pr-4 font-medium">Cliente</th>
              <th className="pb-2 pr-4 font-medium">Ver</th>
              <th className="pb-2 pr-4 font-medium">Editar</th>
              <th className="pb-2 pr-4 font-medium">Miembros</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.clientName} className="border-t border-slate-100">
                <td className="py-3 pr-4 font-medium text-slate-900">{item.clientName}</td>
                <td className="py-3 pr-4 text-slate-600">{item.canView ? "Sí" : "No"}</td>
                <td className="py-3 pr-4 text-slate-600">{item.canEdit ? "Sí" : "No"}</td>
                <td className="py-3 pr-4 text-slate-600">{item.canManageMembers ? "Sí" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
