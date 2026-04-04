import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type PlanCode = "basic" | "plus" | "business";

function resolvePlan(planCode: PlanCode) {
  switch (planCode) {
    case "basic":
      return { planName: "Basic", seats: 10, projects: 40, storage: 25 };
    case "plus":
      return { planName: "Plus", seats: 50, projects: 160, storage: 100 };
    default:
      return { planName: "Business", seats: 9999, projects: 9999, storage: 500 };
  }
}

async function getAdminMembership(userId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("organization_members")
    .select("organization_id, role, is_default")
    .eq("user_id", userId)
    .eq("is_default", true)
    .maybeSingle();
  return data;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

    const membership = await getAdminMembership(user.id);
    if (!membership || membership.role !== "admin_global") {
      return NextResponse.json({ ok: false, error: "Solo el owner/admin principal puede ajustar el plan." }, { status: 403 });
    }

    const body = await request.json();
    const action = typeof body?.action === 'string' ? body.action : '';
    const admin = createAdminClient();
    const { data: subscription, error: subError } = await admin
      .from('organization_subscriptions')
      .select('*')
      .eq('organization_id', membership.organization_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (subError || !subscription) {
      return NextResponse.json({ ok: false, error: subError?.message ?? 'No existe una suscripción activa para esta organización.' }, { status: 404 });
    }

    if (action === 'toggle_auto_renew') {
      const nextValue = !Boolean(subscription.auto_renew ?? true);
      const { error } = await admin.from('organization_subscriptions').update({ auto_renew: nextValue }).eq('id', subscription.id);
      if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
      return NextResponse.json({ ok: true, message: nextValue ? 'La renovación anual quedó activada.' : 'La renovación anual quedó desactivada.' });
    }

    if (action === 'change_plan') {
      const requestedPlan = typeof body?.planCode === 'string' ? body.planCode.toLowerCase() as PlanCode : null;
      if (!requestedPlan || !['basic', 'plus', 'business'].includes(requestedPlan)) {
        return NextResponse.json({ ok: false, error: 'Selecciona un plan válido.' }, { status: 400 });
      }
      const plan = resolvePlan(requestedPlan);
      const currentPlan = String(subscription.plan_code ?? 'basic').toLowerCase();
      const upgradeOrder = ['basic', 'plus', 'business'];
      const isUpgrade = upgradeOrder.indexOf(requestedPlan) >= upgradeOrder.indexOf(currentPlan as PlanCode);
      const renewsAt = subscription.renews_at ?? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

      const payload = isUpgrade ? {
        plan_code: requestedPlan,
        plan_name: plan.planName,
        seats_included: plan.seats,
        projects_included: plan.projects,
        storage_gb_included: plan.storage,
        status: 'active',
        auto_renew: true,
        last_renewed_at: subscription.last_renewed_at ?? new Date().toISOString(),
        renews_at: renewsAt,
        expires_at: renewsAt,
        scheduled_plan_code: null,
        scheduled_plan_name: null,
        scheduled_change_at: null,
      } : {
        scheduled_plan_code: requestedPlan,
        scheduled_plan_name: plan.planName,
        scheduled_change_at: renewsAt,
      };

      const { error } = await admin.from('organization_subscriptions').update(payload).eq('id', subscription.id);
      if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
      return NextResponse.json({ ok: true, message: isUpgrade ? `Upgrade aplicado a ${plan.planName}.` : `Downgrade programado a ${plan.planName} para la próxima renovación.` });
    }

    return NextResponse.json({ ok: false, error: 'Acción no soportada.' }, { status: 400 });
  } catch {
    return NextResponse.json({ ok: false, error: 'unexpected_error' }, { status: 500 });
  }
}
