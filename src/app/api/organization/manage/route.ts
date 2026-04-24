import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { ACTIVE_WORKSPACE_COOKIE, PERSONAL_WORKSPACE_VALUE } from '@/lib/workspace/active-workspace';

export const dynamic = 'force-dynamic';

const TEN_DAYS_MS = 1000 * 60 * 60 * 24 * 10;

function withPersonalWorkspaceCookie(response: NextResponse) {
  response.cookies.set(ACTIVE_WORKSPACE_COOKIE, PERSONAL_WORKSPACE_VALUE, { path: '/', sameSite: 'lax' });
  return response;
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sesión no válida.' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const organizationId = typeof body?.organizationId === 'string' ? body.organizationId : '';
  const action = typeof body?.action === 'string' ? body.action : 'rename';
  const name = typeof body?.name === 'string' ? body.name.trim() : '';

  if (!organizationId) return NextResponse.json({ error: 'No encontramos la organización indicada.' }, { status: 400 });

  const { data: membership } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', organizationId)
    .eq('user_id', user.id)
    .maybeSingle();

  const actorRole = (membership?.role as string | undefined) ?? null;

  if (action === 'reactivate') {
    if (actorRole !== 'admin_global') {
      return NextResponse.json({ error: 'Solo el owner/admin puede reactivar esta organización.' }, { status: 403 });
    }

    const { error } = await supabase
      .from('organizations')
      .update({ deleted_at: null, purge_scheduled_at: null })
      .eq('id', organizationId);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    await supabase.from('organization_members').update({ is_default: false }).eq('user_id', user.id);
    await supabase.from('organization_members').update({ is_default: true }).eq('organization_id', organizationId).eq('user_id', user.id);

    const response = NextResponse.json({ ok: true, message: 'Tu organización volvió a estar activa.', reactivate: true });
    response.cookies.set(ACTIVE_WORKSPACE_COOKIE, organizationId, { path: '/', sameSite: 'lax' });
    return response;
  }

  if (action !== 'rename' || !name) {
    return NextResponse.json({ error: 'Faltan datos para actualizar la organización.' }, { status: 400 });
  }

  if (actorRole !== 'admin_global') {
    return NextResponse.json({ error: 'Solo el owner/admin puede editar la organización.' }, { status: 403 });
  }

  const { error } = await supabase.from('organizations').update({ name }).eq('id', organizationId);

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
    return NextResponse.json({ error: 'El owner principal debe programar la eliminación o transferir el control antes de salir.' }, { status: 409 });
  }

  await supabase.from('organization_members').update({ is_default: false }).eq('organization_id', organizationId).eq('user_id', user.id);
  const { error } = await supabase.from('organization_members').delete().eq('organization_id', organizationId).eq('user_id', user.id);

  return withPersonalWorkspaceCookie(NextResponse.json({ ok: true, message: 'Saliste de la organización.' }));
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sesión no válida.' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const organizationId = typeof body?.organizationId === 'string' ? body.organizationId : '';
  const force = body?.force === true;
  if (!organizationId) return NextResponse.json({ error: 'No encontramos la organización indicada.' }, { status: 400 });

  const admin = createAdminClient();

  const { data: organization, error: organizationError } = await admin
    .from('organizations')
    .select('owner_id, deleted_at')
    .eq('id', organizationId)
    .maybeSingle();

  if (organizationError) return NextResponse.json({ error: organizationError.message }, { status: 400 });
  if (!organization) return NextResponse.json({ error: 'No encontramos la organización indicada.' }, { status: 404 });
  if ((organization.owner_id as string | undefined) !== user.id) {
    return NextResponse.json({ error: 'Solo el owner principal puede eliminar la organización.' }, { status: 403 });
  }

  if (force) {
    const updates = [
      admin.from('organization_members').update({ is_default: false }).eq('organization_id', organizationId),
      admin.from('user_account_modes').update({ default_organization_id: null }).eq('default_organization_id', organizationId),
    ];
    const [resetDefaultResult, resetModesResult] = await Promise.all(updates);
    if (resetDefaultResult.error) return NextResponse.json({ error: resetDefaultResult.error.message }, { status: 400 });
    if (resetModesResult.error && !/relation .* does not exist/i.test(resetModesResult.error.message)) {
      return NextResponse.json({ error: resetModesResult.error.message }, { status: 400 });
    }

    const { error } = await admin.from('organizations').delete().eq('id', organizationId);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return withPersonalWorkspaceCookie(
      NextResponse.json({
        ok: true,
        deleted: true,
        message: 'La organización se eliminó de forma permanente.',
        redirectTo: '/app/organization?deleted=1',
      }),
    );
  }

  const now = new Date();
  const purgeAt = new Date(now.getTime() + TEN_DAYS_MS).toISOString();
  const [resetDefaultResult, scheduleResult, resetModesResult] = await Promise.all([
    admin.from('organization_members').update({ is_default: false }).eq('organization_id', organizationId),
    admin.from('organizations').update({ deleted_at: now.toISOString(), purge_scheduled_at: purgeAt }).eq('id', organizationId),
    admin.from('user_account_modes').update({ default_organization_id: null }).eq('default_organization_id', organizationId),
  ]);
  if (resetDefaultResult.error) return NextResponse.json({ error: resetDefaultResult.error.message }, { status: 400 });
  if (scheduleResult.error) return NextResponse.json({ error: scheduleResult.error.message }, { status: 400 });
  if (resetModesResult.error && !/relation .* does not exist/i.test(resetModesResult.error.message)) {
    return NextResponse.json({ error: resetModesResult.error.message }, { status: 400 });
  }


  return withPersonalWorkspaceCookie(NextResponse.json({
    ok: true,
    scheduled: true,
    purgeScheduledAt: purgeAt,
    daysRemaining: 10,
    message: 'La organización quedó programada para eliminarse en 10 días. Puedes reactivarla desde el switch de workspaces o borrarla definitivamente desde la bandeja de reactivación.',
  }));
}
