import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ACTIVE_WORKSPACE_COOKIE, PERSONAL_WORKSPACE_VALUE } from '@/lib/workspace/active-workspace';

export const dynamic = 'force-dynamic';

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sesión no válida.' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const organizationId = typeof body?.organizationId === 'string' ? body.organizationId : '';
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  if (!organizationId || !name) return NextResponse.json({ error: 'Faltan datos para actualizar la organización.' }, { status: 400 });

  const { data: membership } = await supabase.from('organization_members').select('role').eq('organization_id', organizationId).eq('user_id', user.id).maybeSingle();
  if ((membership?.role as string | undefined) !== 'admin_global') {
    return NextResponse.json({ error: 'Solo el owner/admin puede editar la organización.' }, { status: 403 });
  }

  const { error } = await supabase.from('organizations').update({ name }).eq('id', organizationId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true, message: 'Nombre de la organización actualizado.' });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sesión no válida.' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const organizationId = typeof body?.organizationId === 'string' ? body.organizationId : '';
  if (!organizationId) return NextResponse.json({ error: 'No encontramos la organización indicada.' }, { status: 400 });

  const { data: organization } = await supabase.from('organizations').select('owner_id').eq('id', organizationId).maybeSingle();
  if ((organization?.owner_id as string | undefined) === user.id) {
    return NextResponse.json({ error: 'El owner principal debe eliminar la organización o transferir el control antes de salir.' }, { status: 409 });
  }

  const { error } = await supabase.from('organization_members').delete().eq('organization_id', organizationId).eq('user_id', user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const response = NextResponse.json({ ok: true, message: 'Saliste de la organización.' });
  response.cookies.set(ACTIVE_WORKSPACE_COOKIE, PERSONAL_WORKSPACE_VALUE, { path: '/', sameSite: 'lax' });
  return response;
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sesión no válida.' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const organizationId = typeof body?.organizationId === 'string' ? body.organizationId : '';
  if (!organizationId) return NextResponse.json({ error: 'No encontramos la organización indicada.' }, { status: 400 });

  const { data: organization } = await supabase.from('organizations').select('owner_id').eq('id', organizationId).maybeSingle();
  if ((organization?.owner_id as string | undefined) !== user.id) {
    return NextResponse.json({ error: 'Solo el owner principal puede eliminar la organización.' }, { status: 403 });
  }

  const { error } = await supabase.from('organizations').delete().eq('id', organizationId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const response = NextResponse.json({ ok: true, message: 'Organización eliminada.' });
  response.cookies.set(ACTIVE_WORKSPACE_COOKIE, PERSONAL_WORKSPACE_VALUE, { path: '/', sameSite: 'lax' });
  return response;
}
