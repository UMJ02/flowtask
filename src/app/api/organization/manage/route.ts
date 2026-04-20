import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { ACTIVE_WORKSPACE_COOKIE, PERSONAL_WORKSPACE_VALUE } from '@/lib/workspace/active-workspace';

export const dynamic = 'force-dynamic';

const TEN_DAYS_MS = 1000 * 60 * 60 * 24 * 10;

function withPersonalWorkspaceCookie(response: NextResponse) {
  response.cookies.set(ACTIVE_WORKSPACE_COOKIE, PERSONAL_WORKSPACE_VALUE, {
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function PATCH(request: Request) {
  const { supabase, user } = await getAuthenticatedUser();
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
    response.cookies.set(ACTIVE_WORKSPACE_COOKIE, organizationId, { path: '/', sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 24 * 365 });
    return response;
  }

  if (action !== 'rename' || !name) {
    return NextResponse.json({ error: 'Faltan datos para actualizar la organización.' }, { status: 400 });
  }

  if (actorRole !== 'admin_global') {
    return NextResponse.json({ error: 'Solo el owner/admin puede editar la organización.' }, { status: 403 });
  }

  const { error } = await supabase.from('organizations').update({ name }).eq('id', organizationId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true, message: 'Nombre de la organización actualizado.' });
}

export async function POST(request: Request) {
  const { supabase, user } = await getAuthenticatedUser();
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
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return withPersonalWorkspaceCookie(NextResponse.json({ ok: true, message: 'Saliste de la organización.' }));
}

export async function DELETE(request: Request) {
  const { supabase, user } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Sesión no válida.' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const organizationId = typeof body?.organizationId === 'string' ? body.organizationId.trim() : '';
  const force = body?.force === true;

  if (!organizationId) {
    return NextResponse.json({ error: 'No encontramos la organización indicada.' }, { status: 400 });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'No fue posible inicializar el cliente administrativo.' }, { status: 500 });
  }

  const { data: organization, error: organizationError } = await admin
    .from('organizations')
    .select('id, owner_id, deleted_at, purge_scheduled_at')
    .eq('id', organizationId)
    .maybeSingle();

  if (organizationError) {
    return NextResponse.json({ error: organizationError.message }, { status: 400 });
  }

  if (!organization) {
    return withPersonalWorkspaceCookie(NextResponse.json({ ok: true, deleted: true, message: 'La organización ya no existe.', redirectTo: '/app/organization?deleted=1' }));
  }

  if ((organization.owner_id as string | null) !== user.id) {
    return NextResponse.json({ error: 'Solo el owner principal puede eliminar la organización.' }, { status: 403 });
  }

  if (force) {
    const cleanupSteps = [
      admin.from('organization_members').update({ is_default: false }).eq('organization_id', organizationId),
      admin.from('user_account_modes').update({ default_organization_id: null }).eq('default_organization_id', organizationId),
    ] as const;

    for (const step of cleanupSteps) {
      const { error } = await step;
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    const { error: deleteError } = await admin.from('organizations').delete().eq('id', organizationId);
    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 400 });
    }

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

  const { error: resetDefaultsError } = await admin
    .from('organization_members')
    .update({ is_default: false })
    .eq('organization_id', organizationId);

  if (resetDefaultsError) {
    return NextResponse.json({ error: resetDefaultsError.message }, { status: 400 });
  }

  const { error: clearModesError } = await admin
    .from('user_account_modes')
    .update({ default_organization_id: null })
    .eq('default_organization_id', organizationId);

  if (clearModesError) {
    return NextResponse.json({ error: clearModesError.message }, { status: 400 });
  }

  const { error } = await admin
    .from('organizations')
    .update({ deleted_at: now.toISOString(), purge_scheduled_at: purgeAt })
    .eq('id', organizationId);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return withPersonalWorkspaceCookie(
    NextResponse.json({
      ok: true,
      scheduled: true,
      purgeScheduledAt: purgeAt,
      daysRemaining: 10,
      message: 'La organización quedó programada para eliminarse en 10 días. Puedes reactivarla antes de la fecha límite o borrarla definitivamente desde la bandeja de reactivación.',
    }),
  );
}
