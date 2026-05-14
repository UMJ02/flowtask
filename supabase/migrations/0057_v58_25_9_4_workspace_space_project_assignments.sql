-- v58.25.9.4 Workspace Spaces Manager + Project Organization
-- Optional project-to-space persistence layer. Safe to run after 0056.

create table if not exists public.workspace_space_projects (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.workspace_spaces(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint workspace_space_projects_unique_project unique (project_id)
);

create index if not exists workspace_space_projects_space_idx
  on public.workspace_space_projects(space_id, sort_order, created_at desc);

create index if not exists workspace_space_projects_project_idx
  on public.workspace_space_projects(project_id);

create or replace function public.set_workspace_space_projects_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists workspace_space_projects_set_updated_at on public.workspace_space_projects;
create trigger workspace_space_projects_set_updated_at
before update on public.workspace_space_projects
for each row
execute function public.set_workspace_space_projects_updated_at();

alter table public.workspace_space_projects enable row level security;

drop policy if exists workspace_space_projects_select_access on public.workspace_space_projects;
create policy workspace_space_projects_select_access on public.workspace_space_projects
for select
to authenticated
using (
  exists (
    select 1
    from public.workspace_spaces ws
    where ws.id = workspace_space_projects.space_id
      and (
        ws.user_id = auth.uid()
        or (
          ws.organization_id is not null
          and exists (
            select 1
            from public.organization_members om
            where om.organization_id = ws.organization_id
              and om.user_id = auth.uid()
          )
        )
      )
  )
);

drop policy if exists workspace_space_projects_write_access on public.workspace_space_projects;
create policy workspace_space_projects_write_access on public.workspace_space_projects
for all
to authenticated
using (
  exists (
    select 1
    from public.workspace_spaces ws
    join public.projects p on p.id = workspace_space_projects.project_id
    where ws.id = workspace_space_projects.space_id
      and (
        p.owner_id = auth.uid()
        or public.has_project_role(p.id, auth.uid(), array['owner'::text, 'editor'::text])
        or (
          p.organization_id is not null
          and public.is_org_admin_or_manager(p.organization_id)
        )
      )
      and (
        ws.user_id = auth.uid()
        or (
          ws.organization_id is not null
          and public.is_org_admin_or_manager(ws.organization_id)
        )
      )
  )
)
with check (
  exists (
    select 1
    from public.workspace_spaces ws
    join public.projects p on p.id = workspace_space_projects.project_id
    where ws.id = workspace_space_projects.space_id
      and (
        p.owner_id = auth.uid()
        or public.has_project_role(p.id, auth.uid(), array['owner'::text, 'editor'::text])
        or (
          p.organization_id is not null
          and public.is_org_admin_or_manager(p.organization_id)
        )
      )
      and (
        ws.user_id = auth.uid()
        or (
          ws.organization_id is not null
          and public.is_org_admin_or_manager(ws.organization_id)
        )
      )
  )
);
