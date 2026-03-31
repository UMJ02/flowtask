import { OrganizationRolesPanel } from '@/components/organization/organization-roles-panel';
import { getOrganizationContext, getOrganizationRolesAndPermissions } from '@/lib/queries/organization';
import { safeServerCall } from '@/lib/runtime/safe-server';

export default async function OrganizationRolesPage() {
  const context = await safeServerCall('getOrganizationContext', () => getOrganizationContext(), null);
  const roles = await safeServerCall(
    'getOrganizationRolesAndPermissions',
    () => getOrganizationRolesAndPermissions(context?.activeOrganization?.id ?? null, Boolean(context?.access?.canManageRoles)),
    { roleTemplates: [], permissionDefinitions: [], membersByRole: [] },
  );

  return <OrganizationRolesPanel roles={roles.roleTemplates} permissions={roles.permissionDefinitions} canManageRoles={Boolean(context?.access?.canManageRoles)} />;
}
