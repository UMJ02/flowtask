import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const VALID_ROLES = new Set(['manager', 'member', 'viewer']);

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Debes iniciar sesión.' }, { status: 401 });

  const body = await request.json().catch(() => null) as { organizationId?: string; email?: string; role?: string } | null;
  const organizationId = body?.organizationId?.trim();
  const email = body?.email?.trim().toLowerCase();
  const role = body?.role?.trim();

  if (!organizationId || !email || !role || !VALID_ROLES.has(role)) return NextResponse.json({ error: 'Solicitud inválida para invitar miembro.' }, { status: 400 });

  const { data: membership } = await supabase.from('organization_members').select('role').eq('organization_id', organizationId).eq('user_id', user.id).maybeSingle();
  const actingRole = membership?.role as string | undefined;
  if (!actingRole || !['admin_global', 'manager'].includes(actingRole)) return NextResponse.json({ error: 'No tienes permiso para enviar invitaciones.' }, { status: 403 });
  if (role === 'manager' && actingRole !== 'admin_global') return NextResponse.json({ error: 'Solo el admin puede invitar managers.' }, { status: 403 });

  const [{ count: memberCount }, { count: pendingCount }, { data: subscription }] = await Promise.all([
    supabase.from('organization_members').select('id', { count: 'exact', head: true }).eq('organization_id', organizationId),
    supabase.from('organization_invites').select('id', { count: 'exact', head: true }).eq('organization_id', organizationId).eq('status', 'pending'),
    supabase.from('organization_subscriptions').select('seats_included').eq('organization_id', organizationId).maybeSingle(),
  ]);

  const seatsIncluded = Number(subscription?.seats_included ?? 0);
  const reservedSeats = Number(memberCount ?? 0) + Number(pendingCount ?? 0);
  if (seatsIncluded > 0 && reservedSeats >= seatsIncluded) return NextResponse.json({ error: 'El plan actual alcanzó el máximo de miembros disponibles.' }, { status: 409 });

  const { data: existingProfile } = await supabase.from('profiles').select('id').ilike('email', email).maybeSingle();
  if (existingProfile?.id) {
    const { data: existingMember } = await supabase.from('organization_members').select('id').eq('organization_id', organizationId).eq('user_id', existingProfile.id).maybeSingle();
    if (existingMember?.id) return NextResponse.json({ error: 'Ese usuario ya forma parte de la organización.' }, { status: 409 });
  }

  const { data: existingInvite } = await supabase.from('organization_invites').select('id').eq('organization_id', organizationId).ilike('email', email).eq('status', 'pending').maybeSingle();
  if (existingInvite?.id) return NextResponse.json({ error: 'Ya existe una invitación pendiente para ese correo.' }, { status: 409 });

  const { data, error } = await supabase.from('organization_invites').insert({ organization_id: organizationId, email, role, status: 'pending' }).select('id').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, id: data.id });
}
