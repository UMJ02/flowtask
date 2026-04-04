import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Sesión no válida.' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const inviteId = typeof body?.inviteId === 'string' ? body.inviteId : '';

  if (!inviteId) return NextResponse.json({ error: 'La invitación es obligatoria.' }, { status: 400 });

  const { data, error } = await supabase.rpc('accept_organization_invite', { p_invite_id: inviteId });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true, organizationId: data, redirectTo: '/app/organization' });
}
