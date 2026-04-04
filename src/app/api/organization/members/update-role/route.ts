import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const VALID_ROLES = new Set(['admin_global', 'manager', 'member', 'viewer']);

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Debes iniciar sesión.' }, { status: 401 });

  const body = await request.json().catch(() => null) as { organizationId?: string; memberId?: string; role?: string } | null;
  const organizationId = body?.organizationId?.trim();
  const memberId = body?.memberId?.trim();
  const role = body?.role?.trim();

  if (!organizationId || !memberId || !role || !VALID_ROLES.has(role)) return NextResponse.json({ error: 'Solicitud inválida para actualizar rol.' }, { status: 400 });

  const { data: actingMembership } = await supabase.from('organization_members').select('role').eq('organization_id', organizationId).eq('user_id', user.id).maybeSingle();
  if (actingMembership?.role !== 'admin_global') return NextResponse.json({ error: 'Solo un admin puede cambiar roles.' }, { status: 403 });

  const [{ data: organization }, { data: targetMember }] = await Promise.all([
    supabase.from('organizations').select('owner_id').eq('id', organizationId).maybeSingle(),
    supabase.from('organization_members').select('id,user_id,role').eq('id', memberId).eq('organization_id', organizationId).maybeSingle(),
  ]);

  if (!targetMember?.id) return NextResponse.json({ error: 'No encontramos al miembro indicado.' }, { status: 404 });
  if (organization?.owner_id && targetMember.user_id === organization.owner_id && role !== 'admin_global') return NextResponse.json({ error: 'El owner principal debe conservar el rol admin.' }, { status: 409 });

  const { error } = await supabase.from('organization_members').update({ role }).eq('id', memberId).eq('organization_id', organizationId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
