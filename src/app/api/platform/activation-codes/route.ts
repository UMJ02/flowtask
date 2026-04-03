import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAdminAccess } from '@/lib/queries/admin';

export const dynamic = 'force-dynamic';

function generateCode(planCode: string) {
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `FLOW-${planCode.toUpperCase()}-${suffix}`;
}

function resolvePlan(planCode: string, requestedMode: string) {
  switch (planCode) {
    case 'individual':
      return { planName: 'Individual', seatLimit: 1, projectLimit: 40, storageLimitGb: 10, billingCycle: 'annual', accountMode: 'individual' };
    case 'basic':
      return { planName: 'Basic', seatLimit: 10, projectLimit: 40, storageLimitGb: 25, billingCycle: 'annual', accountMode: requestedMode };
    case 'plus':
      return { planName: 'Plus', seatLimit: 50, projectLimit: 160, storageLimitGb: 100, billingCycle: 'annual', accountMode: requestedMode };
    default:
      return { planName: 'Business', seatLimit: 9999, projectLimit: 9999, storageLimitGb: 500, billingCycle: 'annual', accountMode: requestedMode };
  }
}

export async function POST(request: NextRequest) {
  try {
    const access = await getAdminAccess();
    if (!access.canAccess || !access.userId) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

    const body = await request.json();
    const planCode = typeof body?.planCode === 'string' ? body.planCode : 'business';
    const requestedMode = body?.accountMode === 'individual' ? 'individual' : 'team_owner';
    const code = typeof body?.code === 'string' && body.code.trim() ? body.code.trim().toUpperCase() : generateCode(planCode);
    const plan = resolvePlan(planCode, requestedMode);

    const admin = createAdminClient();
    const { data, error } = await admin.from('activation_codes').insert({
      code,
      plan_code: planCode,
      plan_name: plan.planName,
      account_mode: plan.accountMode,
      billing_cycle: plan.billingCycle,
      seat_limit: plan.seatLimit,
      project_limit: plan.projectLimit,
      storage_gb_limit: plan.storageLimitGb,
      created_by: access.userId,
      expires_at: body?.expiresAt ? new Date(body.expiresAt).toISOString() : null,
    }).select('id, code').single();

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true, data });
  } catch {
    return NextResponse.json({ ok: false, error: 'unexpected_error' }, { status: 500 });
  }
}
