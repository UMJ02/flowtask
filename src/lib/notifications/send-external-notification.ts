type ExternalArgs = {
  to: string;
  title: string;
  body?: string | null;
};

async function postJson(url: string, payload: Record<string, unknown>) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Webhook respondió ${response.status}`);
  }
}

export async function sendOptionalEmailNotification({ to, title, body }: ExternalArgs) {
  const webhook = process.env.REMINDER_EMAIL_WEBHOOK_URL;
  if (!webhook) return { sent: false, channel: "email" as const };
  await postJson(webhook, { to, subject: title, body });
  return { sent: true, channel: "email" as const };
}

export async function sendOptionalWhatsAppNotification({ to, title, body }: ExternalArgs) {
  const webhook = process.env.REMINDER_WHATSAPP_WEBHOOK_URL;
  if (!webhook) return { sent: false, channel: "whatsapp" as const };
  await postJson(webhook, { to, title, body });
  return { sent: true, channel: "whatsapp" as const };
}
