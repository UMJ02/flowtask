import type { SupabaseClient } from "@supabase/supabase-js";

function normalizeNullableText(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export async function resolveProjectEntityContext(
  supabase: SupabaseClient,
  projectId?: string | null,
) {
  if (!projectId) return null;

  const { data, error } = await supabase
    .from("projects")
    .select("id,title,organization_id,client_id,client_name")
    .eq("id", projectId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data
    ? {
        id: data.id as string,
        title: data.title as string,
        organizationId: (data.organization_id as string | null | undefined) ?? null,
        clientId: (data.client_id as string | null | undefined) ?? null,
        clientName: normalizeNullableText(data.client_name as string | null | undefined),
      }
    : null;
}

export function validateTaskProjectClientIntegrity(input: {
  selectedProject: Awaited<ReturnType<typeof resolveProjectEntityContext>>;
  selectedClientId?: string | null;
  selectedClientName?: string | null;
  activeOrganizationId?: string | null;
}) {
  const selectedClientName = normalizeNullableText(input.selectedClientName);
  const project = input.selectedProject;

  if (!project) {
    return {
      ok: true,
      resolvedClientId: input.selectedClientId ?? null,
      resolvedClientName: selectedClientName,
      message: null as string | null,
    };
  }

  if (input.activeOrganizationId && project.organizationId && input.activeOrganizationId !== project.organizationId) {
    return {
      ok: false,
      resolvedClientId: null,
      resolvedClientName: null,
      message: "El proyecto seleccionado no pertenece a tu organización activa.",
    };
  }

  if (project.clientId && input.selectedClientId && project.clientId !== input.selectedClientId) {
    return {
      ok: false,
      resolvedClientId: null,
      resolvedClientName: null,
      message: "La tarea no puede apuntar a un cliente distinto al del proyecto seleccionado.",
    };
  }

  if (project.clientName && selectedClientName && project.clientName !== selectedClientName) {
    return {
      ok: false,
      resolvedClientId: null,
      resolvedClientName: null,
      message: "El nombre del cliente debe coincidir con el cliente del proyecto seleccionado.",
    };
  }

  return {
    ok: true,
    resolvedClientId: project.clientId ?? input.selectedClientId ?? null,
    resolvedClientName: project.clientName ?? selectedClientName,
    message: null as string | null,
  };
}
