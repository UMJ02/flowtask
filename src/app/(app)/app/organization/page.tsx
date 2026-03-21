import { Card } from "@/components/ui/card";
import { ClientPermissionsPanel } from "@/components/organization/client-permissions-panel";
import { OrganizationMembersPanel } from "@/components/organization/organization-members-panel";
import { getOrganizationContext } from "@/lib/queries/organization";

export default async function OrganizationPage() {
  const context = await getOrganizationContext();

  return (
    <div className="space-y-4">
      <Card>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Organización activa</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">{context?.activeOrganization?.name ?? "Sin organización activa"}</h1>
        <p className="mt-2 text-sm text-slate-600">Esta vista concentra la operación multi-empresa: equipos, permisos por cliente y roles avanzados por organización.</p>
      </Card>

      <OrganizationMembersPanel organizations={context?.organizations ?? []} />
      <ClientPermissionsPanel items={context?.clientPermissions ?? []} />
    </div>
  );
}
