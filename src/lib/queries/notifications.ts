import { subDays } from "date-fns";
import { createClient } from "@/lib/supabase/server";

export async function getUnreadNotificationsCount() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return 0;

  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  if (error) {
    console.error("[getUnreadNotificationsCount]", error.message);
    return 0;
  }

  return count ?? 0;
}

export async function getNotificationsPageData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { userId: "", notifications: [], assignedTasks: [], triggeredReminders: [], unreadCount: 0, digestPreview: null, deliverySummary: { total: 0, sent: 0, failed: 0, pending: 0 } };
  }

  const since = subDays(new Date(), 7).toISOString();

  const [notificationsRes, assignedTasksRes, triggeredRemindersRes, unreadCountRes, latestDigestRes] = await Promise.all([
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
      .from("daily_notification_digests")
      .select("id, digest_date, status, total_notifications, summary_title, summary_body, processed_at")
      .eq("user_id", user.id)
      .order("digest_date", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const notifications = notificationsRes.data ?? [];
  const notificationIds = notifications.map((item) => item.id);
  let deliveriesByNotificationId: Record<string, { channel: string; status: string; attempted_at: string; delivered_at: string | null; error_message: string | null; attempt_number?: number | null; retry_after?: string | null }[]> = {};

  if (notificationIds.length) {
    const { data: deliveries, error: deliveriesError } = await supabase
      .from("notification_deliveries")
      .select("id, notification_id, channel, status, attempted_at, delivered_at, error_message, attempt_number, retry_after")
      .in("notification_id", notificationIds)
      .order("attempted_at", { ascending: false });

    if (deliveriesError) {
      console.error("[getNotificationsPageData/deliveries]", deliveriesError.message);
    } else {
      deliveriesByNotificationId = (deliveries ?? []).reduce((acc, item: any) => {
        acc[item.notification_id] = acc[item.notification_id] ?? [];
        acc[item.notification_id].push(item);
        return acc;
      }, {} as Record<string, any[]>);
    }
  }

  const deliverySummary = Object.values(deliveriesByNotificationId).flat().reduce((acc, item: any) => {
    acc.total += 1;
    if (item.status === "sent") acc.sent += 1;
    else if (item.status === "failed") acc.failed += 1;
    else acc.pending += 1;
    return acc;
  }, { total: 0, sent: 0, failed: 0, pending: 0 });

  return {
    userId: user.id,
    notifications: notifications.map((item: any) => ({ ...item, deliveries: deliveriesByNotificationId[item.id] ?? [] })),
    assignedTasks: assignedTasksRes.data ?? [],
    triggeredReminders: triggeredRemindersRes.data ?? [],
    unreadCount: unreadCountRes.count ?? 0,
    digestPreview: latestDigestRes.data ?? null,
    deliverySummary,
  };
}
