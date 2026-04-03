create table if not exists public.user_account_modes (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  account_mode text not null default 'individual',
  selected_plan_code text,
  selected_plan_name text,
  billing_cycle text,
  activation_source text not null default 'self_serve',
  default_organization_id uuid references public.organizations(id) on delete set null,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_account_modes_mode_check check (account_mode in ('individual','team_owner','team_member')),
  constraint user_account_modes_cycle_check check (billing_cycle is null or billing_cycle in ('monthly','annual')),
  constraint user_account_modes_source_check check (activation_source in ('self_serve','activation_code','invite','legacy'))
);

create table if not exists public.activation_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  plan_code text not null,
  plan_name text not null,
  account_mode text not null,
  billing_cycle text not null default 'annual',
  seat_limit integer,
  project_limit integer,
  storage_gb_limit numeric(10,2),
  organization_limit integer not null default 1,
  is_active boolean not null default true,
  is_used boolean not null default false,
  expires_at timestamptz,
  used_by_user_id uuid references public.profiles(id) on delete set null,
  used_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  organization_id uuid references public.organizations(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint activation_codes_mode_check check (account_mode in ('individual','team_owner')),
  constraint activation_codes_cycle_check check (billing_cycle in ('monthly','annual'))
);

create index if not exists user_account_modes_default_org_idx on public.user_account_modes (default_organization_id);
create index if not exists activation_codes_lookup_idx on public.activation_codes (code, is_active, is_used);
create index if not exists activation_codes_created_idx on public.activation_codes (created_at desc);

alter table public.user_account_modes enable row level security;
alter table public.activation_codes enable row level security;

drop policy if exists "user_account_modes_select_own" on public.user_account_modes;
create policy "user_account_modes_select_own"
on public.user_account_modes for select to authenticated
using (
  user_id = auth.uid() or public.is_platform_admin()
);

drop policy if exists "user_account_modes_insert_own" on public.user_account_modes;
create policy "user_account_modes_insert_own"
on public.user_account_modes for insert to authenticated
with check (
  user_id = auth.uid() or public.is_platform_admin()
);

drop policy if exists "user_account_modes_update_own" on public.user_account_modes;
create policy "user_account_modes_update_own"
on public.user_account_modes for update to authenticated
using (
  user_id = auth.uid() or public.is_platform_admin()
)
with check (
  user_id = auth.uid() or public.is_platform_admin()
);

drop policy if exists "activation_codes_select_platform_admin" on public.activation_codes;
create policy "activation_codes_select_platform_admin"
on public.activation_codes for select to authenticated
using (public.is_platform_admin());

create or replace function public.set_updated_at_access_tables()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_user_account_modes_updated_at on public.user_account_modes;
create trigger trg_user_account_modes_updated_at
before update on public.user_account_modes
for each row execute function public.set_updated_at_access_tables();

drop trigger if exists trg_activation_codes_updated_at on public.activation_codes;
create trigger trg_activation_codes_updated_at
before update on public.activation_codes
for each row execute function public.set_updated_at_access_tables();

insert into public.user_account_modes (
  user_id,
  account_mode,
  selected_plan_code,
  selected_plan_name,
  billing_cycle,
  activation_source,
  default_organization_id,
  onboarding_completed
)
select
  p.id,
  case
    when om.role in ('admin_global', 'manager') then 'team_owner'
    when om.user_id is not null then 'team_member'
    else 'individual'
  end,
  case
    when os.plan_code is not null then os.plan_code
    when om.user_id is not null then 'team'
    else 'individual'
  end,
  case
    when os.plan_name is not null then os.plan_name
    when om.user_id is not null then 'Workspace'
    else 'Individual'
  end,
  os.billing_cycle,
  case
    when om.user_id is not null then 'legacy'
    else 'self_serve'
  end,
  om.organization_id,
  true
from public.profiles p
left join lateral (
  select organization_id, role, user_id
  from public.organization_members
  where user_id = p.id
  order by is_default desc, created_at asc
  limit 1
) om on true
left join public.organization_subscriptions os
  on os.organization_id = om.organization_id
on conflict (user_id) do nothing;
