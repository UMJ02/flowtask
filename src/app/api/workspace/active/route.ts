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
      .select('organization_id')
      .eq('user_id', user.id)
      .eq('organization_id', preference)
      .maybeSingle();

    if (!membership) {
      return NextResponse.json({ error: 'No tienes acceso a ese workspace.' }, { status: 403 });
    }
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
