import { createClient } from "@supabase/supabase-js";
import { sendOptionalEmailNotification, sendOptionalWhatsAppNotification } from "../src/lib/notifications/send-external-notification";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRole) {
  console.error("Faltan variables NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceRole, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function insertDelivery(notificationId: string, userId: string, channel: 'email' | 'whatsapp', result: Awaited<ReturnType<typeof sendOptionalEmailNotification>>) {
  await supabase.from('notification_deliveries').insert({
    notification_id: notificationId,
    user_id: userId,
    channel,
    status: result.sent ? 'sent' : (result.error?.includes('no configurado') ? 'skipped' : 'failed'),
    error_message: result.error ?? null,
    provider_response: result.providerResponse ?? {},
    delivered_at: result.sent ? new Date().toISOString() : null,
  });
}

async function main() {
  const since = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString();
  const { data, error } = await supabase
    .from('notifications')
    .select(`
      id,
      user_id,
      title,
      body,
      created_at,
      profiles:user_id (email, full_name),
      notification_preferences:user_id (enable_email, enable_whatsapp, delivery_frequency)
    `)
    .gte('created_at', since)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error leyendo notificaciones:', error.message);
    process.exit(1);
  }

  for (const item of (data ?? []) as any[]) {
    const prefs = item.notification_preferences ?? {};
    if (prefs.delivery_frequency === 'daily') continue;

    const { data: existing } = await supabase
      .from('notification_deliveries')
      .select('id, channel')
      .eq('notification_id', item.id);

    const existingChannels = new Set((existing ?? []).map((row: any) => row.channel));
    const target = item.profiles?.email ?? '';

    if (prefs.enable_email && !existingChannels.has('email') && target) {
      const result = await sendOptionalEmailNotification({ to: target, title: item.title, body: item.body ?? '' });
      await insertDelivery(item.id, item.user_id, 'email', result);
      console.log(`email ${result.sent ? 'OK' : 'skip/fail'} -> ${item.id}`);
    }

    if (prefs.enable_whatsapp && !existingChannels.has('whatsapp')) {
      const result = await sendOptionalWhatsAppNotification({ to: target, title: item.title, body: item.body ?? '' });
      await insertDelivery(item.id, item.user_id, 'whatsapp', result as any);
      console.log(`whatsapp ${result.sent ? 'OK' : 'skip/fail'} -> ${item.id}`);
    }
  }
}

main().catch((error) => {
  console.error('Fallo inesperado:', error);
  process.exit(1);
});
