-- 0025_v54_1_observability_support_metrics.sql
-- Adds error logging and usage telemetry for post-release operations.
-- Support intake reuses internal_support_tickets introduced in 0017.

create extension if not exists pgcrypto;

create table if not exists public.error_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  organization_id uuid references public.organizations(id) on delete set null,
  level text not null default 'error',
  source text not null default 'frontend',
  route text,
  message text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint error_logs_level_check check (level in ('info','warning','error','critical')),
  constraint error_logs_source_check check (source in ('frontend','backend','api','job'))
);

create index if not exists error_logs_created_idx
  on public.error_logs (created_at desc);
create index if not exists error_logs_user_idx
  on public.error_logs (user_id, created_at desc);
create index if not exists error_logs_org_idx
  on public.error_logs (organization_id, created_at desc);

create table if not exists public.usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  organization_id uuid references public.organizations(id) on delete set null,
  event_name text not null,
  route text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists usage_events_created_idx
  on public.usage_events (created_at desc);
create index if not exists usage_events_user_idx
  on public.usage_events (user_id, created_at desc);
create index if not exists usage_events_org_idx
  on public.usage_events (organization_id, created_at desc);
create index if not exists usage_events_name_idx
  on public.usage_events (event_name, created_at desc);

alter table public.error_logs enable row level security;
alter table public.usage_events enable row level security;

drop policy if exists "error_logs_insert_own_or_platform" on public.error_logs;
create policy "error_logs_insert_own_or_platform"
on public.error_logs
for insert
to authenticated
with check (
  user_id = auth.uid()
  and (
    organization_id is null
    or exists (
      select 1
      from public.organization_members om
      where om.organization_id = error_logs.organization_id
        and om.user_id = auth.uid()
    )
    or public.is_platform_admin()
  )
);

drop policy if exists "error_logs_select_own_or_platform" on public.error_logs;
create policy "error_logs_select_own_or_platform"
on public.error_logs
for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_platform_admin()
);

drop policy if exists "usage_events_insert_own_or_platform" on public.usage_events;
create policy "usage_events_insert_own_or_platform"
on public.usage_events
for insert
to authenticated
with check (
  user_id = auth.uid()
  and (
    organization_id is null
    or exists (
      select 1
      from public.organization_members om
      where om.organization_id = usage_events.organization_id
        and om.user_id = auth.uid()
    )
    or public.is_platform_admin()
  )
);

drop policy if exists "usage_events_select_own_or_platform" on public.usage_events;
create policy "usage_events_select_own_or_platform"
on public.usage_events
for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_platform_admin()
);
