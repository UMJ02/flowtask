import { Card } from "@/components/ui/card";
import { ClientPermissionsPanel } from "@/components/organization/client-permissions-panel";
import { OrganizationInvitesPanel } from "@/components/organization/organization-invites-panel";
import { OrganizationMembersPanel } from "@/components/organization/organization-members-panel";
import { OrganizationMetricsPanel } from "@/components/organization/organization-metrics-panel";
import { OrganizationRolesPanel } from "@/components/organization/organization-roles-panel";
import { getOrganizationContext, getOrganizationInvites, getOrganizationMetrics, getOrganizationRolesAndPermissions } from "@/lib/queries/organization";

export default async function OrganizationPage() {
  const context = await getOrganizationContext();
  const activeOrganizationId = context?.activeOrganization?.id ?? null;
  const [invites, metrics, rolesData] = await Promise.all([
    getOrganizationInvites(activeOrganizationId),
    getOrganizationMetrics(activeOrganizationId),
    getOrganizationRolesAndPermissions(activeOrganizationId),
  ]);

  return (
    <div className="space-y-4">
      <Card>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Organización activa</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">{context?.activeOrganization?.name ?? "Sin organización activa"}</h1>
        <p className="mt-2 text-sm text-slate-600">Esta vista concentra la operación multi-empresa: equipos, permisos por cliente y roles avanzados por organización.</p>
      </Card>

      <OrganizationMetricsPanel metrics={metrics} />
      <OrganizationRolesPanel roles={rolesData.roleTemplates} permissions={rolesData.permissionDefinitions} />
      <OrganizationMembersPanel organizations={context?.organizations ?? []} />
      <OrganizationInvitesPanel organizationId={activeOrganizationId} invites={invites} />
      <ClientPermissionsPanel items={context?.clientPermissions ?? []} />
    </div>
  );
}
