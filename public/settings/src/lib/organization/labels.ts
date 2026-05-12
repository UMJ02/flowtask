import type { OrganizationRole } from "@/lib/security/organization-access";

export function formatOrganizationRole(role?: OrganizationRole | string | null) {
  switch (role) {
    case "admin_global":
      return "Owner · Admin";
    case "manager":
      return "Manager";
    case "member":
      return "Member";
    case "viewer":
      return "Viewer";
    default:
      return "Modo individual";
  }
}

export function describeOrganizationRole(role?: OrganizationRole | string | null) {
  switch (role) {
    case "admin_global":
      return "Cuida la configuración sensible y define el rumbo del equipo.";
    case "manager":
      return "Coordina el trabajo diario, los accesos operativos y el seguimiento.";
    case "member":
      return "Participa en la operación y avanza el trabajo del día a día.";
    case "viewer":
      return "Sigue lo que ocurre sin intervenir en la operación.";
    default:
      return "Todavía no tienes una organización activa seleccionada.";
  }
}
