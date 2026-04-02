import { format } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { getOrganizationContext } from "@/lib/queries/organization";
import { filterRowsByClientAccess, getClientAccessSummary, hasClientAccess } from "@/lib/security/client-access";
import type { ClientDashboardItem, ClientDetailSummary, ClientListItem } from "@/types/client";

function formatDate(value?: string | null) {
  if (!value) return "Sin fecha";
  try {
    return format(new Date(value), "dd/MM/yyyy");
  } catch {
    return "Sin fecha";
  }
}

function isOverdue(value?: string | null, status?: string | null) {
  if (!value || status === "concluido") return false;
  return value < new Date().toISOString().slice(0, 10);
}

export async function getClients(search?: string): Promise<ClientListItem[]> {
  const context = await getOrganizationContext();
  const organizationId = context?.activeOrganization?.id;
  if (!organizationId) return [];

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const access = await getClientAccessSummary(supabase as any, user.id, organizationId);

  let query = supabase
    .from("clients")
    .select("id,name,status,notes,created_at")
    .eq("organization_id", organizationId)
    .order("name", { ascending: true })
    .limit(30);

  if (search?.trim()) query = query.ilike("name", `%${search.trim()}%`);

  const { data: clients, error: clientsError } = await query;
  if (clientsError) {
    console.error("[getClients]", clientsError.message);
    return [];
  }

  const rows = filterRowsByClientAccess((clients ?? []) as any[], access, "view");
  const ids = rows.map((row: any) => row.id as string);
  const [projectsRes, openTasksRes, completedTasksRes, overdueTasksRes] = await Promise.all([
    ids.length ? supabase.from("projects").select("id,client_id,status").in("client_id", ids) : Promise.resolve({ data: [] as any[] }),
    ids.length ? supabase.from("tasks").select("id,client_id,status").in("client_id", ids).neq("status", "concluido") : Promise.resolve({ data: [] as any[] }),
    ids.length ? supabase.from("tasks").select("id,client_id,status").in("client_id", ids).eq("status", "concluido") : Promise.resolve({ data: [] as any[] }),
    ids.length ? supabase.from("tasks").select("id,client_id,due_date,status").in("client_id", ids).neq("status", "concluido") : Promise.resolve({ data: [] as any[] }),
  ]);

  return rows.map((row: any) => ({
    id: row.id as string,
    name: row.name as string,
    status: (row.status as ClientListItem["status"]) ?? "activo",
    notes: (row.notes as string | null | undefined) ?? null,
    createdAtLabel: formatDate(row.created_at as string | null | undefined),
    projectsCount: (projectsRes.data ?? []).filter((item: any) => item.client_id === row.id && item.status !== "completado").length,
    openTasksCount: (openTasksRes.data ?? []).filter((item: any) => item.client_id === row.id).length,
    completedTasksCount: (completedTasksRes.data ?? []).filter((item: any) => item.client_id === row.id).length,
    overdueTasksCount: (overdueTasksRes.data ?? []).filter((item: any) => item.client_id === row.id && isOverdue(item.due_date as string | null | undefined, item.status as string | null | undefined)).length,
  }));
}

export async function getClientDashboardItems(): Promise<ClientDashboardItem[]> {
  const clients = await getClients();

  return clients.slice(0, 6).map((client) => ({
    id: client.id,
    name: client.name,
    openProjects: client.projectsCount,
    activeProjects: client.projectsCount,
    openTasks: client.openTasksCount,
    overdueTasks: client.overdueTasksCount,
    overdueTasksCount: client.overdueTasksCount,
  }));
}

export async function getClientById(clientId: string): Promise<ClientDetailSummary | null> {
  const context = await getOrganizationContext();
  const organizationId = context?.activeOrganization?.id;
  if (!organizationId) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const access = await getClientAccessSummary(supabase as any, user.id, organizationId);

  const { data: clientRow, error: clientError } = await supabase
    .from("clients")
    .select("id,name,status,notes,created_at,organization_id,account_owner_id")
    .eq("organization_id", organizationId)
    .eq("id", clientId)
    .maybeSingle();

  if (clientError) {
    console.error("[getClientById]", clientError.message);
    return null;
  }

  if (!clientRow || !hasClientAccess(access, clientRow.id, "view")) return null;

  const [{ data: owner }, { data: projects }, { data: tasks }, { data: activity }] = await Promise.all([
    clientRow.account_owner_id ? supabase.from("profiles").select("email").eq("id", clientRow.account_owner_id).maybeSingle() : Promise.resolve({ data: null as any }),
    supabase.from("projects").select("id,title,status,due_date").eq("client_id", clientId).order("created_at", { ascending: false }).limit(5),
    supabase.from("tasks").select("id,title,status,due_date").eq("client_id", clientId).order("created_at", { ascending: false }).limit(6),
    supabase.from("activity_logs").select("id,action,created_at,metadata").eq("entity_type", "client").eq("entity_id", clientId).order("created_at", { ascending: false }).limit(8),
  ]);

  const openTasksCount = (tasks ?? []).filter((item: any) => item.status !== "concluido").length;
  const completedTasksCount = (tasks ?? []).filter((item: any) => item.status === "concluido").length;
  const overdueTasksCount = (tasks ?? []).filter((item: any) => isOverdue(item.due_date as string | null | undefined, item.status as string | null | undefined)).length;

  return {
    id: clientRow.id as string,
    organizationId: clientRow.organization_id as string,
    name: clientRow.name as string,
    status: (clientRow.status as ClientListItem["status"]) ?? "activo",
    notes: (clientRow.notes as string | null | undefined) ?? null,
    createdAtLabel: formatDate(clientRow.created_at as string | null | undefined),
    projectsCount: (projects ?? []).filter((item: any) => item.status !== "completado").length,
    openTasksCount,
    completedTasksCount,
    overdueTasksCount,
    accountOwnerEmail: (owner?.email as string | undefined) ?? null,
    recentProjects: (projects ?? []).map((item: any) => ({ id: item.id as string, title: item.title as string, status: item.status as string, dueDateLabel: formatDate(item.due_date as string | null | undefined) })),
    recentTasks: (tasks ?? []).map((item: any) => ({ id: item.id as string, title: item.title as string, status: item.status as string, dueDateLabel: formatDate(item.due_date as string | null | undefined) })),
    activity: (activity ?? []).map((item: any) => ({ id: item.id as string, action: item.action as string, createdAtLabel: formatDate(item.created_at as string | null | undefined) })),
  };
}
