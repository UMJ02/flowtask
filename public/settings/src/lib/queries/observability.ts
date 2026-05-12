import { format } from "date-fns";
import { createClient } from "@/lib/supabase/server";

export async function getUsageEventMetrics(organizationId?: string | null) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { loginEvents: 0, projectEvents: 0, taskEvents: 0, supportEvents: 0 };
  }

  const scoped = organizationId
    ? supabase.from("usage_events").select("event_name").eq("organization_id", organizationId)
    : supabase.from("usage_events").select("event_name").eq("user_id", user.id);

  const { data } = await scoped.order("created_at", { ascending: false }).limit(200);

  const rows = data ?? [];
  return {
    loginEvents: rows.filter((row: any) => row.event_name === "login").length,
    projectEvents: rows.filter((row: any) => row.event_name === "create_project" || row.event_name === "update_project").length,
    taskEvents: rows.filter((row: any) => row.event_name === "create_task" || row.event_name === "update_task").length,
    supportEvents: rows.filter((row: any) => row.event_name === "support_ticket_created").length,
  };
}

export async function getMySupportTickets(organizationId?: string | null) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  let query = supabase
    .from("internal_support_tickets")
    .select("id,subject,status,priority,source,created_at,organization_id")
    .eq("requester_user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(6);

  if (organizationId) query = query.eq("organization_id", organizationId);

  const { data } = await query;

  return (data ?? []).map((row: any) => ({
    id: row.id as string,
    subject: (row.subject as string) ?? "Caso sin asunto",
    status: (row.status as string) ?? "open",
    priority: (row.priority as string) ?? "normal",
    source: (row.source as string) ?? "in_app",
    createdAtLabel: row.created_at ? format(new Date(row.created_at as string), "dd/MM/yyyy HH:mm") : "-",
  }));
}

export async function getRecentErrorLogs(organizationId?: string | null) {
  const supabase = await createClient();
  let query = supabase
    .from("error_logs")
    .select("id,level,source,route,message,created_at,organization_id")
    .order("created_at", { ascending: false })
    .limit(6);

  if (organizationId) query = query.eq("organization_id", organizationId);

  const { data } = await query;
  return (data ?? []).map((row: any) => ({
    id: row.id as string,
    level: (row.level as string) ?? "error",
    source: (row.source as string) ?? "frontend",
    route: (row.route as string | null) ?? "-",
    message: (row.message as string) ?? "Error sin detalle",
    createdAtLabel: row.created_at ? format(new Date(row.created_at as string), "dd/MM/yyyy HH:mm") : "-",
  }));
}
