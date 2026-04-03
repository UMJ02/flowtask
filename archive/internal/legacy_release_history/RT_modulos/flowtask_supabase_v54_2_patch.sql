-- V54.2 Performance + Query Optimization (corrected)
-- Safe to run after V54.1 and also safe if V54.1 observability objects were partially created.
-- Canonical support table for the app is public.internal_support_tickets.

create extension if not exists pgcrypto;

-- Ensure observability tables exist if V54.1 was applied partially.
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

create table if not exists public.usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  organization_id uuid references public.organizations(id) on delete set null,
  event_name text not null,
  route text,
  metadata jsonb not null default '{}'::jsonb,
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

alter table public.error_logs enable row level security;
alter table public.usage_events enable row level security;
alter table public.internal_support_tickets enable row level security;

-- Restore/update trigger for canonical support tickets table when missing.
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

-- Recreate core policies idempotently in case V54.1 ran partially.
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

-- Migrate any manually patched support_tickets rows into the canonical table, then remove the manual table.
do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public' and table_name = 'support_tickets'
  ) then
    execute $migrate$
      insert into public.internal_support_tickets (
        id,
        organization_id,
        requester_user_id,
        subject,
        status,
        priority,
        source,
        created_at,
        updated_at
      )
      select
        st.id,
        st.organization_id,
        st.user_id,
        left(
          coalesce(nullif(trim(st.route), ''), nullif(trim(st.message), ''), 'Soporte manual migrado'),
          180
        ) as subject,
        case
          when st.status in ('open','in_progress','resolved','closed') then st.status
          else 'open'
        end as status,
        'normal' as priority,
        'in_app' as source,
        coalesce(st.created_at, now()) as created_at,
        coalesce(st.updated_at, coalesce(st.created_at, now())) as updated_at
      from public.support_tickets st
      on conflict (id) do nothing
    $migrate$;

    execute 'drop table if exists public.support_tickets';
  end if;
end $$;

create index if not exists projects_org_created_idx
  on public.projects (organization_id, created_at desc);

create index if not exists projects_org_status_created_idx
  on public.projects (organization_id, status, created_at desc);

create index if not exists projects_org_client_idx
  on public.projects (organization_id, client_id);

create index if not exists tasks_org_created_idx
  on public.tasks (organization_id, created_at desc);

create index if not exists tasks_org_status_due_idx
  on public.tasks (organization_id, status, due_date);

create index if not exists tasks_org_project_created_idx
  on public.tasks (organization_id, project_id, created_at desc);

create index if not exists tasks_org_client_idx
  on public.tasks (organization_id, client_id);

create index if not exists comments_project_created_idx
  on public.comments (project_id, created_at desc)
  where project_id is not null;

create index if not exists comments_task_created_idx
  on public.comments (task_id, created_at desc)
  where task_id is not null;

create index if not exists project_members_project_role_idx
  on public.project_members (project_id, role, created_at asc);

create index if not exists task_assignees_task_assigned_idx
  on public.task_assignees (task_id, assigned_at desc);

create index if not exists client_permissions_org_user_client_idx
  on public.client_permissions (organization_id, user_id, client_id);

create index if not exists usage_events_org_created_idx
  on public.usage_events (organization_id, created_at desc);

create index if not exists error_logs_org_created_idx
  on public.error_logs (organization_id, created_at desc);

create index if not exists internal_support_tickets_org_status_created_idx
  on public.internal_support_tickets (organization_id, status, created_at desc);
