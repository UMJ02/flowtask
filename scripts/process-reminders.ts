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

async function main() {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("reminders")
    .select("id, user_id, task_id, project_id, remind_at, sent_at")
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

  for (const reminder of data) {
    const { error: updateError } = await supabase
      .from("reminders")
      .update({ sent_at: new Date().toISOString() })
      .eq("id", reminder.id)
      .is("sent_at", null);

    if (updateError) {
      console.error(`No se pudo marcar ${reminder.id}:`, updateError.message);
      continue;
    }

    console.log(`OK -> ${reminder.id}`);
  }
}

main().catch((error) => {
  console.error("Fallo inesperado:", error);
  process.exit(1);
});
