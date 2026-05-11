import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ACTIVE_WORKSPACE_COOKIE, PERSONAL_WORKSPACE_VALUE } from '@/lib/workspace/active-workspace';

export const dynamic = 'force-dynamic';

type RpcResult = {
  ok?: boolean;
  error?: string;
  message?: string;
  [key: string]: unknown;
};

const DEFAULT_DELETE_RETENTION_DAYS = 10;

function isMissingRpcError(error?: { code?: string; message?: string } | null) {
  const normalized = `${error?.code ?? ''} ${error?.message ?? ''}`.toLowerCase();
  return (
    error?.code === '42883' ||
    error?.code === 'PGRST202' ||
    normalized.includes('schema cache') ||
    (normalized.includes('function') && normalized.includes('does not exist')) ||
    normalized.includes('could not find the function')
  );
}

async function fallbackScheduleOrganizationDeletion(
  supabase: Awaited<ReturnType<typeof createClient>>,
  organizationId: string,
  retentionDays = DEFAULT_DELETE_RETENTION_DAYS,
) {
  const now = new Date();
  const purgeAt = new Date(now.getTime() + 1000 * 60 * 60 * 24 * retentionDays).toISOString();

  const { error } = await supabase
    .from('organizations')
    .update({
      deleted_at: now.toISOString(),
      purge_scheduled_at: purgeAt,
      purge_after: purgeAt,
      reactivated_at: null,
    })
    .eq('id', organizationId);

  if (error) return { data: null, error };

  return {
    data: {
      ok: true,
      fallback: true,
      organization_id: organizationId,
      deleted_at: now.toISOString(),
      purge_after: purgeAt,
      purge_scheduled_at: purgeAt,
    },
    error: null,
  };
}

async function fallbackRestoreOrganization(
  supabase: Awaited<ReturnType<typeof createClient>>,
  organizationId: string,
) {
  const now = new Date().toISOString();

  const { error } = await supabase
    .from('organizations')
    .update({
      deleted_at: null,
      purge_scheduled_at: null,
      purge_after: null,
      reactivated_at: now,
    })
    .eq('id', organizationId);

  if (error) return { data: null, error };

  return {
    data: {
      ok: true,
      fallback: true,
      organization_id: organizationId,
      restored: true,
      reactivated_at: now,
    },
    error: null,
  };
}


function withPersonalWorkspaceCookie(response: NextResponse) {
  response.cookies.set(ACTIVE_WORKSPACE_COOKIE, PERSONAL_WORKSPACE_VALUE, { path: '/', sameSite: 'lax' });
  return response;
}

function withOrganizationWorkspaceCookie(response: NextResponse, organizationId: string) {
  response.cookies.set(ACTIVE_WORKSPACE_COOKIE, organizationId, { path: '/', sameSite: 'lax' });
  return response;
}

function getSupabaseStatus(code?: string, message?: string) {
  const normalized = `${code ?? ''} ${message ?? ''}`.toLowerCase();

  if (code === '42883' || code === 'PGRST202' || normalized.includes('schema cache') || normalized.includes('could not find the function') || normalized.includes('function') && normalized.includes('does not exist')) {
    return {
      status: 501,
      message: 'La función RPC de organización no existe en Supabase. Aplica la migración v58.24.9 antes de continuar.',
    };
  }

  if (code === '42501' || normalized.includes('permission denied') || normalized.includes('permisos')) {
    return {
      status: 403,
      message: 'No tienes permisos para ejecutar esta acción sobre la organización.',
    };
  }

  if (normalized.includes('invalid api key')) {
    return {
      status: 500,
      message: 'La configuración de Supabase en el servidor tiene una API key inválida.',
    };
  }

  return {
    status: 400,
    message: message || 'No fue posible completar la acción de organización.',
  };
}

function rpcJsonError(error: { code?: string; message?: string; details?: string | null; hint?: string | null }) {
  const mapped = getSupabaseStatus(error.code, error.message);
  if (process.env.NODE_ENV !== 'production') {
    console.error('[organization:manage:rpc-error]', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      mapped,
    });
  }
  return NextResponse.json(
    {
      error: mapped.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    },
    { status: mapped.status },
  );
}

function rpcBusinessError(result: RpcResult | null | undefined, fallback: string, status = 400) {
  return NextResponse.json({ error: result?.error ?? result?.message ?? fallback, result }, { status });
}

async function clearOrganizationDefaultForUser(
  supabase: Awaited<ReturnType<typeof createClient>>,
  organizationId: string,
  userId: string,
) {
  const { error: memberError } = await supabase
    .from('organization_members')
    .update({ is_default: false })
    .eq('organization_id', organizationId)
    .eq('user_id', userId);

  if (memberError && process.env.NODE_ENV !== 'production') {
    console.warn('[organization:manage:clear-default-member]', memberError);
  }

  const { error: modeError } = await supabase
    .from('user_account_modes')
    .update({ default_organization_id: null })
    .eq('default_organization_id', organizationId)
    .eq('user_id', userId);

  if (
    modeError &&
    !/relation .* does not exist/i.test(modeError.message) &&
    process.env.NODE_ENV !== 'production'
  ) {
    console.warn('[organization:manage:clear-default-mode]', modeError);
  }
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

    let { data, error } = await supabase.rpc('restore_organization', {
      p_organization_id: organizationId,
    });

    if (error && isMissingRpcError(error)) {
      const fallback = await fallbackRestoreOrganization(supabase, organizationId);
      data = fallback.data;
      error = fallback.error;
    }

    if (error) return rpcJsonError(error);

    const result = data as RpcResult | null;
    if (result?.ok === false) {
      return rpcBusinessError(result, 'No fue posible reactivar esta organización.');
    }

    await supabase.from('organization_members').update({ is_default: false }).eq('user_id', user.id);
    await supabase.from('organization_members').update({ is_default: true }).eq('organization_id', organizationId).eq('user_id', user.id);

    const response = NextResponse.json({
      ok: true,
      message: result?.message ?? 'Tu organización volvió a estar activa.',
      reactivate: true,
      result,
    });
    return withOrganizationWorkspaceCookie(response, organizationId);
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

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

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

  const { data: membership } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', organizationId)
    .eq('user_id', user.id)
    .maybeSingle();

  const actorRole = (membership?.role as string | undefined) ?? null;
  if (actorRole !== 'admin_global') {
    return NextResponse.json({ error: 'Solo el owner/admin puede eliminar esta organización.' }, { status: 403 });
  }

  if (force) {
    const { data, error } = await supabase.rpc('purge_organization_data', {
      p_organization_id: organizationId,
      p_force: true,
    });

    if (error) return rpcJsonError(error);

    const result = data as RpcResult | null;
    if (result?.ok === false) {
      return rpcBusinessError(result, 'No fue posible eliminar la organización de forma permanente.');
    }

    await clearOrganizationDefaultForUser(supabase, organizationId, user.id);

    return withPersonalWorkspaceCookie(
      NextResponse.json({
        ok: true,
        deleted: true,
        message: result?.message ?? 'La organización se eliminó de forma permanente.',
        result,
        redirectTo: '/app/organization?deleted=1',
      }),
    );
  }

  let { data, error } = await supabase.rpc('schedule_organization_deletion', {
    p_organization_id: organizationId,
    p_retention_days: DEFAULT_DELETE_RETENTION_DAYS,
  });

  if (error && isMissingRpcError(error)) {
    const fallback = await fallbackScheduleOrganizationDeletion(supabase, organizationId, DEFAULT_DELETE_RETENTION_DAYS);
    data = fallback.data;
    error = fallback.error;
  }

  if (error) return rpcJsonError(error);

  const result = data as RpcResult | null;
  if (result?.ok === false) {
    return rpcBusinessError(result, 'No fue posible programar la eliminación de la organización.');
  }

  await clearOrganizationDefaultForUser(supabase, organizationId, user.id);

  return withPersonalWorkspaceCookie(
    NextResponse.json({
      ok: true,
      scheduled: true,
      purgeScheduledAt: result?.purge_after ?? result?.purge_scheduled_at ?? null,
      daysRemaining: DEFAULT_DELETE_RETENTION_DAYS,
      message: 'La organización quedó programada para eliminarse en 10 días. Puedes reactivarla desde el switch de workspaces o borrarla definitivamente desde la bandeja de reactivación.',
      result,
    }),
  );
}
