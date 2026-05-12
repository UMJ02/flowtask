create table if not exists public.platform_admins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.internal_support_tickets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete set null,
  requester_user_id uuid references public.profiles(id) on delete set null,
  subject text not null,
  status text not null default 'open',
  priority text not null default 'normal',
  source text not null default 'in_app',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint internal_support_tickets_status_check check (status in ('open','in_progress','resolved','closed')),
  constraint internal_support_tickets_priority_check check (priority in ('low','normal','high','critical')),
  constraint internal_support_tickets_source_check check (source in ('in_app','email','whatsapp','phone'))
);

create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.platform_admins pa
    where pa.user_id = auth.uid()
      and pa.active = true
  );
$$;

alter table public.platform_admins enable row level security;
alter table public.internal_support_tickets enable row level security;

create or replace function public.set_internal_support_tickets_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_internal_support_tickets_updated_at on public.internal_support_tickets;
create trigger trg_internal_support_tickets_updated_at
before update on public.internal_support_tickets
for each row execute function public.set_internal_support_tickets_updated_at();

drop policy if exists "platform_admins_select_own_or_super" on public.platform_admins;
create policy "platform_admins_select_own_or_super"
on public.platform_admins
for select to authenticated
using (user_id = auth.uid() or public.is_platform_admin());

drop policy if exists "internal_support_tickets_select_related_or_super" on public.internal_support_tickets;
create policy "internal_support_tickets_select_related_or_super"
on public.internal_support_tickets
for select to authenticated
using (
  requester_user_id = auth.uid()
  or public.is_platform_admin()
  or (
    organization_id is not null and exists (
      select 1
      from public.organization_members om
      where om.organization_id = internal_support_tickets.organization_id
        and om.user_id = auth.uid()
        and om.role in ('admin_global','manager')
    )
  )
);

drop policy if exists "internal_support_tickets_insert_related_or_super" on public.internal_support_tickets;
create policy "internal_support_tickets_insert_related_or_super"
on public.internal_support_tickets
for insert to authenticated
with check (
  requester_user_id = auth.uid()
  or public.is_platform_admin()
  or (
    organization_id is not null and exists (
      select 1
      from public.organization_members om
      where om.organization_id = internal_support_tickets.organization_id
        and om.user_id = auth.uid()
        and om.role in ('admin_global','manager')
    )
  )
);

drop policy if exists "internal_support_tickets_update_super" on public.internal_support_tickets;
create policy "internal_support_tickets_update_super"
on public.internal_support_tickets
for update to authenticated
using (public.is_platform_admin())
with check (public.is_platform_admin());

do $$ begin
  create policy "profiles_select_platform_admin"
  on public.profiles for select to authenticated
  using (public.is_platform_admin());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "organizations_select_platform_admin"
  on public.organizations for select to authenticated
  using (public.is_platform_admin());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "organization_members_select_platform_admin"
  on public.organization_members for select to authenticated
  using (public.is_platform_admin());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "clients_select_platform_admin"
  on public.clients for select to authenticated
  using (public.is_platform_admin());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "client_permissions_select_platform_admin"
  on public.client_permissions for select to authenticated
  using (public.is_platform_admin());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "organization_invites_select_platform_admin"
  on public.organization_invites for select to authenticated
  using (public.is_platform_admin());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "organization_subscriptions_select_platform_admin"
  on public.organization_subscriptions for select to authenticated
  using (public.is_platform_admin());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "organization_invoices_select_platform_admin"
  on public.organization_invoices for select to authenticated
  using (public.is_platform_admin());
exception when duplicate_object then null; end $$;

insert into public.platform_admins (user_id)
select distinct om.user_id
from public.organization_members om
where om.role = 'admin_global'
on conflict (user_id) do nothing;

insert into public.internal_support_tickets (organization_id, requester_user_id, subject, status, priority, source)
select
  o.id,
  o.owner_id,
  concat('Onboarding inicial · ', o.name),
  'open',
  case when row_number() over (order by o.created_at asc) = 1 then 'high' else 'normal' end,
  'in_app'
from public.organizations o
where o.owner_id is not null
on conflict do nothing;
