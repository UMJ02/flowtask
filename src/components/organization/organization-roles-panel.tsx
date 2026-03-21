import { Card } from "@/components/ui/card";
import type { OrganizationRoleTemplateSummary, PermissionDefinitionSummary } from "@/types/organization";

function chunkPermissions(keys: string[], defs: PermissionDefinitionSummary[]) {
  const map = new Map(defs.map((item) => [item.key, item]));
  return keys.map((key) => map.get(key)?.label ?? key);
}

export function OrganizationRolesPanel({
  roles,
  permissions,
}: {
  roles: OrganizationRoleTemplateSummary[];
  permissions: PermissionDefinitionSummary[];
}) {
  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Roles editables</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">Permisos granulares por organización</h2>
        </div>
        <a href="/app/organization/roles" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
          Gestionar roles
        </a>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {roles.map((role) => (
          <div key={role.id} className="rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">{role.name}</p>
                <p className="text-sm text-slate-500">{role.description || "Sin descripción"}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{role.memberCount} miembros</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {chunkPermissions(role.permissions, permissions).slice(0, 5).map((label) => (
                <span key={label} className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700">{label}</span>
              ))}
              {role.permissions.length > 5 ? <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">+{role.permissions.length - 5} más</span> : null}
            </div>
            <p className="mt-4 text-xs text-slate-500">{role.isSystem ? "Rol del sistema" : "Rol personalizado"}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
