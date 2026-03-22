import { Building2, PencilLine, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { ClientPermissionSummary, OrganizationSummary } from "@/types/organization";

function formatRole(role?: string | null) {
  if (!role) return "Miembro";
  return role.replaceAll("_", " ").replace(/^./, (match) => match.toUpperCase());
}

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
  const stats = [
    { label: "Organizaciones", value: String(organizations.length), icon: Building2 },
    { label: "Clientes con edición", value: String(editable), icon: PencilLine },
    { label: "Rol activo", value: formatRole(activeOrganization?.role), icon: ShieldCheck },
  ];

  return (
    <Card className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Organización</p>
          <h2 className="mt-1 text-xl font-bold text-slate-900">{activeOrganization?.name ?? "Sin organización activa"}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Aquí puedes ver tu equipo, los clientes que manejan y el tipo de acceso que tienes, sin mezclar información personal.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 lg:max-w-[480px] lg:flex-1">
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-slate-500">
                  <Icon className="h-4 w-4" />
                  <p className="text-xs font-semibold uppercase tracking-[0.08em]">{item.label}</p>
                </div>
                <p className="mt-3 break-words text-xl font-bold text-slate-900">{item.value}</p>
              </div>
            );
          })}
        </div>
      </div>
      {clientPermissions.length ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {clientPermissions.slice(0, 3).map((permission) => (
            <div key={permission.clientName} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">{permission.clientName}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
                  {permission.canView ? "Puede ver" : "Sin acceso"}
                </span>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
                  {permission.canEdit ? "Puede editar" : "Solo lectura"}
                </span>
                {permission.canManageMembers ? (
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
                    Gestiona miembros
                  </span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          Cuando tengas clientes dentro de la organización, aquí verás un resumen rápido de sus permisos.
        </div>
      )}
    </Card>
  );
}
