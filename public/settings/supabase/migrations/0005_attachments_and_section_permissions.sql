create extension if not exists pgcrypto;

create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete set null,
  task_id uuid references public.tasks(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  file_name text not null,
  mime_type text,
  file_size bigint,
  storage_path text not null unique,
  public_url text,
  created_at timestamptz not null default now(),
  constraint attachments_entity_check check (
    (task_id is not null and project_id is null)
    or
    (task_id is null and project_id is not null)
  )
);

create table if not exists public.project_section_permissions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  section_key text not null,
  can_view boolean not null default true,
  can_edit boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(project_id, user_id, section_key),
  constraint project_section_permissions_section_check check (
    section_key in ('overview', 'tasks', 'comments', 'members', 'files', 'reports')
  )
);

alter table public.attachments enable row level security;
alter table public.project_section_permissions enable row level security;

create policy if not exists "attachments_select_access"
on public.attachments
for select
to authenticated
using (
  owner_id = auth.uid()
  or exists (
    select 1
    from public.tasks t
    where t.id = attachments.task_id
      and (
        t.owner_id = auth.uid()
        or exists (
          select 1 from public.task_assignees ta
          where ta.task_id = t.id and ta.user_id = auth.uid()
        )
      )
  )
  or exists (
    select 1
    from public.projects p
    where p.id = attachments.project_id
      and (
        p.owner_id = auth.uid()
        or exists (
          select 1 from public.project_members pm
          where pm.project_id = p.id and pm.user_id = auth.uid()
        )
      )
  )
);

create policy if not exists "attachments_insert_owner"
on public.attachments
for insert
to authenticated
with check (owner_id = auth.uid());

create policy if not exists "attachments_delete_owner"
on public.attachments
for delete
to authenticated
using (owner_id = auth.uid());

create policy if not exists "project_section_permissions_select_project_access"
on public.project_section_permissions
for select
to authenticated
using (
  exists (
    select 1 from public.projects p
    where p.id = project_section_permissions.project_id
      and (
        p.owner_id = auth.uid()
        or exists (
          select 1 from public.project_members pm
          where pm.project_id = p.id and pm.user_id = auth.uid()
        )
      )
  )
);

create policy if not exists "project_section_permissions_write_owner"
on public.project_section_permissions
for all
to authenticated
using (
  exists (
    select 1 from public.projects p
    where p.id = project_section_permissions.project_id
      and p.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.projects p
    where p.id = project_section_permissions.project_id
      and p.owner_id = auth.uid()
  )
);
