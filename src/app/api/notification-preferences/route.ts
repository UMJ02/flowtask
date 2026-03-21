import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
    daily_digest_hour: Number.isFinite(Number(body.daily_digest_hour)) ? Math.min(23, Math.max(0, Number(body.daily_digest_hour))) : 8,
  };

  const { data, error } = await supabase
    .from("notification_preferences")
    .upsert(payload, { onConflict: "user_id" })
    .select("user_id, enable_task, enable_project, enable_comment, enable_reminder, enable_toasts, enable_email, enable_whatsapp, delivery_frequency, daily_digest_hour")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ data });
}
