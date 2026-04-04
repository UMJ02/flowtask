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
      return "Sin organización activa";
  }
}

export function describeOrganizationRole(role?: OrganizationRole | string | null) {
  switch (role) {
    case "admin_global":
      return "Control total del workspace, sus miembros y la configuración crítica.";
    case "manager":
      return "Coordina clientes, proyectos, tareas e invitaciones operativas.";
    case "member":
      return "Trabaja dentro del workspace y ejecuta la operación diaria.";
    case "viewer":
      return "Acceso de lectura para seguimiento y validación.";
    default:
      return "Aún no tienes una organización activa asignada.";
  }
}
