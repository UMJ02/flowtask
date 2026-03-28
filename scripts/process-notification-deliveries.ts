import { createClient } from "@supabase/supabase-js";
import { sendOptionalEmailNotification, sendOptionalWhatsAppNotification } from "../src/lib/notifications/send-external-notification";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
const MAX_ATTEMPTS = Number(process.env.NOTIFICATION_MAX_ATTEMPTS ?? 3);
const RETRY_DELAY_MINUTES = Number(process.env.NOTIFICATION_RETRY_DELAY_MINUTES ?? 15);

if (!url || !serviceRole) {
  console.error("Faltan variables NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceRole, {
  auth: { autoRefreshToken: false, persistSession: false },
});

type DeliveryResult = Awaited<ReturnType<typeof sendOptionalEmailNotification>>;

type DeliveryRecord = {
  id: string;
  channel: "email" | "whatsapp";
  status: "queued" | "sent" | "skipped" | "failed";
  attempted_at: string;
  attempt_number?: number | null;
  error_message?: string | null;
  retry_after?: string | null;
};

async function insertDelivery(notificationId: string, userId: string, channel: "email" | "whatsapp", result: DeliveryResult, attemptNumber: number) {
  const status = result.sent ? "sent" : result.error?.includes("no configurado") ? "skipped" : "failed";
  const retryAfter = status === "failed" && attemptNumber < MAX_ATTEMPTS
    ? new Date(Date.now() + RETRY_DELAY_MINUTES * 60 * 1000).toISOString()
    : null;

  await supabase.from("notification_deliveries").insert({
    notification_id: notificationId,
    user_id: userId,
    channel,
    status,
    error_message: result.error ?? null,
    provider_response: result.providerResponse ?? {},
    delivered_at: result.sent ? new Date().toISOString() : null,
    attempt_number: attemptNumber,
    retry_after: retryAfter,
    retry_group: `${notificationId}:${channel}`,
  });
}

function canRetry(lastDelivery?: DeliveryRecord | null) {
  if (!lastDelivery) return true;
  if (lastDelivery.status === "sent" || lastDelivery.status === "skipped") return false;
  const attempts = lastDelivery.attempt_number ?? 1;
  if (attempts >= MAX_ATTEMPTS) return false;
  if (!lastDelivery.retry_after) return true;
  return new Date(lastDelivery.retry_after).getTime() <= Date.now();
}

async function getLastDelivery(notificationId: string, channel: "email" | "whatsapp") {
  const { data } = await supabase
    .from("notification_deliveries")
    .select("id, channel, status, attempted_at, attempt_number, error_message, retry_after")
    .eq("notification_id", notificationId)
    .eq("channel", channel)
    .order("attempted_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (data as DeliveryRecord | null) ?? null;
}

async function main() {
  const since = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString();
  const { data, error } = await supabase
    .from("notifications")
    .select(`
      id,
      user_id,
      title,
      body,
      created_at,
      profiles:user_id (email, full_name),
      notification_preferences:user_id (enable_email, enable_whatsapp, delivery_frequency)
    `)
    .gte("created_at", since)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error leyendo notificaciones:", error.message);
    process.exit(1);
  }

  for (const item of (data ?? []) as any[]) {
    const prefs = item.notification_preferences ?? {};
    if (prefs.delivery_frequency === "daily") continue;

    const target = item.profiles?.email ?? "";

    if (prefs.enable_email && target) {
      const lastEmailDelivery = await getLastDelivery(item.id, "email");
      if (canRetry(lastEmailDelivery)) {
        const result = await sendOptionalEmailNotification({ to: target, title: item.title, body: item.body ?? "" });
        await insertDelivery(item.id, item.user_id, "email", result, (lastEmailDelivery?.attempt_number ?? 0) + 1);
        console.log(`email ${result.sent ? "OK" : "skip/fail"} -> ${item.id}`);
      }
    }

    if (prefs.enable_whatsapp) {
      const lastWhatsAppDelivery = await getLastDelivery(item.id, "whatsapp");
      if (canRetry(lastWhatsAppDelivery)) {
        const result = await sendOptionalWhatsAppNotification({ to: target, title: item.title, body: item.body ?? "" });
        await insertDelivery(item.id, item.user_id, "whatsapp", result as DeliveryResult, (lastWhatsAppDelivery?.attempt_number ?? 0) + 1);
        console.log(`whatsapp ${result.sent ? "OK" : "skip/fail"} -> ${item.id}`);
      }
    }
  }
}

main().catch((error) => {
  console.error("Fallo inesperado:", error);
  process.exit(1);
});
