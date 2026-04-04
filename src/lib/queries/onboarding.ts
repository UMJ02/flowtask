import { getNotificationPreferences } from "@/lib/queries/notification-preferences";
import { getOrganizationContext, getOrganizationMetrics, getOrganizationRolesAndPermissions } from "@/lib/queries/organization";
import { getCurrentProfile } from "@/lib/queries/profile";
import { getAccountAccessSummary, type AccountAccessSummary } from "@/lib/queries/account-access";
import { getWorkspaceContext, applyWorkspaceScope } from "@/lib/queries/workspace";

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
  access: AccountAccessSummary;
  score: number;
  completed: number;
  total: number;
  role: string;
  organizationName: string;
  recommendations: string[];
  quickStats: {
    members: number;
    clients: number;
    activeProjects: number;
    openTasks: number;
  };
  steps: OnboardingStep[];
};

export async function getWorkspaceOnboardingSummary(): Promise<WorkspaceOnboardingSummary | null> {
  const [profile, organizationContext, preferences, workspace, access] = await Promise.all([
    getCurrentProfile(),
    getOrganizationContext(),
    getNotificationPreferences(),
    getWorkspaceContext(),
    getAccountAccessSummary(),
  ]);

  if (!workspace.user) return null;

  const organizationId = organizationContext?.activeOrganization?.id ?? null;
  const role = organizationContext?.activeOrganization?.role ?? "member";
  const organizationName = organizationContext?.activeOrganization?.name ?? "Sin organización";

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

  const members = organizationMetrics?.members ?? 0;
  const clients = organizationMetrics?.clients ?? 0;
  const activeProjects = organizationMetrics?.activeProjects ?? projectsRes.count ?? 0;
  const openTasks = organizationMetrics?.openTasks ?? tasksRes.count ?? 0;
  const hasOrganization = Boolean(organizationId);
  const isIndividual = access.currentMode === 'individual';
  const isTeam = access.currentMode === 'team_owner' || access.currentMode === 'team_member';
  const hasAccountMode = Boolean(access.currentMode);
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

  const steps: OnboardingStep[] = [
    {
      id: "profile",
      title: "Completa tu perfil",
      description: "Asegura nombre visible y correo correcto para asignaciones, comentarios y notificaciones.",
      href: "/app/profile",
      cta: "Completar perfil",
      done: hasProfile,
      category: "foundation",
    },
    {
      id: "account",
      title: "Define cómo usarás FlowTask",
      description: "Elige si trabajarás en modo individual o si vas a activar un workspace de equipo con plan o código.",
      href: "/app/onboarding",
      cta: "Configurar acceso",
      done: hasAccountMode,
      category: "foundation",
    },
    {
      id: "organization",
      title: "Prepara tu workspace",
      description: "Si usarás FlowTask con equipo, crea o valida la organización activa antes de seguir con miembros y clientes.",
      href: "/app/organization",
      cta: "Revisar organización",
      done: isIndividual ? true : hasOrganization,
      category: "foundation",
    },
    {
      id: "clients",
      title: "Carga tu primer cliente",
      description: "Agrega al menos un cliente para empezar a vincular proyectos, permisos y actividad.",
      href: "/app/clients",
      cta: "Abrir clientes",
      done: isIndividual ? hasClients || hasProjects || hasTasks : hasClients,
      category: "operation",
    },
    {
      id: "projects",
      title: "Levanta un proyecto base",
      description: "Crea el proyecto inicial del workspace para que reportes y seguimiento empiecen a tener señal real.",
      href: "/app/projects/new",
      cta: "Nuevo proyecto",
      done: hasProjects,
      category: "operation",
    },
    {
      id: "tasks",
      title: "Registra tareas operativas",
      description: "Sin tareas, el dashboard y el kanban no muestran la carga diaria ni prioridades.",
      href: "/app/tasks/new",
      cta: "Nueva tarea",
      done: hasTasks,
      category: "operation",
    },
    {
      id: "roles",
      title: "Ordena equipo y permisos",
      description: "Deja roles y acceso por cliente bien resueltos antes de crecer el workspace.",
      href: "/app/organization/roles",
      cta: "Ver permisos",
      done: isIndividual ? true : hasTeam && (hasRoles || hasClientPermissions),
      category: "foundation",
    },
    {
      id: "automation",
      title: "Activa automatizaciones básicas",
      description: "Habilita toasts, correo, WhatsApp o digest diario para empezar a sacar trabajo fuera de la app.",
      href: "/app/settings",
      cta: "Configurar avisos",
      done: automationEnabled,
      category: "automation",
    },
  ];

  const completed = steps.filter((step) => step.done).length;
  const total = steps.length;
  const score = total ? Math.round((completed / total) * 100) : 0;

  const recommendations = [
    !hasAccountMode ? "Define primero si vas a usar FlowTask de forma individual o como workspace de equipo." : null,
    isTeam && !hasOrganization ? "Crea o activa una organización para que el workspace tenga un contexto correcto antes de invitar miembros." : null,
    !hasClients ? "Carga por lo menos un cliente para que la capa operativa tenga un punto real de trabajo." : null,
    !hasProjects ? "Crea un proyecto inicial para habilitar seguimiento, watchlist y reportes con señal útil." : null,
    !hasTasks ? "Registra tareas activas para que dashboard, kanban y vencimientos muestren prioridad real." : null,
    !automationEnabled ? "Configura al menos un canal o rutina de notificaciones para empezar a automatizar seguimiento." : null,
  ].filter(Boolean) as string[];

  return {
    access,
    score,
    completed,
    total,
    role,
    organizationName,
    recommendations,
    quickStats: {
      members,
      clients,
      activeProjects,
      openTasks,
    },
    steps,
  };
}
