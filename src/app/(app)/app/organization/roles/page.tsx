import { Card } from "@/components/ui/card";
import { OrganizationRolesPanel } from "@/components/organization/organization-roles-panel";
import { getOrganizationContext, getOrganizationRolesAndPermissions } from "@/lib/queries/organization";

export default async function OrganizationRolesPage() {
  const context = await getOrganizationContext();
  const activeOrganizationId = context?.activeOrganization?.id ?? null;
  const canManageRoles = context?.access.canManageRoles ?? false;
  const { roleTemplates, permissionDefinitions, membersByRole } = await getOrganizationRolesAndPermissions(activeOrganizationId, canManageRoles);

  return (
    <div className="space-y-4">
      <Card>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Gestión de roles</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Roles dinámicos y permisos por acción</h1>
        <p className="mt-2 text-sm text-slate-600">Configura qué puede hacer cada persona en tareas, clientes, equipo, proyectos y reportes dentro de la organización activa.</p>
      </Card>

      {!canManageRoles ? (
        <Card>
          <p className="text-sm text-slate-600">Solo los roles <span className="font-semibold text-slate-900">admin_global</span> y <span className="font-semibold text-slate-900">manager</span> pueden consultar la matriz completa de permisos.</p>
        </Card>
      ) : (
        <>
          <OrganizationRolesPanel roles={roleTemplates} permissions={permissionDefinitions} canManageRoles />

          <Card>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Cobertura actual</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">Miembros por rol</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-4">
              {membersByRole.map((item) => (
                <div key={item.role} className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-sm text-slate-500">{item.role}</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">{item.count}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Matriz de permisos</p>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-slate-500">
                  <tr>
                    <th className="pb-2 pr-4 font-medium">Permiso</th>
                    <th className="pb-2 pr-4 font-medium">Categoría</th>
                    <th className="pb-2 pr-4 font-medium">Descripción</th>
                  </tr>
                </thead>
                <tbody>
                  {permissionDefinitions.map((permission) => (
                    <tr key={permission.key} className="border-t border-slate-100 align-top">
                      <td className="py-3 pr-4 font-medium text-slate-900">{permission.label}</td>
                      <td className="py-3 pr-4 text-slate-600">{permission.category}</td>
                      <td className="py-3 pr-4 text-slate-600">{permission.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
