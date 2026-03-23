import { Card } from "@/components/ui/card";
import type { OrganizationSummary } from "@/types/organization";

export function OrganizationMembersPanel({ organizations }: { organizations: OrganizationSummary[] }) {
  return (
    <Card>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Roles avanzados</p>
      <h2 className="mt-1 text-lg font-semibold text-slate-900">Admin global, manager, member, viewer</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {organizations.map((organization) => (
          <div key={organization.id} className="rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">{organization.name}</p>
                <p className="text-sm text-slate-500">/{organization.slug}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{organization.role}</span>
            </div>
            <p className="mt-3 text-sm text-slate-600">
              {organization.role === "admin_global" ? "Puede gobernar configuración, miembros y reportes de toda la organización." : organization.role === "manager" ? "Puede coordinar proyectos y clientes dentro de su organización." : organization.role === "viewer" ? "Acceso de solo lectura para seguimiento y jefatura." : "Participa y actualiza trabajo operativo."}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
