type ExternalArgs = {
  to: string;
  title: string;
  body?: string | null;
};

export type ExternalDeliveryResult = {
  sent: boolean;
  channel: 'email' | 'whatsapp';
  error?: string;
  providerResponse?: Record<string, unknown>;
};

async function postJson(url: string, payload: Record<string, unknown>) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  let parsed: Record<string, unknown> = {};
  try {
    parsed = text ? JSON.parse(text) : {};
  } catch {
    parsed = text ? { raw: text } : {};
  }

  if (!response.ok) {
    throw new Error(`Webhook respondió ${response.status}`);
  }

  return parsed;
}

export async function sendOptionalEmailNotification({ to, title, body }: ExternalArgs): Promise<ExternalDeliveryResult> {
  const webhook = process.env.REMINDER_EMAIL_WEBHOOK_URL;
  if (!webhook) return { sent: false, channel: "email", error: "Webhook de email no configurado" };
  try {
    const providerResponse = await postJson(webhook, { to, subject: title, body, from: process.env.REMINDER_FROM_EMAIL ?? undefined });
    return { sent: true, channel: "email", providerResponse };
  } catch (error) {
    return { sent: false, channel: "email", error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}

export async function sendOptionalWhatsAppNotification({ to, title, body }: ExternalArgs): Promise<ExternalDeliveryResult> {
  const webhook = process.env.REMINDER_WHATSAPP_WEBHOOK_URL;
  if (!webhook) return { sent: false, channel: "whatsapp", error: "Webhook de WhatsApp no configurado" };
  try {
    const providerResponse = await postJson(webhook, { to, title, body });
    return { sent: true, channel: "whatsapp", providerResponse };
  } catch (error) {
    return { sent: false, channel: "whatsapp", error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}
