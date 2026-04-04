import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

function resolvePlanLimits(planCode?: string | null) {
  switch ((planCode ?? '').toLowerCase()) {
    case 'basic':
      return { planName: 'Basic', seats: 10, projects: 40, storage: 25 };
    case 'plus':
      return { planName: 'Plus', seats: 50, projects: 160, storage: 100 };
    case 'business':
      return { planName: 'Business', seats: 9999, projects: 9999, storage: 500 };
    default:
      return { planName: 'Growth', seats: 10, projects: 40, storage: 25 };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const customSlug = typeof body?.slug === 'string' ? body.slug.trim() : '';
    if (!name) return NextResponse.json({ ok: false, error: 'Ingresa el nombre de la organización.' }, { status: 400 });

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

    const admin = createAdminClient();
    const [modeRes, membershipRes, organizationsRes, activationRes] = await Promise.all([
      admin.from('user_account_modes').select('*').eq('user_id', user.id).maybeSingle(),
      admin.from('organization_members').select('organization_id, role').eq('user_id', user.id).in('role', ['admin_global', 'manager']).limit(1).maybeSingle(),
      admin.from('organization_members').select('organization_id', { count: 'exact', head: true }).eq('user_id', user.id).in('role', ['admin_global', 'manager']),
      admin.from('activation_codes').select('id, organization_limit, seat_limit, project_limit, storage_gb_limit, billing_cycle').eq('used_by_user_id', user.id).eq('is_used', true).is('organization_id', null).order('used_at', { ascending: false }).limit(1).maybeSingle(),
    ]);

    const account = modeRes.data;
    if (!account || account.account_mode !== 'team_owner') {
      return NextResponse.json({ ok: false, error: 'Primero debes activar un plan de equipo o canjear un código corporativo.' }, { status: 400 });
    }
    if (membershipRes.data?.organization_id) {
      return NextResponse.json({ ok: false, error: 'Tu cuenta ya administra una organización activa.' }, { status: 400 });
    }
    const managedOrganizations = organizationsRes.count ?? 0;
    const organizationLimit = activationRes.data?.organization_limit ?? 1;
    if (managedOrganizations >= organizationLimit) {
      return NextResponse.json({ ok: false, error: 'Tu plan actual ya alcanzó el límite de organizaciones disponibles.' }, { status: 400 });
    }

    const baseSlug = slugify(customSlug || name) || `workspace-${user.id.slice(0, 6)}`;
    let finalSlug = baseSlug;
    for (let attempt = 0; attempt < 6; attempt += 1) {
      const { data: existing } = await admin.from('organizations').select('id').eq('slug', finalSlug).maybeSingle();
      if (!existing) break;
      finalSlug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
    }

    const limits = resolvePlanLimits(account.selected_plan_code as string | null | undefined);
    const resolvedSeats = activationRes.data?.seat_limit ?? limits.seats;
    const resolvedProjects = activationRes.data?.project_limit ?? limits.projects;
    const resolvedStorage = activationRes.data?.storage_gb_limit ?? limits.storage;
    const billingCycle = (activationRes.data?.billing_cycle ?? account.billing_cycle) === 'monthly' ? 'monthly' : 'annual';
    const subscriptionStatus = account.activation_source === 'activation_code' ? 'active' : 'trial';

    const { data: organization, error: organizationError } = await admin
      .from('organizations')
      .insert({ name, slug: finalSlug, owner_id: user.id })
      .select('id, name, slug')
      .single();
    if (organizationError || !organization) {
      return NextResponse.json({ ok: false, error: organizationError?.message ?? 'No se pudo crear la organización.' }, { status: 400 });
    }

    const resetDefaults = await admin.from('organization_members').update({ is_default: false }).eq('user_id', user.id);
    const memberAttach = await admin.from('organization_members').insert({ organization_id: organization.id, user_id: user.id, role: 'admin_global', is_default: true });
    const subscriptionUpsert = await admin.from('organization_subscriptions').upsert({
      organization_id: organization.id,
      plan_code: account.selected_plan_code ?? 'basic',
      plan_name: account.selected_plan_name ?? limits.planName,
      status: subscriptionStatus,
      billing_cycle: billingCycle,
      trial_ends_at: subscriptionStatus === 'trial' ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString() : null,
      renews_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString(),
      expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString(),
      last_renewed_at: new Date().toISOString(),
      auto_renew: true,
      activation_code_id: activationRes.data?.id ?? null,
      seats_included: resolvedSeats,
      seats_used: 1,
      projects_included: resolvedProjects,
      projects_used: 0,
      storage_gb_included: resolvedStorage,
      storage_gb_used: 0,
    }, { onConflict: 'organization_id' });
    const modeUpdate = await admin.from('user_account_modes').update({ default_organization_id: organization.id, onboarding_completed: true }).eq('user_id', user.id);
    const codeLink = account.activation_source === 'activation_code'
      ? await admin.from('activation_codes').update({ organization_id: organization.id }).eq('used_by_user_id', user.id).is('organization_id', null)
      : { error: null };

    const anyError = resetDefaults.error ?? memberAttach.error ?? subscriptionUpsert.error ?? modeUpdate.error ?? codeLink.error;
    if (anyError) return NextResponse.json({ ok: false, error: anyError.message }, { status: 400 });

    return NextResponse.json({ ok: true, message: `Workspace ${organization.name} creado. Ya quedaste como admin inicial.`, redirectTo: '/app/organization', data: { organizationId: organization.id, slug: organization.slug } });
  } catch {
    return NextResponse.json({ ok: false, error: 'unexpected_error' }, { status: 500 });
  }
}
