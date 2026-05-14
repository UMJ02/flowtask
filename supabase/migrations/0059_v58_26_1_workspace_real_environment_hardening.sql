-- v58.26.1 — Workspace Production QA Fixes + Real Environment Hardening
-- Idempotency and production-environment repair pass for Workspace persistence.
-- Safe to run after 0056, 0057 and 0058. It does not drop user data.

create or replace function public.set_workspace_real_environment_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
begin
  if to_regclass('public.workspace_spaces') is not null then
    drop trigger if exists workspace_spaces_set_updated_at on public.workspace_spaces;
    create trigger workspace_spaces_set_updated_at
    before update on public.workspace_spaces
    for each row
    execute function public.set_workspace_real_environment_updated_at();

    alter table public.workspace_spaces enable row level security;
    comment on table public.workspace_spaces is 'FlowTask Workspace spaces persistence. Hardened by v58.26.1.';
  end if;

  if to_regclass('public.project_views') is not null then
    drop trigger if exists project_views_set_updated_at on public.project_views;
    create trigger project_views_set_updated_at
    before update on public.project_views
    for each row
    execute function public.set_workspace_real_environment_updated_at();

    alter table public.project_views enable row level security;
    alter table public.project_views drop constraint if exists project_views_view_type_check;
    alter table public.project_views
      add constraint project_views_view_type_check
      check (view_type in ('home','list','board','timeline','table','canvas','files','reports'));
    comment on table public.project_views is 'FlowTask saved project views persistence. Hardened by v58.26.1.';
  end if;

  if to_regclass('public.workspace_space_projects') is not null then
    drop trigger if exists workspace_space_projects_set_updated_at on public.workspace_space_projects;
    create trigger workspace_space_projects_set_updated_at
    before update on public.workspace_space_projects
    for each row
    execute function public.set_workspace_real_environment_updated_at();

    alter table public.workspace_space_projects enable row level security;
    comment on table public.workspace_space_projects is 'FlowTask project-to-space assignments. Hardened by v58.26.1.';
  end if;
end $$;
