import { createClient } from "@supabase/supabase-js";
import { buildDailyDigestEmail } from "../src/lib/templates/daily-digest";
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

async function main() {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const since = new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString();

  const { data: prefRows, error: prefError } = await supabase
    .from('notification_preferences')
    .select('user_id, enable_email, enable_whatsapp, delivery_frequency, daily_digest_hour, profiles:user_id(email, full_name)')
    .eq('delivery_frequency', 'daily')
    .lte('daily_digest_hour', now.getHours());

  if (prefError) {
    console.error('Error leyendo preferencias:', prefError.message);
    process.exit(1);
  }

  for (const pref of (prefRows ?? []) as any[]) {
    const { data: existingDigest } = await supabase
      .from('daily_notification_digests')
      .select('id, status')
      .eq('user_id', pref.user_id)
      .eq('digest_date', today)
      .maybeSingle();

    if (existingDigest?.status === 'sent') continue;

    const { data: items } = await supabase
      .from('notifications')
      .select('id, title, body, created_at, entity_type')
      .eq('user_id', pref.user_id)
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(20);

    const digest = buildDailyDigestEmail({
      userName: pref.profiles?.full_name ?? null,
      items: (items ?? []).map((item: any) => ({ title: item.title, body: item.body, created_at: item.created_at, entity_type: item.entity_type })),
      digestDate: today,
    });

    const summaryBody = digest.text.slice(0, 4000);
    await supabase.from('daily_notification_digests').upsert({
      user_id: pref.user_id,
      digest_date: today,
      delivery_frequency: 'daily',
      status: 'queued',
      total_notifications: (items ?? []).length,
      summary_title: digest.title,
      summary_body: summaryBody,
      processed_at: null,
    }, { onConflict: 'user_id,digest_date' });

    if (pref.enable_email && pref.profiles?.email) {
      const result = await sendOptionalEmailNotification({ to: pref.profiles.email, title: digest.title, body: digest.html });
      if ((items ?? []).length) {
        for (const item of items as any[]) {
          await supabase.from('notification_deliveries').insert({
            notification_id: item.id,
            user_id: pref.user_id,
            channel: 'email',
            status: result.sent ? 'sent' : 'failed',
            error_message: result.error ?? null,
            provider_response: result.providerResponse ?? {},
            delivered_at: result.sent ? new Date().toISOString() : null,
          });
        }
      }
      await supabase.from('daily_notification_digests').update({ status: result.sent ? 'sent' : 'failed', processed_at: new Date().toISOString() }).eq('user_id', pref.user_id).eq('digest_date', today);
    } else if (pref.enable_whatsapp) {
      const result = await sendOptionalWhatsAppNotification({ to: pref.profiles?.email ?? '', title: digest.title, body: digest.text });
      await supabase.from('daily_notification_digests').update({ status: result.sent ? 'sent' : 'failed', processed_at: new Date().toISOString() }).eq('user_id', pref.user_id).eq('digest_date', today);
    } else {
      await supabase.from('daily_notification_digests').update({ status: 'skipped', processed_at: new Date().toISOString() }).eq('user_id', pref.user_id).eq('digest_date', today);
    }

    console.log(`digest -> ${pref.user_id}`);
  }
}

main().catch((error) => {
  console.error('Fallo inesperado:', error);
  process.exit(1);
});
