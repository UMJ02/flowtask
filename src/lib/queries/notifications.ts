import { subDays } from "date-fns";
import { createClient } from "@/lib/supabase/server";

export async function getNotificationsPageData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { notifications: [], assignedTasks: [], triggeredReminders: [], unreadCount: 0 };
  }

  const since = subDays(new Date(), 7).toISOString();

  const [{ data: notifications }, { data: assignedTasks }, { data: triggeredReminders }, { count: unreadCount }] = await Promise.all([
    supabase
      .from("notifications")
      .select("id, title, body, kind, entity_type, entity_id, is_read, created_at, read_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(30),
    supabase
      .from("task_assignees")
      .select("id, assigned_at, tasks!inner(id,title,status,due_date,client_name)")
      .eq("user_id", user.id)
      .order("assigned_at", { ascending: false })
      .limit(10),
    supabase
      .from("reminders")
      .select("id, remind_at, sent_at, task_id, project_id")
      .eq("user_id", user.id)
      .not("sent_at", "is", null)
      .gte("sent_at", since)
      .order("sent_at", { ascending: false })
      .limit(10),
    supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("is_read", false),
  ]);

  return {
    notifications: notifications ?? [],
    assignedTasks: assignedTasks ?? [],
    triggeredReminders: triggeredReminders ?? [],
    unreadCount: unreadCount ?? 0,
  };
}
