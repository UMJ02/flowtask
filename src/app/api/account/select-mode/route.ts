import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const accountMode = body?.accountMode;
    const rawPlanCode = typeof body?.selectedPlanCode === 'string' ? body.selectedPlanCode.trim().toLowerCase() : null;
    const rawPlanName = typeof body?.selectedPlanName === 'string' ? body.selectedPlanName.trim() : null;
    const billingCycle = body?.billingCycle === 'monthly' ? 'monthly' : 'annual';

    if (!['individual', 'team_owner', 'team_member'].includes(accountMode)) {
      return NextResponse.json({ ok: false, error: 'Modo de cuenta inválido.' }, { status: 400 });
    }

    const selectedPlanCode = accountMode === 'individual' ? 'individual' : rawPlanCode;
    const selectedPlanName = accountMode === 'individual' ? 'Individual' : rawPlanName;
    if (accountMode === 'team_owner' && !['basic', 'plus', 'business'].includes(selectedPlanCode ?? '')) {
      return NextResponse.json({ ok: false, error: 'Selecciona un plan de equipo válido.' }, { status: 400 });
    }
    if (accountMode === 'team_owner' && !selectedPlanName) {
      return NextResponse.json({ ok: false, error: 'Falta el nombre del plan.' }, { status: 400 });
    }
    const onboardingCompleted = accountMode === 'individual';

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

    const payload = {
      user_id: user.id,
      account_mode: accountMode,
      selected_plan_code: selectedPlanCode,
      selected_plan_name: selectedPlanName,
      billing_cycle: billingCycle,
      activation_source: 'self_serve',
      onboarding_completed: onboardingCompleted,
      ...(accountMode === 'individual' ? { default_organization_id: null } : {}),
    };

    const { error } = await supabase.from('user_account_modes').upsert(payload, { onConflict: 'user_id' });
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    return NextResponse.json({
      ok: true,
      data: payload,
      redirectTo: accountMode === 'individual' ? '/app/dashboard' : '/app/organization',
      message: accountMode === 'individual' ? 'Tu cuenta quedó lista en modo individual.' : `Plan ${selectedPlanName} listo. Ahora crea tu organización.`,
    });
  } catch {
    return NextResponse.json({ ok: false, error: 'unexpected_error' }, { status: 500 });
  }
}
