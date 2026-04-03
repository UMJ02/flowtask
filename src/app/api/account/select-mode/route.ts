import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const accountMode = body?.accountMode;
    const selectedPlanCode = typeof body?.selectedPlanCode === 'string' ? body.selectedPlanCode : null;
    const selectedPlanName = typeof body?.selectedPlanName === 'string' ? body.selectedPlanName : null;
    const billingCycle = body?.billingCycle === 'monthly' ? 'monthly' : body?.billingCycle === 'annual' ? 'annual' : null;
    const onboardingCompleted = Boolean(body?.onboardingCompleted);

    if (!['individual', 'team_owner', 'team_member'].includes(accountMode)) {
      return NextResponse.json({ ok: false, error: 'Modo de cuenta inválido.' }, { status: 400 });
    }

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
    };

    const { error } = await supabase.from('user_account_modes').upsert(payload, { onConflict: 'user_id' });
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true, data: payload });
  } catch {
    return NextResponse.json({ ok: false, error: 'unexpected_error' }, { status: 500 });
  }
}
