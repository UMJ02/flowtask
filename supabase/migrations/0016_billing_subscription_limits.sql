create table if not exists public.organization_subscriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  plan_code text not null default 'starter',
  plan_name text not null default 'Starter',
  status text not null default 'trial',
  billing_cycle text not null default 'monthly',
  trial_ends_at timestamptz,
  renews_at timestamptz,
  seats_included integer not null default 5,
  seats_used integer not null default 1,
  projects_included integer not null default 25,
  projects_used integer not null default 0,
  storage_gb_included numeric(10,2) not null default 5,
  storage_gb_used numeric(10,2) not null default 0,
  external_customer_id text,
  external_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organization_subscriptions_status_check check (status in ('trial','active','past_due','canceled')),
  constraint organization_subscriptions_cycle_check check (billing_cycle in ('monthly','annual'))
);

create unique index if not exists organization_subscriptions_org_unique on public.organization_subscriptions (organization_id);

create table if not exists public.organization_invoices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  amount_cents integer not null default 0,
  currency text not null default 'CRC',
  status text not null default 'paid',
  period_start date,
  period_end date,
  issued_at timestamptz not null default now(),
  external_invoice_id text,
  created_at timestamptz not null default now(),
  constraint organization_invoices_status_check check (status in ('draft','open','paid','void','past_due'))
);

alter table public.organization_subscriptions enable row level security;
alter table public.organization_invoices enable row level security;

drop policy if exists "organization_subscriptions_select_by_member" on public.organization_subscriptions;
create policy "organization_subscriptions_select_by_member"
on public.organization_subscriptions
for select to authenticated
using (
  exists (
    select 1
    from public.organization_members om
    where om.organization_id = organization_subscriptions.organization_id
      and om.user_id = auth.uid()
  )
);

drop policy if exists "organization_invoices_select_by_member" on public.organization_invoices;
create policy "organization_invoices_select_by_member"
on public.organization_invoices
for select to authenticated
using (
  exists (
    select 1
    from public.organization_members om
    where om.organization_id = organization_invoices.organization_id
      and om.user_id = auth.uid()
  )
);

create or replace function public.set_organization_subscription_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_organization_subscriptions_updated_at on public.organization_subscriptions;
create trigger trg_organization_subscriptions_updated_at
before update on public.organization_subscriptions
for each row execute function public.set_organization_subscription_updated_at();

insert into public.organization_subscriptions (
  organization_id,
  plan_code,
  plan_name,
  status,
  billing_cycle,
  trial_ends_at,
  renews_at,
  seats_included,
  seats_used,
  projects_included,
  projects_used,
  storage_gb_included,
  storage_gb_used
)
select
  o.id,
  'growth',
  'Growth',
  'active',
  'monthly',
  now() + interval '14 days',
  now() + interval '30 days',
  20,
  greatest(1, coalesce(m.members_count, 1)),
  120,
  coalesce(p.projects_count, 0),
  50,
  7.5
from public.organizations o
left join (
  select organization_id, count(*) as members_count
  from public.organization_members
  group by organization_id
) m on m.organization_id = o.id
left join (
  select organization_id, count(*) as projects_count
  from public.projects
  where organization_id is not null
  group by organization_id
) p on p.organization_id = o.id
on conflict (organization_id) do nothing;
