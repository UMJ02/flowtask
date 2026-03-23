import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function clampHour(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.min(23, Math.max(0, parsed)) : fallback;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await request.json();
  const payload = {
    user_id: user.id,
    enable_task: Boolean(body.enable_task),
    enable_project: Boolean(body.enable_project),
    enable_comment: Boolean(body.enable_comment),
    enable_reminder: Boolean(body.enable_reminder),
    enable_toasts: Boolean(body.enable_toasts),
    enable_email: Boolean(body.enable_email),
    enable_whatsapp: Boolean(body.enable_whatsapp),
    delivery_frequency: body.delivery_frequency === "daily" ? "daily" : "immediate",
    daily_digest_hour: clampHour(body.daily_digest_hour, 8),
    quiet_hours_enabled: Boolean(body.quiet_hours_enabled),
    quiet_hours_start: clampHour(body.quiet_hours_start, 22),
    quiet_hours_end: clampHour(body.quiet_hours_end, 7),
  };

  const { data, error } = await supabase
    .from("notification_preferences")
    .upsert(payload, { onConflict: "user_id" })
    .select("user_id, enable_task, enable_project, enable_comment, enable_reminder, enable_toasts, enable_email, enable_whatsapp, delivery_frequency, daily_digest_hour, quiet_hours_enabled, quiet_hours_start, quiet_hours_end")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ data });
}
