import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRole) {
  console.error("Faltan variables NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceRole, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function postWebhook(url: string, payload: Record<string, unknown>) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Webhook respondió ${response.status}`);
  }
}

async function sendOptionalExternalAlerts(email: string | null, title: string, body: string) {
  if (email && process.env.REMINDER_EMAIL_WEBHOOK_URL) {
    await postWebhook(process.env.REMINDER_EMAIL_WEBHOOK_URL, { to: email, subject: title, body });
  }

  if (process.env.REMINDER_WHATSAPP_WEBHOOK_URL) {
    await postWebhook(process.env.REMINDER_WHATSAPP_WEBHOOK_URL, { title, body });
  }
}

async function main() {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("reminders")
    .select(`
      id,
      user_id,
      task_id,
      project_id,
      remind_at,
      sent_at,
      profiles:user_id (email, full_name)
    `)
    .is("sent_at", null)
    .lte("remind_at", now)
    .order("remind_at", { ascending: true });

  if (error) {
    console.error("Error buscando recordatorios:", error.message);
    process.exit(1);
  }

  if (!data || data.length === 0) {
    console.log("No hay recordatorios pendientes.");
    return;
  }

  console.log(`Recordatorios pendientes: ${data.length}`);

  for (const reminder of data as any[]) {
    const title = reminder.task_id ? "Recordatorio de tarea" : "Recordatorio de proyecto";
    const body = reminder.task_id
      ? `Tienes una tarea pendiente por revisar. Recordatorio programado para ${reminder.remind_at}.`
      : `Tienes un proyecto pendiente por revisar. Recordatorio programado para ${reminder.remind_at}.`;

    const { error: updateError } = await supabase
      .from("reminders")
      .update({ sent_at: new Date().toISOString() })
      .eq("id", reminder.id)
      .is("sent_at", null);

    if (updateError) {
      console.error(`No se pudo marcar ${reminder.id}:`, updateError.message);
      continue;
    }

    await supabase.from("notifications").insert({
      user_id: reminder.user_id,
      title,
      body,
      kind: "reminder",
      entity_type: reminder.task_id ? "task" : "project",
      entity_id: reminder.task_id ?? reminder.project_id,
    });

    try {
      await sendOptionalExternalAlerts(reminder.profiles?.email ?? null, title, body);
    } catch (externalError) {
      console.error(`No se pudo disparar alerta externa para ${reminder.id}:`, externalError);
    }

    console.log(`OK -> ${reminder.id}`);
  }
}

main().catch((error) => {
  console.error("Fallo inesperado:", error);
  process.exit(1);
});
