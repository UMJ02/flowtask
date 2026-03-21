import { Card } from "@/components/ui/card";
import type { ClientPermissionSummary, OrganizationSummary } from "@/types/organization";

export function OrganizationOverview({
  activeOrganization,
  organizations,
  clientPermissions,
}: {
  activeOrganization?: OrganizationSummary | null;
  organizations: OrganizationSummary[];
  clientPermissions: ClientPermissionSummary[];
}) {
  const editable = clientPermissions.filter((item) => item.canEdit).length;

  return (
    <Card>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Multi-empresa</p>
          <h2 className="mt-1 text-xl font-bold text-slate-900">{activeOrganization?.name ?? "Sin organización activa"}</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">Administra equipos, proyectos y clientes por organización sin mezclar tableros personales. Esta base ya soporta organizaciones, roles avanzados y permisos por cliente.</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <Stat label="Organizaciones" value={String(organizations.length)} />
          <Stat label="Clientes editables" value={String(editable)} />
          <Stat label="Rol activo" value={activeOrganization?.role ?? "member"} />
        </div>
      </div>
      {clientPermissions.length ? (
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {clientPermissions.slice(0, 4).map((permission) => (
            <div key={permission.clientName} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-sm font-semibold text-slate-900">{permission.clientName}</p>
              <p className="mt-2 text-xs text-slate-500">
                {permission.canView ? "Ver" : "Sin acceso"} · {permission.canEdit ? "Editar" : "Solo lectura"} · {permission.canManageMembers ? "Gestiona miembros" : "Sin miembros"}
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-900 px-4 py-3 text-white">
      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  );
}
