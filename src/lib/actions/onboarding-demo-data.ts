"use server";

import { revalidatePath } from "next/cache";
import { getWorkspaceContext, applyWorkspaceScope } from "@/lib/queries/workspace";

export type OnboardingDemoResult = {
  ok: boolean;
  message: string;
  created?: {
    client?: boolean;
    project?: boolean;
    tasks?: number;
    checklistItems?: number;
  };
};

function plusDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}


export async function createOnboardingDemoDataFormAction(_formData: FormData): Promise<void> {
  await createOnboardingDemoData();
}

export async function createOnboardingDemoData(): Promise<OnboardingDemoResult> {
  const workspace = await getWorkspaceContext();

  if (!workspace.user) {
    return { ok: false, message: "Necesitás iniciar sesión para cargar datos de ejemplo." };
  }

  const userId = workspace.user.id;
  const organizationId = workspace.activeOrganizationId;
  const mode = organizationId ? "organization" : "personal";

  const [projectsCountRes, tasksCountRes] = await Promise.all([
    applyWorkspaceScope(
      workspace.supabase.from("projects").select("id", { count: "exact", head: true }),
      userId,
      organizationId,
    ),
    applyWorkspaceScope(
      workspace.supabase.from("tasks").select("id", { count: "exact", head: true }),
      userId,
      organizationId,
    ),
  ]);

  const existingProjects = projectsCountRes.count ?? 0;
  const existingTasks = tasksCountRes.count ?? 0;

  // Safety gate: demo data is only for empty workspaces.
  // Existing user data must never be touched or mixed with sample records.
  if (existingProjects > 0 || existingTasks > 0) {
    return {
      ok: false,
      message: "Este workspace ya tiene datos reales. No se cargaron ejemplos para proteger tu información.",
    };
  }

  let clientId: string | null = null;
  let clientCreated = false;

  if (organizationId) {
    const { data: client, error: clientError } = await workspace.supabase
      .from("clients")
      .insert({
        organization_id: organizationId,
        account_owner_id: userId,
        name: "Cliente demo Flowtask",
        status: "activo",
        notes: "Cliente de ejemplo creado por el onboarding para mostrar el flujo comercial sin afectar datos reales.",
        contact_email: null,
      })
      .select("id")
      .single();

    if (clientError) {
      return { ok: false, message: `No se pudo crear el cliente demo: ${clientError.message}` };
    }

    clientId = client?.id ?? null;
    clientCreated = Boolean(clientId);
  }

  const projectPayload = {
    owner_id: userId,
    title: mode === "organization" ? "Proyecto demo del equipo" : "Proyecto demo personal",
    description:
      mode === "organization"
        ? "Proyecto de ejemplo para validar tareas compartidas, clientes y seguimiento de equipo. Podés eliminarlo cuando terminés la prueba."
        : "Proyecto de ejemplo para organizar tus primeras tareas personales. Podés eliminarlo cuando terminés la prueba.",
    status: "activo",
    client_name: mode === "organization" ? "Cliente demo Flowtask" : null,
    organization_id: organizationId,
    client_id: clientId,
    country: "Costa Rica",
    is_collaborative: mode === "organization",
    share_enabled: false,
    due_date: plusDays(14),
  };

  const { data: project, error: projectError } = await workspace.supabase
    .from("projects")
    .insert(projectPayload)
    .select("id")
    .single();

  if (projectError || !project?.id) {
    return { ok: false, message: `No se pudo crear el proyecto demo: ${projectError?.message ?? "sin id de proyecto"}` };
  }

  const projectId = project.id as string;

  const taskRows = [
    {
      title: mode === "organization" ? "Definir responsables del proyecto demo" : "Ordenar prioridades de la semana",
      description: "Tarea de ejemplo para probar estados, prioridad, vencimiento y detalle operativo.",
      status: "en_proceso",
      priority: "alta",
      due_date: plusDays(2),
    },
    {
      title: mode === "organization" ? "Preparar avance para cliente demo" : "Crear rutina de seguimiento personal",
      description: "Tarea de ejemplo para mostrar cómo Flowtask centraliza seguimiento sin partir desde una pantalla vacía.",
      status: "en_espera",
      priority: "media",
      due_date: plusDays(5),
    },
    {
      title: mode === "organization" ? "Revisar entregables del equipo" : "Cerrar primer bloque de productividad",
      description: "Tarea de ejemplo para validar finalización, checklist y organización por proyecto.",
      status: "en_proceso",
      priority: "media",
      due_date: plusDays(8),
    },
  ].map((task) => ({
    owner_id: userId,
    project_id: projectId,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    due_date: task.due_date,
    client_name: mode === "organization" ? "Cliente demo Flowtask" : null,
    organization_id: organizationId,
    client_id: clientId,
    country: "Costa Rica",
    share_enabled: false,
  }));

  const { data: tasks, error: tasksError } = await workspace.supabase
    .from("tasks")
    .insert(taskRows)
    .select("id,title");

  if (tasksError) {
    return { ok: false, message: `No se pudieron crear las tareas demo: ${tasksError.message}` };
  }

  const firstTaskId = tasks?.[0]?.id as string | undefined;
  let checklistItems = 0;

  if (firstTaskId) {
    const { error: checklistError } = await workspace.supabase.from("task_checklist_items").insert([
      { task_id: firstTaskId, owner_id: userId, title: "Validar fecha de entrega", done: false, position: 0 },
      { task_id: firstTaskId, owner_id: userId, title: "Asignar siguiente acción", done: false, position: 1 },
      { task_id: firstTaskId, owner_id: userId, title: "Marcar avance inicial", done: true, position: 2 },
    ]);

    if (!checklistError) {
      checklistItems = 3;
    }
  }

  revalidatePath("/app/onboarding");
  revalidatePath("/app");
  revalidatePath("/app/tasks");
  revalidatePath("/app/projects");
  revalidatePath("/app/clients");

  return {
    ok: true,
    message: "Datos de ejemplo cargados correctamente.",
    created: {
      client: clientCreated,
      project: true,
      tasks: tasks?.length ?? 0,
      checklistItems,
    },
  };
}
