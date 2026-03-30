import { format } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import type {
  AdminMetricSummary,
  AdminOrganizationSummary,
  AdminSupportTicketSummary,
  AdminUserSummary,
} from "@/types/admin";

export async function getAdminAccess() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { canAccess: false, userId: null as string | null };

  const [{ data: platformAdmin }, { data: orgMembership }] = await Promise.all([
    supabase.from("platform_admins").select("id").eq("user_id", user.id).eq("active", true).maybeSingle(),
    supabase.from("organization_members").select("role").eq("user_id", user.id).eq("role", "admin_global").limit(1).maybeSingle(),
  ]);

  return {
    canAccess: !!platformAdmin || !!orgMembership,
    userId: user.id,
  };
}

export async function getAdminMetrics(): Promise<AdminMetricSummary> {
  const supabase = await createClient();
  const [organizationsRes, membershipsRes, subscriptionsRes, supportRes] = await Promise.all([
    supabase.from("organizations").select("id", { count: "exact", head: true }),
    supabase.from("organization_members").select("user_id"),
    supabase.from("organization_subscriptions").select("id", { count: "exact", head: true }).in("status", ["trial", "active", "past_due"]),
    supabase.from("internal_support_tickets").select("id", { count: "exact", head: true }).in("status", ["open", "in_progress"]),
  ]);

  const uniqueUsers = new Set((membershipsRes.data ?? []).map((row) => row.user_id as string).filter(Boolean));

  return {
    organizations: organizationsRes.count ?? 0,
    users: uniqueUsers.size,
    activeSubscriptions: subscriptionsRes.count ?? 0,
    openSupportTickets: supportRes.count ?? 0,
  };
}

export async function getAdminOrganizations(): Promise<AdminOrganizationSummary[]> {
  const supabase = await createClient();
  const { data: organizations } = await supabase
    .from("organizations")
    .select("id,name,slug,owner_id,created_at")
    .order("created_at", { ascending: false })
    .limit(8);

  const rows = organizations ?? [];
  if (!rows.length) return [];

  const organizationIds = rows.map((row) => row.id as string);
  const ownerIds = Array.from(new Set(rows.map((row) => row.owner_id as string | null).filter(Boolean) as string[]));

  const [membershipsRes, clientsRes, subscriptionsRes, profilesRes] = await Promise.all([
    supabase.from("organization_members").select("organization_id").in("organization_id", organizationIds),
    supabase.from("clients").select("organization_id").in("organization_id", organizationIds),
    supabase.from("organization_subscriptions").select("organization_id, plan_name, status").in("organization_id", organizationIds),
    ownerIds.length ? supabase.from("profiles").select("id,email").in("id", ownerIds) : Promise.resolve({ data: [] as any[] }),
  ]);

  const membersCount = new Map<string, number>();
  for (const row of membershipsRes.data ?? []) {
    const key = row.organization_id as string;
    membersCount.set(key, (membersCount.get(key) ?? 0) + 1);
  }

  const clientsCount = new Map<string, number>();
  for (const row of clientsRes.data ?? []) {
    const key = row.organization_id as string;
    clientsCount.set(key, (clientsCount.get(key) ?? 0) + 1);
  }

  const subscriptionByOrg = new Map<string, { planName: string; status: string }>();
  for (const row of subscriptionsRes.data ?? []) {
    subscriptionByOrg.set(row.organization_id as string, {
      planName: (row.plan_name as string) ?? "Starter",
      status: (row.status as string) ?? "trial",
    });
  }

  const ownerEmailById = new Map<string, string>();
  for (const row of profilesRes.data ?? []) {
    ownerEmailById.set(row.id as string, (row.email as string) ?? "-");
  }

  return rows.map((row) => ({
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    ownerEmail: ownerEmailById.get(row.owner_id as string) ?? "-",
    membersCount: membersCount.get(row.id as string) ?? 0,
    clientsCount: clientsCount.get(row.id as string) ?? 0,
    planName: subscriptionByOrg.get(row.id as string)?.planName ?? "Starter",
    status: subscriptionByOrg.get(row.id as string)?.status ?? "trial",
    createdAtLabel: row.created_at ? format(new Date(row.created_at as string), "dd/MM/yyyy") : "-",
  }));
}

export async function getAdminUsers(): Promise<AdminUserSummary[]> {
  const supabase = await createClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id,full_name,email")
    .order("created_at", { ascending: false })
    .limit(8);

  const rows = profiles ?? [];
  if (!rows.length) return [];

  const userIds = rows.map((row) => row.id as string);
  const { data: memberships } = await supabase
    .from("organization_members")
    .select("user_id, role, is_default")
    .in("user_id", userIds);

  const membershipsByUser = new Map<string, { count: number; defaultRole: string }>();
  for (const row of memberships ?? []) {
    const key = row.user_id as string;
    const current = membershipsByUser.get(key) ?? { count: 0, defaultRole: "member" };
    current.count += 1;
    if (row.is_default || current.defaultRole === "member") {
      current.defaultRole = (row.role as string) ?? current.defaultRole;
    }
    membershipsByUser.set(key, current);
  }

  return rows.map((row) => ({
    id: row.id as string,
    email: (row.email as string) ?? "-",
    fullName: (row.full_name as string) ?? "Usuario",
    organizationsCount: membershipsByUser.get(row.id as string)?.count ?? 0,
    defaultRole: membershipsByUser.get(row.id as string)?.defaultRole ?? "member",
  }));
}

export async function getAdminSupportTickets(): Promise<AdminSupportTicketSummary[]> {
  const supabase = await createClient();
  const { data: tickets } = await supabase
    .from("internal_support_tickets")
    .select("id,organization_id,requester_user_id,subject,status,priority,source,created_at")
    .order("created_at", { ascending: false })
    .limit(8);

  const rows = tickets ?? [];
  if (!rows.length) return [];

  const organizationIds = Array.from(new Set(rows.map((row) => row.organization_id as string | null).filter(Boolean) as string[]));
  const requesterIds = Array.from(new Set(rows.map((row) => row.requester_user_id as string | null).filter(Boolean) as string[]));

  const [organizationsRes, profilesRes] = await Promise.all([
    organizationIds.length ? supabase.from("organizations").select("id,name").in("id", organizationIds) : Promise.resolve({ data: [] as any[] }),
    requesterIds.length ? supabase.from("profiles").select("id,email").in("id", requesterIds) : Promise.resolve({ data: [] as any[] }),
  ]);

  const organizationNameById = new Map<string, string>();
  for (const row of organizationsRes.data ?? []) {
    organizationNameById.set(row.id as string, (row.name as string) ?? "Organización");
  }

  const requesterEmailById = new Map<string, string>();
  for (const row of profilesRes.data ?? []) {
    requesterEmailById.set(row.id as string, (row.email as string) ?? "-");
  }

  return rows.map((row) => ({
    id: row.id as string,
    subject: row.subject as string,
    organizationName: organizationNameById.get(row.organization_id as string) ?? "Sin organización",
    requesterEmail: requesterEmailById.get(row.requester_user_id as string) ?? "-",
    status: (row.status as string) ?? "open",
    priority: (row.priority as string) ?? "normal",
    source: (row.source as string) ?? "in_app",
    createdAtLabel: row.created_at ? format(new Date(row.created_at as string), "dd/MM/yyyy") : "-",
  }));
}
