import { Card } from "@/components/ui/card";
import { ClientPermissionsPanel } from "@/components/organization/client-permissions-panel";
import { OrganizationInvitesPanel } from "@/components/organization/organization-invites-panel";
import { OrganizationMembersPanel } from "@/components/organization/organization-members-panel";
import { OrganizationMetricsPanel } from "@/components/organization/organization-metrics-panel";
import { OrganizationRolesPanel } from "@/components/organization/organization-roles-panel";
import { OrganizationBillingSummary } from "@/components/organization/organization-billing-summary";
import { getOrganizationBillingSummary } from "@/lib/queries/billing";
import { getOrganizationContext, getOrganizationInvites, getOrganizationMetrics, getOrganizationRolesAndPermissions } from "@/lib/queries/organization";

export default async function OrganizationPage() {
  const context = await getOrganizationContext();
  const activeOrganizationId = context?.activeOrganization?.id ?? null;
  const [invites, metrics, rolesData, billingSummary] = await Promise.all([
    getOrganizationInvites(activeOrganizationId, context?.access.canManageInvites ?? false),
    getOrganizationMetrics(activeOrganizationId),
    getOrganizationRolesAndPermissions(activeOrganizationId, context?.access.canManageRoles ?? false),
    getOrganizationBillingSummary(activeOrganizationId),
  ]);

  return (
    <div className="space-y-4">
      <Card>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Organización activa</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">{context?.activeOrganization?.name ?? "Sin organización activa"}</h1>
        <p className="mt-2 text-sm text-slate-600">Esta vista concentra la operación multi-empresa: equipos, clientes, permisos por cliente y roles avanzados por organización.</p>
        <div className="mt-4 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700">
          Rol activo: {context?.access.role ?? "sin rol"}
        </div>
      </Card>

      <OrganizationMetricsPanel metrics={metrics} />
      <OrganizationBillingSummary summary={billingSummary} />
      <OrganizationRolesPanel roles={rolesData.roleTemplates} permissions={rolesData.permissionDefinitions} canManageRoles={context?.access.canManageRoles ?? false} />
      <OrganizationMembersPanel organizations={context?.organizations ?? []} />
      <OrganizationInvitesPanel organizationId={activeOrganizationId} invites={invites} canManageInvites={context?.access.canManageInvites ?? false} canInviteManagers={context?.access.role === "admin_global"} />
      <ClientPermissionsPanel items={context?.clientPermissions ?? []} canManage={context?.access.canManageClientPermissions ?? false} />
    </div>
  );
}
