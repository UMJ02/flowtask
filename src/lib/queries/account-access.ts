import { createClient } from '@/lib/supabase/server';

export type AccountMode = 'individual' | 'team_owner' | 'team_member';

export interface AccountAccessSummary {
  currentMode: AccountMode | null;
  selectedPlanCode: string | null;
  selectedPlanName: string | null;
  billingCycle: 'monthly' | 'annual' | null;
  activationSource: string | null;
  onboardingCompleted: boolean;
  hasWorkspace: boolean;
  canCreateWorkspace: boolean;
  activeOrganizationId: string | null;
  activeOrganizationName: string | null;
  activeRole: string | null;
}

export async function getAccountAccessSummary(): Promise<AccountAccessSummary> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      currentMode: null,
      selectedPlanCode: null,
      selectedPlanName: null,
      billingCycle: null,
      activationSource: null,
      onboardingCompleted: false,
      hasWorkspace: false,
      canCreateWorkspace: false,
      activeOrganizationId: null,
      activeOrganizationName: null,
      activeRole: null,
    };
  }

  const [modeRes, membershipRes] = await Promise.all([
    supabase
      .from('user_account_modes')
      .select('account_mode, selected_plan_code, selected_plan_name, billing_cycle, activation_source, onboarding_completed, default_organization_id')
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase
      .from('organization_members')
      .select('organization_id, role, is_default, organizations(name)')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const mode = modeRes.data;
  const membership = membershipRes.data as ({ organization_id?: string | null; role?: string | null; organizations?: { name?: string | null } | null } & Record<string, unknown>) | null;

  const inferredMode: AccountMode | null = mode?.account_mode
    ? (mode.account_mode as AccountMode)
    : membership?.organization_id
      ? membership.role === 'admin_global' || membership.role === 'manager'
        ? 'team_owner'
        : 'team_member'
      : 'individual';

  const hasWorkspace = Boolean(membership?.organization_id);

  return {
    currentMode: inferredMode,
    selectedPlanCode: (mode?.selected_plan_code as string | null | undefined) ?? null,
    selectedPlanName: (mode?.selected_plan_name as string | null | undefined) ?? null,
    billingCycle: ((mode?.billing_cycle as 'monthly' | 'annual' | null | undefined) ?? null),
    activationSource: (mode?.activation_source as string | null | undefined) ?? null,
    onboardingCompleted: Boolean(mode?.onboarding_completed),
    hasWorkspace,
    canCreateWorkspace: inferredMode === 'team_owner' && !hasWorkspace,
    activeOrganizationId: (membership?.organization_id as string | null | undefined) ?? null,
    activeOrganizationName: membership?.organizations?.name ?? null,
    activeRole: (membership?.role as string | null | undefined) ?? null,
  };
}
