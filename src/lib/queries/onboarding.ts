import { getNotificationPreferences } from "@/lib/queries/notification-preferences";
import { getOrganizationContext, getOrganizationMetrics, getOrganizationRolesAndPermissions } from "@/lib/queries/organization";
import { getCurrentProfile } from "@/lib/queries/profile";
import { getWorkspaceContext, applyWorkspaceScope } from "@/lib/queries/workspace";
import { formatOrganizationRole } from "@/lib/organization/labels";

export type OnboardingStep = {
  id: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  done: boolean;
  category: "foundation" | "operation" | "automation";
};

export type WorkspaceOnboardingSummary = {
  score: number;
  completed: number;
  total: number;
  role: string;
  organizationName: string;
  workspaceMode: "personal" | "organization";
  recommendations: string[];
  quickStats: {
    members: number;
    clients: number;
    activeProjects: number;
    openTasks: number;
  };
  demoData: {
    eligible: boolean;
    mode: "personal" | "organization";
    title: string;
    description: string;
    safetyNote: string;
  };
  steps: OnboardingStep[];
};

export async function getWorkspaceOnboardingSummary(): Promise<WorkspaceOnboardingSummary | null> {
  const [profile, organizationContext, preferences, workspace] = await Promise.all([
    getCurrentProfile(),
    getOrganizationContext(),
    getNotificationPreferences(),
    getWorkspaceContext(),
  ]);

  if (!workspace.user) return null;

  const organizationId = organizationContext?.activeOrganization?.id ?? null;
  const role = organizationContext?.activeOrganization?.role ?? null;
  const organizationName = organizationContext?.activeOrganization?.name ?? "Espacio personal";
  const workspaceMode = organizationId ? "organization" : "personal";

  const [organizationMetrics, rolesData, projectsRes, tasksRes] = await Promise.all([
    getOrganizationMetrics(organizationId),
    getOrganizationRolesAndPermissions(organizationId, role === "admin_global" || role === "manager"),
    applyWorkspaceScope(
      workspace.supabase.from("projects").select("id", { count: "exact", head: true }),
      workspace.user.id,
      workspace.activeOrganizationId,
    ),
    applyWorkspaceScope(
      workspace.supabase.from("tasks").select("id", { count: "exact", head: true }),
      workspace.user.id,
      workspace.activeOrganizationId,
    ),
  ]);

  const members = organizationMetrics?.members ?? (organizationId ? 1 : 0);
  const clients = organizationMetrics?.clients ?? 0;
  const activeProjects = organizationMetrics?.activeProjects ?? projectsRes.count ?? 0;
  const openTasks = organizationMetrics?.openTasks ?? tasksRes.count ?? 0;
  const hasOrganization = Boolean(organizationId);
  const hasProfile = Boolean(profile?.fullName?.trim() && profile?.email?.trim());
  const hasClientPermissions = (organizationContext?.clientPermissions?.length ?? 0) > 0;
  const hasClients = clients > 0;
  const hasProjects = activeProjects > 0 || (projectsRes.count ?? 0) > 0;
  const hasTasks = openTasks > 0 || (tasksRes.count ?? 0) > 0;
  const hasTeam = members > 1;
  const hasRoles = (rolesData.roleTemplates?.length ?? 0) > 0;
  const automationEnabled = Boolean(
    preferences && (preferences.enable_toasts || preferences.enable_email || preferences.enable_whatsapp || preferences.delivery_frequency === "daily"),
  );

  const personalSteps: OnboardingStep[] = [
    { id: "profile", title: "Completa tu perfil individual", description: "Tu cuenta individual es la identidad principal de Flowtask. Nombre y correo correctos ayudan con asignaciones, comentarios y avisos.", href: "/app/settings", cta: "Ir a configuración", done: hasProfile, category: "foundation" },
    { id: "personal-workspace", title: "Espacio personal activo", description: "Flowtask siempre puede funcionar como cuenta personal. Las organizaciones son espacios adicionales creados por un usuario individual.", href: "/app/tasks/new", cta: "Crear primera tarea", done: true, category: "foundation" },
    { id: "personal-projects", title: "Crea tu primer proyecto personal", description: "Un proyecto personal permite agrupar tareas sin depender de una organización.", href: "/app/projects/new", cta: "Nuevo proyecto", done: hasProjects, category: "operation" },
    { id: "personal-tasks", title: "Registra tus primeras tareas", description: "Las tareas personales alimentan dashboard, kanban, vencimientos y radar operativo.", href: "/app/tasks/new", cta: "Nueva tarea", done: hasTasks, category: "operation" },
    { id: "personal-automation", title: "Activa recordatorios personales", description: "Configura toasts, correo, WhatsApp o digest diario para empezar a automatizar seguimiento.", href: "/app/settings", cta: "Configurar avisos", done: automationEnabled, category: "automation" },
  ];

  const organizationSteps: OnboardingStep[] = [
    { id: "profile", title: "Confirma tu perfil de administrador", description: "La organización fue creada por un usuario individual. Ese usuario opera como owner/admin, no como una cuenta de organización separada.", href: "/app/settings", cta: "Ir a configuración", done: hasProfile, category: "foundation" },
    { id: "organization-workspace", title: "Configura la organización seleccionada", description: "Este workspace está activo porque fue seleccionado explícitamente desde el selector de workspace.", href: "/app/organization", cta: "Revisar organización", done: hasOrganization, category: "foundation" },
    { id: "organization-team", title: "Invita o valida tu equipo", description: "Agrega miembros cuando el plan lo permita y mantené roles claros antes de crecer la operación.", href: "/app/organization", cta: "Ver miembros", done: hasTeam, category: "foundation" },
    { id: "organization-clients", title: "Carga clientes de la organización", description: "Los clientes organizacionales habilitan permisos, seguimiento compartido y reportes más claros.", href: "/app/clients", cta: "Abrir clientes", done: hasClients, category: "operation" },
    { id: "organization-projects", title: "Levanta un proyecto compartido", description: "Crea el proyecto inicial de la organización para que el equipo tenga un centro operativo común.", href: "/app/projects/new", cta: "Nuevo proyecto", done: hasProjects, category: "operation" },
    { id: "organization-tasks", title: "Registra tareas del equipo", description: "Sin tareas, el workspace organizacional no puede mostrar carga diaria, prioridades ni vencimientos.", href: "/app/tasks/new", cta: "Nueva tarea", done: hasTasks, category: "operation" },
    { id: "organization-roles", title: "Ordena roles y permisos", description: "Deja roles y acceso por cliente bien resueltos antes de invitar más personas.", href: "/app/organization/roles", cta: "Ver permisos", done: hasRoles || hasClientPermissions, category: "foundation" },
    { id: "organization-automation", title: "Activa automatizaciones del workspace", description: "Habilita canales o digest para que el seguimiento no dependa solo de revisar la app.", href: "/app/settings", cta: "Configurar avisos", done: automationEnabled, category: "automation" },
  ];

  const steps: OnboardingStep[] = hasOrganization ? organizationSteps : personalSteps;
  const completed = steps.filter((step) => step.done).length;
  const total = steps.length;
  const score = total ? Math.round((completed / total) * 100) : 0;
  const demoEligible = !hasProjects && !hasTasks;

  const recommendations = [
    !hasClients && hasOrganization ? "Carga por lo menos un cliente para que la capa operativa tenga un punto real de trabajo." : null,
    !hasProjects ? "Crea un proyecto inicial para habilitar seguimiento, watchlist y reportes con señal útil." : null,
    !hasTasks ? "Registra tareas activas para que dashboard, kanban y vencimientos muestren prioridad real." : null,
    !automationEnabled ? "Configura al menos un canal o rutina de notificaciones para empezar a automatizar seguimiento." : null,
  ].filter(Boolean) as string[];

  return {
    score,
    completed,
    total,
    role: hasOrganization ? formatOrganizationRole(role) : "Personal",
    organizationName,
    workspaceMode,
    recommendations,
    quickStats: {
      members,
      clients,
      activeProjects,
      openTasks,
    },
    demoData: {
      eligible: demoEligible,
      mode: workspaceMode,
      title: demoEligible ? "Cargar datos de ejemplo" : "Datos reales protegidos",
      description: demoEligible
        ? hasOrganization
          ? "Crea 1 cliente demo, 1 proyecto y 3 tareas para que la organización no arranque vacía."
          : "Crea 1 proyecto personal y 3 tareas demo para probar Flowtask sin partir desde cero."
        : "Este workspace ya tiene proyectos o tareas. Flowtask no insertará ejemplos automáticamente para no mezclar información real.",
      safetyNote: "Solo se ejecuta cuando proyectos = 0 y tareas = 0 en el workspace activo.",
    },
    steps,
  };
}
