import { createClient } from "@/lib/supabase/server";

export type NotificationPreferences = {
  user_id: string;
  enable_task: boolean;
  enable_project: boolean;
  enable_comment: boolean;
  enable_reminder: boolean;
  enable_toasts: boolean;
  enable_email: boolean;
  enable_whatsapp: boolean;
  delivery_frequency: "immediate" | "daily";
  daily_digest_hour: number;
  quiet_hours_enabled: boolean;
  quiet_hours_start: number;
  quiet_hours_end: number;
};

export const DEFAULT_NOTIFICATION_PREFERENCES: Omit<NotificationPreferences, "user_id"> = {
  enable_task: true,
  enable_project: true,
  enable_comment: true,
  enable_reminder: true,
  enable_toasts: true,
  enable_email: false,
  enable_whatsapp: false,
  delivery_frequency: "immediate",
  daily_digest_hour: 8,
  quiet_hours_enabled: false,
  quiet_hours_start: 22,
  quiet_hours_end: 7,
};

export async function getNotificationPreferences() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("notification_preferences")
    .select("user_id, enable_task, enable_project, enable_comment, enable_reminder, enable_toasts, enable_email, enable_whatsapp, delivery_frequency, daily_digest_hour, quiet_hours_enabled, quiet_hours_start, quiet_hours_end")
    .eq("user_id", user.id)
    .maybeSingle();

  if (data) return data as NotificationPreferences;

  return { user_id: user.id, ...DEFAULT_NOTIFICATION_PREFERENCES } satisfies NotificationPreferences;
}
