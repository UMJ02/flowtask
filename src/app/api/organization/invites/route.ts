import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getOrganizationBillingSummary } from '@/lib/queries/billing';

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
      return NextResponse.json({ error: 'Ese usuario ya forma parte del workspace.' }, { status: 409 });
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
    return NextResponse.json({ error: 'Ya existe una invitación pendiente para ese correo.' }, { status: 409 });
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

  const { error } = await supabase.from('organization_invites').insert({
    organization_id: organizationId,
    email,
    role,
    status: 'pending',
    created_by: user.id,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true, message: 'Invitación creada correctamente.' });
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
