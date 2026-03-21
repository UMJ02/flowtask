import { subDays } from "date-fns";
import { createClient } from "@/lib/supabase/server";

export async function getUnreadNotificationsCount() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return 0;

  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  return count ?? 0;
}

export async function getNotificationsPageData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { userId: "", notifications: [], assignedTasks: [], triggeredReminders: [], unreadCount: 0, digestPreview: null };
  }

  const since = subDays(new Date(), 7).toISOString();

  const [{ data: notifications }, { data: assignedTasks }, { data: triggeredReminders }, { count: unreadCount }, { data: latestDigest }] = await Promise.all([
    supabase
      .from("notifications")
      .select("id, user_id, title, body, kind, entity_type, entity_id, is_read, created_at, read_at")
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
    supabase
      .from('daily_notification_digests')
      .select('id, digest_date, status, total_notifications, summary_title, summary_body, processed_at')
      .eq('user_id', user.id)
      .order('digest_date', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const notificationIds = (notifications ?? []).map((item) => item.id);
  let deliveriesByNotificationId: Record<string, { channel: string; status: string; attempted_at: string; delivered_at: string | null; error_message: string | null }[]> = {};

  if (notificationIds.length) {
    const { data: deliveries } = await supabase
      .from('notification_deliveries')
      .select('notification_id, channel, status, attempted_at, delivered_at, error_message')
      .in('notification_id', notificationIds)
      .order('attempted_at', { ascending: false });

    deliveriesByNotificationId = (deliveries ?? []).reduce((acc, item: any) => {
      acc[item.notification_id] = acc[item.notification_id] ?? [];
      acc[item.notification_id].push(item);
      return acc;
    }, {} as Record<string, any[]>);
  }

  return {
    userId: user.id,
    notifications: (notifications ?? []).map((item: any) => ({ ...item, deliveries: deliveriesByNotificationId[item.id] ?? [] })),
    assignedTasks: assignedTasks ?? [],
    triggeredReminders: triggeredReminders ?? [],
    unreadCount: unreadCount ?? 0,
    digestPreview: latestDigest ?? null,
  };
}
