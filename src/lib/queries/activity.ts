import { createClient } from "@/lib/supabase/server";

export async function getTaskActivity(taskId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("activity_logs")
    .select("id, action, metadata, created_at")
    .eq("entity_type", "task")
    .eq("entity_id", taskId)
    .order("created_at", { ascending: false })
    .limit(12);

  return data ?? [];
}

export async function getProjectActivity(projectId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("activity_logs")
    .select("id, action, metadata, created_at")
    .eq("entity_type", "project")
    .eq("entity_id", projectId)
    .order("created_at", { ascending: false })
    .limit(12);

  return data ?? [];
}

export async function getRecentActivity(limit = 20) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from("activity_logs")
    .select("id, entity_type, entity_id, action, metadata, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  return data ?? [];
}
