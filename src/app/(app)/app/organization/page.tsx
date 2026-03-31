export const dynamic = 'force-dynamic';

import { OrganizationMetricsPanel } from '@/components/organization/organization-metrics-panel';
import { OrganizationMembersPanel } from '@/components/organization/organization-members-panel';
import { OrganizationRolesPanel } from '@/components/organization/organization-roles-panel';
import { ClientPermissionsPanel } from '@/components/organization/client-permissions-panel';
import { OrganizationInviteForm } from '@/components/organization/organization-invite-form';
import { OrganizationInvitesPanel } from '@/components/organization/organization-invites-panel';
import { safeServerCall } from '@/lib/runtime/safe-server';
import { getOrganizationContext, getOrganizationInvites, getOrganizationMetrics, getOrganizationRolesAndPermissions } from '@/lib/queries/organization';

export default async function OrganizationPage() {
  const context = await safeServerCall('getOrganizationContext', () => getOrganizationContext(), null);
  const activeId = context?.activeOrganization?.id ?? null;
  const canManage = Boolean(context?.access?.canManageInvites);
  const [metrics, invites, roles] = await Promise.all([
    safeServerCall('getOrganizationMetrics', () => getOrganizationMetrics(activeId), null),
    safeServerCall('getOrganizationInvites', () => getOrganizationInvites(activeId, canManage), []),
    safeServerCall('getOrganizationRolesAndPermissions', () => getOrganizationRolesAndPermissions(activeId, Boolean(context?.access?.canManageRoles)), { roleTemplates: [], permissionDefinitions: [], membersByRole: [] }),
  ]);

  return (
    <div className="space-y-4">
      <OrganizationMetricsPanel metrics={metrics} />
      <OrganizationMembersPanel organizations={context?.organizations ?? []} />
      <OrganizationRolesPanel roles={roles.roleTemplates} permissions={roles.permissionDefinitions} canManageRoles={Boolean(context?.access?.canManageRoles)} />
      <ClientPermissionsPanel items={context?.clientPermissions ?? []} canManage={Boolean(context?.access?.canManageClientPermissions)} />
      {activeId && canManage ? <OrganizationInviteForm organizationId={activeId} canInviteManagers={Boolean(context?.access?.canManageRoles)} /> : null}
      <OrganizationInvitesPanel organizationId={activeId} invites={invites} canManageInvites={canManage} canInviteManagers={Boolean(context?.access?.canManageRoles)} />
    </div>
  );
}
