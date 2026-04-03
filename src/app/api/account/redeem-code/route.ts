import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const code = typeof body?.code === 'string' ? body.code.trim().toUpperCase() : '';
    if (!code) return NextResponse.json({ ok: false, error: 'Ingresa un código válido.' }, { status: 400 });

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

    const admin = createAdminClient();
    const { data: activation, error: activationError } = await admin
      .from('activation_codes')
      .select('*')
      .eq('code', code)
      .eq('is_active', true)
      .eq('is_used', false)
      .maybeSingle();

    if (activationError || !activation) {
      return NextResponse.json({ ok: false, error: 'El código no existe, ya fue usado o no está activo.' }, { status: 404 });
    }
    if (activation.expires_at && new Date(activation.expires_at).getTime() < Date.now()) {
      return NextResponse.json({ ok: false, error: 'El código ya venció.' }, { status: 400 });
    }

    const [codeUpdate, modeUpdate] = await Promise.all([
      admin.from('activation_codes').update({ is_used: true, used_by_user_id: user.id, used_at: new Date().toISOString() }).eq('id', activation.id),
      admin.from('user_account_modes').upsert({
        user_id: user.id,
        account_mode: activation.account_mode,
        selected_plan_code: activation.plan_code,
        selected_plan_name: activation.plan_name,
        billing_cycle: activation.billing_cycle,
        activation_source: 'activation_code',
        onboarding_completed: activation.account_mode === 'individual',
      }, { onConflict: 'user_id' }),
    ]);

    if (codeUpdate.error || modeUpdate.error) {
      return NextResponse.json({ ok: false, error: codeUpdate.error?.message ?? modeUpdate.error?.message ?? 'No se pudo aplicar el código.' }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      message: activation.account_mode === 'individual'
        ? `Código aplicado. Tu cuenta quedó activa en modo ${activation.plan_name}.`
        : `Código aplicado. Ya puedes crear tu organización con el plan ${activation.plan_name}.`,
    });
  } catch {
    return NextResponse.json({ ok: false, error: 'unexpected_error' }, { status: 500 });
  }
}
