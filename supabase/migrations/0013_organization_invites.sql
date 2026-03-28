create table if not exists public.organization_invites (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  email text not null,
  role text not null default 'member',
  token uuid not null unique default gen_random_uuid(),
  status text not null default 'pending',
  created_by uuid references public.profiles(id) on delete set null,
  accepted_by uuid references public.profiles(id) on delete set null,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  constraint organization_invites_role_check check (role in ('admin_global','manager','member','viewer')),
  constraint organization_invites_status_check check (status in ('pending','accepted','revoked','expired'))
);

alter table public.organization_invites enable row level security;

drop policy if exists "organization_invites_select_related" on public.organization_invites;
create policy "organization_invites_select_related" on public.organization_invites for select to authenticated using (
  exists (
    select 1 from public.organization_members om
    where om.organization_id = organization_invites.organization_id
      and om.user_id = auth.uid()
  )
);

drop policy if exists "organization_invites_insert_admin_or_manager" on public.organization_invites;
create policy "organization_invites_insert_admin_or_manager" on public.organization_invites for insert to authenticated with check (
  exists (
    select 1 from public.organization_members om
    where om.organization_id = organization_invites.organization_id
      and om.user_id = auth.uid()
      and om.role in ('admin_global','manager')
  )
);
