import { format } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import type { SupportReadinessSummary, SupportTicketSummary } from "@/types/support";

export async function getOrganizationSupportTickets(organizationId?: string | null): Promise<SupportTicketSummary[]> {
  if (!organizationId) return [];
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("internal_support_tickets")
    .select("id,subject,status,priority,source,requester_user_id,created_at")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(8);

  const requesterIds = Array.from(new Set((rows ?? []).map((row: any) => row.requester_user_id as string | null).filter(Boolean) as string[]));
  const profilesRes = requesterIds.length
    ? await supabase.from("profiles").select("id,email").in("id", requesterIds)
    : { data: [] as any[] };

  const emailById = new Map<string, string>();
  for (const row of profilesRes.data ?? []) {
    emailById.set(row.id as string, (row.email as string) ?? "-");
  }

  return (rows ?? []).map((row: any) => ({
    id: row.id as string,
    subject: (row.subject as string) ?? "Caso sin asunto",
    status: (row.status as string) ?? "open",
    priority: (row.priority as string) ?? "normal",
    source: (row.source as string) ?? "in_app",
    requesterEmail: emailById.get(row.requester_user_id as string) ?? "-",
    createdAtLabel: row.created_at ? format(new Date(row.created_at as string), "dd/MM/yyyy") : "-",
  }));
}

export async function getOrganizationSupportReadiness(organizationId?: string | null): Promise<SupportReadinessSummary> {
  if (!organizationId) {
    return { open: 0, inProgress: 0, critical: 0, resolvedLast30Days: 0 };
  }

  const supabase = await createClient();
  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);

  const [openRes, progressRes, criticalRes, resolvedRes] = await Promise.all([
    supabase.from("internal_support_tickets").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).eq("status", "open"),
    supabase.from("internal_support_tickets").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).eq("status", "in_progress"),
    supabase.from("internal_support_tickets").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).eq("priority", "critical").in("status", ["open", "in_progress"]),
    supabase.from("internal_support_tickets").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).eq("status", "resolved").gte("updated_at", last30Days.toISOString()),
  ]);

  return {
    open: openRes.count ?? 0,
    inProgress: progressRes.count ?? 0,
    critical: criticalRes.count ?? 0,
    resolvedLast30Days: resolvedRes.count ?? 0,
  };
}
