import { format } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { getOrganizationContext } from "@/lib/queries/organization";
import type { ClientDashboardItem, ClientDetailSummary, ClientListItem } from "@/types/client";

function formatDate(value?: string | null) {
  if (!value) return "Sin fecha";
  try {
    return format(new Date(value), "dd/MM/yyyy");
  } catch {
    return "Sin fecha";
  }
}

export async function getClients(search?: string): Promise<ClientListItem[]> {
  const context = await getOrganizationContext();
  const organizationId = context?.activeOrganization?.id;
  if (!organizationId) return [];

  const supabase = await createClient();
  let query = supabase
    .from("clients")
    .select("id,name,status,notes,created_at")
    .eq("organization_id", organizationId)
    .order("name", { ascending: true })
    .limit(30);

  if (search?.trim()) query = query.ilike("name", `%${search.trim()}%`);

  const { data: clients } = await query;
  const rows = clients ?? [];
  const ids = rows.map((row) => row.id as string);
  const [projectsRes, openTasksRes, completedTasksRes] = await Promise.all([
    ids.length ? supabase.from("projects").select("id,client_id,status").in("client_id", ids) : Promise.resolve({ data: [] as any[] }),
    ids.length ? supabase.from("tasks").select("id,client_id,status").in("client_id", ids).neq("status", "concluido") : Promise.resolve({ data: [] as any[] }),
    ids.length ? supabase.from("tasks").select("id,client_id,status").in("client_id", ids).eq("status", "concluido") : Promise.resolve({ data: [] as any[] }),
  ]);

  return rows.map((row) => ({
    id: row.id as string,
    name: row.name as string,
    status: (row.status as ClientListItem["status"]) ?? "activo",
    notes: (row.notes as string | null | undefined) ?? null,
    createdAtLabel: formatDate(row.created_at as string | null | undefined),
    projectsCount: (projectsRes.data ?? []).filter((item) => item.client_id === row.id && item.status !== "completado").length,
    openTasksCount: (openTasksRes.data ?? []).filter((item) => item.client_id === row.id).length,
    completedTasksCount: (completedTasksRes.data ?? []).filter((item) => item.client_id === row.id).length,
  }));
}

export async function getClientDashboardItems(): Promise<ClientDashboardItem[]> {
  const clients = await getClients();
  const supabase = await createClient();
  const ids = clients.map((client) => client.id);
  const { data: overdueTasks } = ids.length
    ? await supabase.from("tasks").select("id,client_id,due_date,status").in("client_id", ids).neq("status", "concluido")
    : { data: [] as any[] };

  return clients.slice(0, 6).map((client) => ({
    id: client.id,
    name: client.name,
    openProjects: client.projectsCount,
    openTasks: client.openTasksCount,
    overdueTasks: (overdueTasks ?? []).filter((item) => item.client_id === client.id && item.due_date && new Date(item.due_date) < new Date()).length,
  }));
}

export async function getClientById(clientId: string): Promise<ClientDetailSummary | null> {
  const context = await getOrganizationContext();
  const organizationId = context?.activeOrganization?.id;
  if (!organizationId) return null;

  const supabase = await createClient();
  const { data: clientRow } = await supabase
    .from("clients")
    .select("id,name,status,notes,created_at,organization_id,account_owner_id")
    .eq("organization_id", organizationId)
    .eq("id", clientId)
    .maybeSingle();

  if (!clientRow) return null;

  const [{ data: owner }, { data: projects }, { data: tasks }, { data: activity }] = await Promise.all([
    clientRow.account_owner_id ? supabase.from("profiles").select("email").eq("id", clientRow.account_owner_id).maybeSingle() : Promise.resolve({ data: null as any }),
    supabase.from("projects").select("id,title,status,due_date").eq("client_id", clientId).order("created_at", { ascending: false }).limit(5),
    supabase.from("tasks").select("id,title,status,due_date").eq("client_id", clientId).order("created_at", { ascending: false }).limit(6),
    supabase.from("activity_logs").select("id,action,created_at,metadata").eq("entity_type", "client").eq("entity_id", clientId).order("created_at", { ascending: false }).limit(8),
  ]);

  const openTasksCount = (tasks ?? []).filter((item) => item.status !== "concluido").length;
  const completedTasksCount = (tasks ?? []).filter((item) => item.status === "concluido").length;

  return {
    id: clientRow.id as string,
    organizationId: clientRow.organization_id as string,
    name: clientRow.name as string,
    status: (clientRow.status as ClientListItem["status"]) ?? "activo",
    notes: (clientRow.notes as string | null | undefined) ?? null,
    createdAtLabel: formatDate(clientRow.created_at as string | null | undefined),
    projectsCount: (projects ?? []).filter((item) => item.status !== "completado").length,
    openTasksCount,
    completedTasksCount,
    accountOwnerEmail: (owner?.email as string | undefined) ?? null,
    recentProjects: (projects ?? []).map((item) => ({ id: item.id as string, title: item.title as string, status: item.status as string, dueDateLabel: formatDate(item.due_date as string | null | undefined) })),
    recentTasks: (tasks ?? []).map((item) => ({ id: item.id as string, title: item.title as string, status: item.status as string, dueDateLabel: formatDate(item.due_date as string | null | undefined) })),
    activity: (activity ?? []).map((item) => ({ id: item.id as string, action: item.action as string, createdAtLabel: formatDate(item.created_at as string | null | undefined) })),
  };
}
