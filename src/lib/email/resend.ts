const RESEND_API_URL = "https://api.resend.com/emails";

function resolveBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || process.env.FLOWTASK_BASE_URL || 'http://localhost:3000';
}

export async function sendOrganizationInviteEmail({
  email,
  organizationName,
  role,
  invitedByName,
}: {
  email: string;
  organizationName: string;
  role: string;
  invitedByName?: string | null;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.INVITE_EMAIL_FROM || process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    return { sent: false, configured: false, error: 'Proveedor de correo no configurado.' } as const;
  }

  const appUrl = resolveBaseUrl().replace(/\/$/, '');
  const subject = `Te invitaron a ${organizationName} en FlowTask`;
  const safeRole = role.replaceAll('_', ' ');
  const inviter = invitedByName?.trim() ? invitedByName.trim() : 'Tu equipo';
  const html = `
    <div style="font-family:Inter,Arial,sans-serif;color:#0f172a;line-height:1.5">
      <h2 style="margin:0 0 12px">Tienes una invitación pendiente</h2>
      <p>${inviter} te invitó a unirte a <strong>${organizationName}</strong> con el rol <strong>${safeRole}</strong>.</p>
      <p>Entra a FlowTask para aceptarla desde tu bandeja de invitaciones.</p>
      <p style="margin:24px 0">
        <a href="${appUrl}/app/organization" style="display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:600">Abrir invitación</a>
      </p>
      <p style="color:#475569;font-size:14px">Si no esperabas este correo, puedes ignorarlo.</p>
    </div>
  `;

  const response = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const payload = await response.text().catch(() => '');
    return { sent: false, configured: true, error: payload || 'No fue posible enviar el correo.' } as const;
  }

  return { sent: true, configured: true, error: null } as const;
}
