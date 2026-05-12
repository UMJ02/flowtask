import { createClient } from "@/lib/supabase/server";

export async function getReminders() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from("reminders")
    .select(
      `
        id,
        remind_at,
        sent_at,
        created_at,
        task_id,
        project_id,
        tasks ( id, title ),
        projects ( id, title )
      `,
    )
    .eq("user_id", user.id)
    .order("remind_at", { ascending: true });

  return data ?? [];
}
