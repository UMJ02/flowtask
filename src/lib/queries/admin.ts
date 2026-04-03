import { format, subDays } from 'date-fns';
import { createClient } from '@/lib/supabase/server';
import type {
  AdminErrorLogSummary,
  AdminMetricSummary,
  AdminOrganizationSummary,
  AdminPlatformPulse,
  AdminSupportTicketSummary,
  AdminUsageInsightSummary,
  AdminUsageTopEvent,
  AdminUserSummary,
} from '@/types/admin';

function formatDateLabel(value?: string | null) {
  return value ? format(new Date(value), 'dd/MM/yyyy HH:mm') : '-';
}

function toEventLabel(value?: string | null) {
  if (!value) return 'Evento';
  return value
    .replaceAll('_', ' ')
    .replaceAll('-', ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function buildQueueHealth(openSupportTickets: number, criticalErrors7d: number) {
  if (criticalErrors7d > 0) return 'Atención inmediata';
  if (openSupportTickets >= 6) return 'Carga elevada';
  if (openSupportTickets >= 3) return 'Monitoreo activo';
  return 'Operación estable';
}

function buildRiskLabel(activeSubscriptions: number, criticalErrors7d: number) {
  if (criticalErrors7d > 0) return 'Riesgo técnico';
  if (activeSubscriptions === 0) return 'Sin cuentas activas';
  return 'Bajo control';
}

export async function getAdminAccess() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { canAccess: false, userId: null as string | null };

  const helperCheck = await supabase.rpc('is_platform_admin');
  if (!helperCheck.error) {
    return {
      canAccess: Boolean(helperCheck.data),
      userId: user.id,
    };
  }

  const { data: platformAdmin } = await supabase
    .from('platform_admins')
    .select('id')
    .eq('user_id', user.id)
    .eq('active', true)
    .maybeSingle();

  return {
    canAccess: !!platformAdmin,
    userId: user.id,
  };
}

export async function getAdminMetrics(): Promise<AdminMetricSummary> {
  const supabase = await createClient();
  const last7Days = subDays(new Date(), 7).toISOString();

  const [organizationsRes, membershipsRes, subscriptionsRes, supportRes, usageRes, criticalErrorsRes] = await Promise.all([
    supabase.from('organizations').select('id', { count: 'exact', head: true }),
    supabase.from('organization_members').select('user_id'),
    supabase.from('organization_subscriptions').select('id', { count: 'exact', head: true }).in('status', ['trial', 'active', 'past_due']),
    supabase.from('internal_support_tickets').select('id', { count: 'exact', head: true }).in('status', ['open', 'in_progress']),
    supabase.from('usage_events').select('id', { count: 'exact', head: true }).gte('created_at', last7Days),
    supabase.from('error_logs').select('id', { count: 'exact', head: true }).eq('level', 'critical').gte('created_at', last7Days),
  ]);

  const uniqueUsers = new Set((membershipsRes.data ?? []).map((row: any) => row.user_id as string).filter(Boolean));

  return {
    organizations: organizationsRes.count ?? 0,
    users: uniqueUsers.size,
    activeSubscriptions: subscriptionsRes.count ?? 0,
    openSupportTickets: supportRes.count ?? 0,
    usageEvents7d: usageRes.count ?? 0,
    criticalErrors7d: criticalErrorsRes.count ?? 0,
  };
}

export function getAdminPlatformPulse(metrics: AdminMetricSummary): AdminPlatformPulse {
  const penalty = metrics.openSupportTickets * 4 + metrics.criticalErrors7d * 12;
  const readinessScore = Math.max(12, 100 - penalty);
  const eventsTrendLabel = metrics.usageEvents7d >= 80 ? 'Uso alto' : metrics.usageEvents7d >= 25 ? 'Uso estable' : 'Uso moderado';

  return {
    readinessScore,
    queueHealthLabel: buildQueueHealth(metrics.openSupportTickets, metrics.criticalErrors7d),
    eventsTrendLabel,
    riskLabel: buildRiskLabel(metrics.activeSubscriptions, metrics.criticalErrors7d),
  };
}

export async function getAdminOrganizations(): Promise<AdminOrganizationSummary[]> {
  const supabase = await createClient();
  const { data: organizations } = await supabase
    .from('organizations')
    .select('id,name,slug,owner_id,created_at')
    .order('created_at', { ascending: false })
    .limit(8);

  const rows = organizations ?? [];
  if (!rows.length) return [];

  const organizationIds = rows.map((row: any) => row.id as string);
  const ownerIds = Array.from(new Set(rows.map((row: any) => row.owner_id as string | null).filter(Boolean) as string[]));

  const [membershipsRes, clientsRes, subscriptionsRes, profilesRes] = await Promise.all([
    supabase.from('organization_members').select('organization_id').in('organization_id', organizationIds),
    supabase.from('clients').select('organization_id').in('organization_id', organizationIds),
    supabase.from('organization_subscriptions').select('organization_id, plan_name, status').in('organization_id', organizationIds),
    ownerIds.length ? supabase.from('profiles').select('id,email').in('id', ownerIds) : Promise.resolve({ data: [] as any[] }),
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
      planName: (row.plan_name as string) ?? 'Starter',
      status: (row.status as string) ?? 'trial',
    });
  }

  const ownerEmailById = new Map<string, string>();
  for (const row of profilesRes.data ?? []) {
    ownerEmailById.set(row.id as string, (row.email as string) ?? '-');
  }

  return rows.map((row: any) => ({
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    ownerEmail: ownerEmailById.get(row.owner_id as string) ?? '-',
    membersCount: membersCount.get(row.id as string) ?? 0,
    clientsCount: clientsCount.get(row.id as string) ?? 0,
    planName: subscriptionByOrg.get(row.id as string)?.planName ?? 'Starter',
    status: subscriptionByOrg.get(row.id as string)?.status ?? 'trial',
    createdAtLabel: row.created_at ? format(new Date(row.created_at as string), 'dd/MM/yyyy') : '-',
  }));
}

export async function getAdminUsers(): Promise<AdminUserSummary[]> {
  const supabase = await createClient();
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id,full_name,email')
    .order('created_at', { ascending: false })
    .limit(8);

  const rows = profiles ?? [];
  if (!rows.length) return [];

  const userIds = rows.map((row: any) => row.id as string);
  const { data: memberships } = await supabase
    .from('organization_members')
    .select('user_id, role, is_default')
    .in('user_id', userIds);

  const membershipsByUser = new Map<string, { count: number; defaultRole: string }>();
  for (const row of memberships ?? []) {
    const key = row.user_id as string;
    const current = membershipsByUser.get(key) ?? { count: 0, defaultRole: 'member' };
    current.count += 1;
    if (row.is_default || current.defaultRole === 'member') {
      current.defaultRole = (row.role as string) ?? current.defaultRole;
    }
    membershipsByUser.set(key, current);
  }

  return rows.map((row: any) => ({
    id: row.id as string,
    email: (row.email as string) ?? '-',
    fullName: (row.full_name as string) ?? 'Usuario',
    organizationsCount: membershipsByUser.get(row.id as string)?.count ?? 0,
    defaultRole: membershipsByUser.get(row.id as string)?.defaultRole ?? 'member',
  }));
}

export async function getAdminSupportTickets(): Promise<AdminSupportTicketSummary[]> {
  const supabase = await createClient();
  const { data: tickets } = await supabase
    .from('internal_support_tickets')
    .select('id,organization_id,requester_user_id,subject,status,priority,source,created_at')
    .order('created_at', { ascending: false })
    .limit(8);

  const rows = tickets ?? [];
  if (!rows.length) return [];

  const organizationIds = Array.from(new Set(rows.map((row: any) => row.organization_id as string | null).filter(Boolean) as string[]));
  const requesterIds = Array.from(new Set(rows.map((row: any) => row.requester_user_id as string | null).filter(Boolean) as string[]));

  const [organizationsRes, profilesRes] = await Promise.all([
    organizationIds.length ? supabase.from('organizations').select('id,name').in('id', organizationIds) : Promise.resolve({ data: [] as any[] }),
    requesterIds.length ? supabase.from('profiles').select('id,email').in('id', requesterIds) : Promise.resolve({ data: [] as any[] }),
  ]);

  const organizationNameById = new Map<string, string>();
  for (const row of organizationsRes.data ?? []) {
    organizationNameById.set(row.id as string, (row.name as string) ?? 'Organización');
  }

  const requesterEmailById = new Map<string, string>();
  for (const row of profilesRes.data ?? []) {
    requesterEmailById.set(row.id as string, (row.email as string) ?? '-');
  }

  return rows.map((row: any) => ({
    id: row.id as string,
    subject: row.subject as string,
    organizationName: organizationNameById.get(row.organization_id as string) ?? 'Sin organización',
    requesterEmail: requesterEmailById.get(row.requester_user_id as string) ?? '-',
    status: (row.status as string) ?? 'open',
    priority: (row.priority as string) ?? 'normal',
    source: (row.source as string) ?? 'in_app',
    createdAtLabel: row.created_at ? format(new Date(row.created_at as string), 'dd/MM/yyyy') : '-',
  }));
}

export async function getAdminErrorLogs(): Promise<AdminErrorLogSummary[]> {
  const supabase = await createClient();
  const { data: errors } = await supabase
    .from('error_logs')
    .select('id,level,source,route,message,created_at')
    .order('created_at', { ascending: false })
    .limit(8);

  return (errors ?? []).map((row: any) => ({
    id: row.id as string,
    level: (row.level as string) ?? 'error',
    source: (row.source as string) ?? 'frontend',
    route: (row.route as string | null) ?? '-',
    message: (row.message as string) ?? 'Error sin detalle',
    createdAtLabel: formatDateLabel(row.created_at as string | null),
  }));
}

export async function getAdminUsageInsights(): Promise<AdminUsageInsightSummary> {
  const supabase = await createClient();
  const { data: events } = await supabase
    .from('usage_events')
    .select('id,event_name,user_id,organization_id,route,created_at')
    .order('created_at', { ascending: false })
    .limit(80);

  const rows = events ?? [];
  if (!rows.length) {
    return { topEvents: [], recentEvents: [] };
  }

  const organizationIds = Array.from(new Set(rows.map((row: any) => row.organization_id as string | null).filter(Boolean) as string[]));
  const userIds = Array.from(new Set(rows.map((row: any) => row.user_id as string | null).filter(Boolean) as string[]));

  const [organizationsRes, profilesRes] = await Promise.all([
    organizationIds.length ? supabase.from('organizations').select('id,name').in('id', organizationIds) : Promise.resolve({ data: [] as any[] }),
    userIds.length ? supabase.from('profiles').select('id,email,full_name').in('id', userIds) : Promise.resolve({ data: [] as any[] }),
  ]);

  const organizationNameById = new Map<string, string>();
  for (const row of organizationsRes.data ?? []) {
    organizationNameById.set(row.id as string, (row.name as string) ?? 'Organización');
  }

  const actorById = new Map<string, string>();
  for (const row of profilesRes.data ?? []) {
    actorById.set(row.id as string, (row.full_name as string) || (row.email as string) || 'Usuario');
  }

  const eventCounter = new Map<string, number>();
  for (const row of rows) {
    const eventName = (row.event_name as string) ?? 'event';
    eventCounter.set(eventName, (eventCounter.get(eventName) ?? 0) + 1);
  }

  const topEvents: AdminUsageTopEvent[] = Array.from(eventCounter.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([eventName, count]) => ({
      eventName: toEventLabel(eventName),
      count,
    }));

  const recentEvents = rows.slice(0, 8).map((row: any) => ({
    id: row.id as string,
    eventName: toEventLabel(row.event_name as string),
    organizationName: organizationNameById.get(row.organization_id as string) ?? 'Sin organización',
    actorLabel: actorById.get(row.user_id as string) ?? 'Usuario',
    route: (row.route as string | null) ?? '-',
    createdAtLabel: formatDateLabel(row.created_at as string | null),
  }));

  return { topEvents, recentEvents };
}
