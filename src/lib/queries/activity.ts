import { createClient } from "@/lib/supabase/server";

export type ActivityItem = {
  id: string;
  entity_type?: string | null;
  entity_id?: string | null;
  action: string;
  metadata?: Record<string, unknown> | null;
  created_at: string;
  organization_id?: string | null;
  client_id?: string | null;
  project_id?: string | null;
  task_id?: string | null;
};

export type RecentActivitySummary = {
  items: ActivityItem[];
  counts: {
    total: number;
    tasks: number;
    projects: number;
    comments: number;
    reminders: number;
  };
};

const BASE_SELECT = "id, entity_type, entity_id, action, metadata, created_at, organization_id, client_id, project_id, task_id";

async function getActivityByEntity(entityType: string, entityId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("activity_logs")
    .select(BASE_SELECT)
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("created_at", { ascending: false })
    .limit(12);

  return (data ?? []) as ActivityItem[];
}

export async function getTaskActivity(taskId: string) {
  return getActivityByEntity("task", taskId);
}

export async function getProjectActivity(projectId: string) {
  return getActivityByEntity("project", projectId);
}

export async function getClientActivity(clientId: string) {
  return getActivityByEntity("client", clientId);
}

export async function getOrganizationActivity(organizationId: string, limit = 16) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("activity_logs")
    .select(BASE_SELECT)
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []) as ActivityItem[];
}

export async function getRecentActivity(limit = 20) {
  const supabase = await createClient();
  const since = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [] as ActivityItem[];

  const { data } = await supabase
    .from("activity_logs")
    .select(BASE_SELECT)
    .eq("user_id", user.id)
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []) as ActivityItem[];
}

export async function getRecentActivitySummary(limit = 20): Promise<RecentActivitySummary> {
  const items = await getRecentActivity(limit);

  const counts = items.reduce(
    (acc, item) => {
      acc.total += 1;

      if (item.entity_type === "task" || item.action.startsWith("task_")) acc.tasks += 1;
      if (item.entity_type === "project" || item.action.startsWith("project_")) acc.projects += 1;
      if (item.action.includes("comment")) acc.comments += 1;
      if (item.action.includes("reminder")) acc.reminders += 1;

      return acc;
    },
    { total: 0, tasks: 0, projects: 0, comments: 0, reminders: 0 },
  );

  return { items, counts };
}
