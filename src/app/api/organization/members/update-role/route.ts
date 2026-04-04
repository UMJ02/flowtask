import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { formatOrganizationRole } from '@/lib/organization/labels';

export const dynamic = 'force-dynamic';

const ALLOWED_ROLES = new Set(['admin_global', 'manager', 'member', 'viewer']);

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Sesión no válida.' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const memberId = typeof body?.memberId === 'string' ? body.memberId : '';
  const role = typeof body?.role === 'string' ? body.role : '';

  if (!memberId || !ALLOWED_ROLES.has(role)) {
    return NextResponse.json({ error: 'Datos inválidos para actualizar el rol.' }, { status: 400 });
  }

  const { data: member } = await supabase
    .from('organization_members')
    .select('id, organization_id, user_id, role')
    .eq('id', memberId)
    .maybeSingle();

  if (!member?.id) return NextResponse.json({ error: 'No encontramos el miembro indicado.' }, { status: 404 });

  const { data: actorMembership } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', member.organization_id)
    .eq('user_id', user.id)
    .maybeSingle();

  if ((actorMembership?.role as string | undefined) !== 'admin_global') {
    return NextResponse.json({ error: 'Solo el owner/admin puede reasignar roles.' }, { status: 403 });
  }

  const { data: organization } = await supabase
    .from('organizations')
    .select('owner_id')
    .eq('id', member.organization_id)
    .maybeSingle();

  if ((organization?.owner_id as string | undefined) === member.user_id) {
    return NextResponse.json({ error: 'El owner principal no puede perder su rol desde esta vista.' }, { status: 409 });
  }

  const { error } = await supabase.from('organization_members').update({ role }).eq('id', memberId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true, message: `Rol actualizado a ${formatOrganizationRole(role)}.` });
}
