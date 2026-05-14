-- v58.25.9 — Workspace Persistence Foundation
-- Adds optional persistence for Workspace spaces and per-project view configuration.
-- Safe to apply after v58.25.8.x. The app keeps generated adapters as fallback when these tables are empty.

create table if not exists public.workspace_spaces (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  color text not null default '#16C784',
  icon text not null default 'folder',
  source text not null default 'custom' check (source in ('custom','department','client','template')),
  sort_order integer not null default 0,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint workspace_spaces_owner_scope_check check (user_id is not null or organization_id is not null)
);

create unique index if not exists workspace_spaces_personal_slug_unique
  on public.workspace_spaces(user_id, lower(slug))
  where organization_id is null and is_archived = false;

create unique index if not exists workspace_spaces_organization_slug_unique
  on public.workspace_spaces(organization_id, lower(slug))
  where organization_id is not null and is_archived = false;

create index if not exists workspace_spaces_user_idx on public.workspace_spaces(user_id, sort_order, created_at desc);
create index if not exists workspace_spaces_organization_idx on public.workspace_spaces(organization_id, sort_order, created_at desc);

create table if not exists public.project_views (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  view_type text not null check (view_type in ('list','board','timeline','table','canvas','files','reports')),
  title text not null,
  config jsonb not null default '{}'::jsonb,
  is_default boolean not null default false,
  sort_order integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists project_views_project_idx on public.project_views(project_id, sort_order, created_at);
create unique index if not exists project_views_default_per_type_unique
  on public.project_views(project_id, view_type)
  where is_default = true;

drop trigger if exists workspace_spaces_set_updated_at on public.workspace_spaces;
create trigger workspace_spaces_set_updated_at
before update on public.workspace_spaces
for each row execute function public.set_updated_at();

drop trigger if exists project_views_set_updated_at on public.project_views;
create trigger project_views_set_updated_at
before update on public.project_views
for each row execute function public.set_updated_at();

alter table public.workspace_spaces enable row level security;
alter table public.project_views enable row level security;

drop policy if exists workspace_spaces_select_access on public.workspace_spaces;
create policy workspace_spaces_select_access on public.workspace_spaces
for select to authenticated
using (
  user_id = auth.uid()
  or (
    organization_id is not null
    and exists (
      select 1 from public.organization_members om
      where om.organization_id = workspace_spaces.organization_id
        and om.user_id = auth.uid()
    )
  )
);

drop policy if exists workspace_spaces_write_access on public.workspace_spaces;
create policy workspace_spaces_write_access on public.workspace_spaces
for all to authenticated
using (
  user_id = auth.uid()
  or (
    organization_id is not null
    and public.is_org_admin_or_manager(organization_id)
  )
)
with check (
  user_id = auth.uid()
  or (
    organization_id is not null
    and public.is_org_admin_or_manager(organization_id)
  )
);

drop policy if exists project_views_select_access on public.project_views;
create policy project_views_select_access on public.project_views
for select to authenticated
using (
  exists (
    select 1 from public.projects p
    where p.id = project_views.project_id
      and (
        p.owner_id = auth.uid()
        or public.is_project_member(p.id, auth.uid())
        or (
          p.organization_id is not null
          and exists (
            select 1 from public.organization_members om
            where om.organization_id = p.organization_id
              and om.user_id = auth.uid()
          )
        )
      )
  )
);

drop policy if exists project_views_write_access on public.project_views;
create policy project_views_write_access on public.project_views
for all to authenticated
using (
  exists (
    select 1 from public.projects p
    where p.id = project_views.project_id
      and (
        p.owner_id = auth.uid()
        or public.has_project_role(p.id, auth.uid(), array['owner','editor'])
        or (p.organization_id is not null and public.is_org_admin_or_manager(p.organization_id))
      )
  )
)
with check (
  exists (
    select 1 from public.projects p
    where p.id = project_views.project_id
      and (
        p.owner_id = auth.uid()
        or public.has_project_role(p.id, auth.uid(), array['owner','editor'])
        or (p.organization_id is not null and public.is_org_admin_or_manager(p.organization_id))
      )
  )
);
