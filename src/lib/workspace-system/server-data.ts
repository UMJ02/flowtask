import { getWorkspaceContext } from "@/lib/queries/workspace";

export async function getWorkspaceIdentity() {
  const { supabase, user, activeOrganizationId } = await getWorkspaceContext();

  if (!user) {
    return {
      userId: null,
      organizationId: null,
      mode: "personal" as const,
      workspaceId: "guest-workspace",
      workspaceName: "FlowTask Workspace",
    };
  }

  if (!activeOrganizationId) {
    return {
      userId: user.id,
      organizationId: null,
      mode: "personal" as const,
      workspaceId: `personal:${user.id}`,
      workspaceName: "Mi workspace",
    };
  }

  const { data } = await supabase
    .from("organizations")
    .select("id,name,slug")
    .eq("id", activeOrganizationId)
    .is("deleted_at", null)
    .maybeSingle();

  return {
    userId: user.id,
    organizationId: activeOrganizationId,
    mode: "organization" as const,
    workspaceId: `organization:${activeOrganizationId}`,
    workspaceName: data?.name ?? "Organización activa",
  };
}
