import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ACTIVE_WORKSPACE_COOKIE, PERSONAL_WORKSPACE_VALUE, normalizeWorkspacePreference } from '@/lib/workspace/active-workspace';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Sesión no válida.' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const preference = normalizeWorkspacePreference(body?.workspace);

  if (!preference) {
    return NextResponse.json({ error: 'El workspace activo es obligatorio.' }, { status: 400 });
  }

  if (preference !== PERSONAL_WORKSPACE_VALUE) {
    const { data: membership } = await supabase
      .from('organization_members')
      .select('organization_id, organizations!inner(deleted_at)')
      .eq('user_id', user.id)
      .eq('organization_id', preference)
      .maybeSingle();

    if (!membership) {
      return NextResponse.json({ error: 'No tienes acceso a ese workspace.' }, { status: 403 });
    }
    const organization = Array.isArray((membership as any).organizations) ? (membership as any).organizations[0] : (membership as any).organizations;
    if (organization?.deleted_at) {
      return NextResponse.json({ error: 'Ese workspace está pendiente de eliminación. Reactívalo antes de entrar.' }, { status: 409 });
    }
  }

  await supabase.from('organization_members').update({ is_default: preference !== PERSONAL_WORKSPACE_VALUE }).eq('user_id', user.id).neq('organization_id', preference === PERSONAL_WORKSPACE_VALUE ? '00000000-0000-0000-0000-000000000000' : preference);

  if (preference !== PERSONAL_WORKSPACE_VALUE) {
    await supabase.from('organization_members').update({ is_default: true }).eq('user_id', user.id).eq('organization_id', preference);
  }

  const response = NextResponse.json({ ok: true, workspace: preference });
  response.cookies.set(ACTIVE_WORKSPACE_COOKIE, preference, {
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 365,
  });

  return response;
}
