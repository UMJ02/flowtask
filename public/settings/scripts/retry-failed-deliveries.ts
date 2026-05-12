import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRole) {
  console.error("Faltan variables NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceRole, { auth: { autoRefreshToken: false, persistSession: false } });

async function main() {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("notification_deliveries")
    .select("id")
    .eq("status", "failed")
    .or(`retry_after.is.null,retry_after.lte.${now}`)
    .limit(100);

  if (error) {
    console.error("Error leyendo entregas fallidas:", error.message);
    process.exit(1);
  }

  console.log(`Entregas fallidas listas para reintento: ${data?.length ?? 0}`);
  console.log("Luego ejecuta: npm run process-notification-deliveries");
}

main().catch((error) => {
  console.error("Fallo inesperado:", error);
  process.exit(1);
});
