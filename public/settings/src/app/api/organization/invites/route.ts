import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getOrganizationBillingSummary } from '@/lib/queries/billing';
import { getInviteEmailConfigStatus, sendOrganizationInviteEmail } from '@/lib/email/resend';

export const dynamic = 'force-dynamic';

const ALLOWED_ROLES = new Set(['manager', 'member', 'viewer']);

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Sesión no válida.' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const organizationId = typeof body?.organizationId === 'string' ? body.organizationId : '';
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const role = typeof body?.role === 'string' ? body.role : 'member';
  const inviteIdToResend = typeof body?.inviteId === 'string' ? body.inviteId : '';

  if (inviteIdToResend) {
    const { data: actorMembership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .maybeSingle();

    const actorRole = (actorMembership?.role as string | undefined) ?? null;
    if (!actorRole || !['admin_global', 'manager'].includes(actorRole)) {
      return NextResponse.json({ error: 'Tu rol actual no permite reenviar invitaciones.' }, { status: 403 });
    }

    const { data: organization } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', organizationId)
      .maybeSingle();

    const { data: invite } = await supabase
      .from('organization_invites')
      .select('id,email,role,status')
      .eq('id', inviteIdToResend)
      .eq('organization_id', organizationId)
      .maybeSingle();

    if (!invite?.id) return NextResponse.json({ error: 'No encontramos la invitación indicada.' }, { status: 404 });
    if (invite.status !== 'pending') return NextResponse.json({ error: 'Solo puedes reenviar invitaciones pendientes.' }, { status: 409 });

    const emailResult = await sendOrganizationInviteEmail({
      email: invite.email,
      organizationName: organization?.name ?? 'tu organización',
      role: invite.role,
      invitedByName: user.email ?? null,
    });

    if (!emailResult.sent) {
      return NextResponse.json({
        ok: true,
        delivered: false,
        emailReady: getInviteEmailConfigStatus(),
        message: emailResult.configured
          ? 'La invitación sigue activa, pero el correo no pudo enviarse. Revisa el remitente, el dominio y el proveedor.'
          : 'La invitación sigue activa, pero falta completar la configuración de correo para entregarla.'
      });
    }

    return NextResponse.json({ ok: true, delivered: true, message: 'Correo reenviado correctamente.' });
  }

  if (!organizationId || !email) {
    return NextResponse.json({ error: 'Faltan datos para enviar la invitación.' }, { status: 400 });
  }

  if (!ALLOWED_ROLES.has(role)) {
    return NextResponse.json({ error: 'Rol de invitación no permitido.' }, { status: 400 });
  }

  const { data: actorMembership } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', organizationId)
    .eq('user_id', user.id)
    .maybeSingle();

  const actorRole = (actorMembership?.role as string | undefined) ?? null;
  if (!actorRole || !['admin_global', 'manager'].includes(actorRole)) {
    return NextResponse.json({ error: 'Tu rol actual no permite invitar miembros.' }, { status: 403 });
  }

  if (actorRole !== 'admin_global' && role === 'manager') {
    return NextResponse.json({ error: 'Solo el owner/admin puede invitar managers.' }, { status: 403 });
  }

  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (existingProfile?.id) {
    const { data: existingMembership } = await supabase
      .from('organization_members')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('user_id', existingProfile.id)
      .maybeSingle();

    if (existingMembership?.id) {
      return NextResponse.json({ error: 'Ese correo ya forma parte de esta organización.' }, { status: 409 });
    }
  }

  const { data: existingInvite } = await supabase
    .from('organization_invites')
    .select('id')
    .eq('organization_id', organizationId)
    .eq('email', email)
    .eq('status', 'pending')
    .maybeSingle();

  if (existingInvite?.id) {
    return NextResponse.json({ ok: true, existing: true, emailReady: getInviteEmailConfigStatus(), message: 'Ese correo ya tenía una invitación pendiente. La dejamos activa para que pueda aceptarla o reenviarla.' });
  }

  const billing = await getOrganizationBillingSummary(organizationId);
  if (billing) {
    const { count: pendingCount } = await supabase
      .from('organization_invites')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('status', 'pending');

    if ((billing.seatsUsed + (pendingCount ?? 0)) >= billing.seatsIncluded) {
      return NextResponse.json({ error: 'El plan actual ya no tiene cupos libres para nuevas invitaciones.' }, { status: 409 });
    }
  }

  const { data: organization } = await supabase.from('organizations').select('name').eq('id', organizationId).maybeSingle();

  const { error } = await supabase.from('organization_invites').insert({
    organization_id: organizationId,
    email,
    role,
    status: 'pending',
    created_by: user.id,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const emailResult = await sendOrganizationInviteEmail({
    email,
    organizationName: organization?.name ?? 'tu organización',
    role,
    invitedByName: user.email ?? null,
  });

  if (!emailResult.sent) {
    return NextResponse.json({
      ok: true,
      delivered: false,
      emailReady: getInviteEmailConfigStatus(),
      message: emailResult.configured
        ? 'Invitación creada. El correo no pudo salir; puedes reenviarlo desde la bandeja de invitaciones.'
        : 'Invitación creada. Falta completar la configuración del proveedor de correo para entregar el email.'
    });
  }

  return NextResponse.json({ ok: true, delivered: true, emailReady: getInviteEmailConfigStatus(), message: 'Invitación creada y correo enviado correctamente.' });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Sesión no válida.' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const inviteId = typeof body?.inviteId === 'string' ? body.inviteId : '';
  const status = typeof body?.status === 'string' ? body.status : '';

  if (!inviteId || !['revoked'].includes(status)) {
    return NextResponse.json({ error: 'Acción de invitación no válida.' }, { status: 400 });
  }

  const { data: invite } = await supabase
    .from('organization_invites')
    .select('id, organization_id, status')
    .eq('id', inviteId)
    .maybeSingle();

  if (!invite?.id) return NextResponse.json({ error: 'No encontramos la invitación indicada.' }, { status: 404 });

  const { data: actorMembership } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', invite.organization_id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (!actorMembership?.role || !['admin_global', 'manager'].includes(actorMembership.role as string)) {
    return NextResponse.json({ error: 'Tu rol actual no permite gestionar invitaciones.' }, { status: 403 });
  }

  const { error } = await supabase
    .from('organization_invites')
    .update({ status })
    .eq('id', inviteId);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true, message: 'Invitación actualizada correctamente.' });
}
