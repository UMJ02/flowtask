create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null unique,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.departments (
  id bigserial primary key,
  code text not null unique,
  name text not null unique
);

create table if not exists public.boards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null default 'Mi tablero',
  layout_config jsonb not null default '{}'::jsonb,
  theme_config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id)
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'activo',
  client_name text,
  department_id bigint references public.departments(id),
  is_collaborative boolean not null default false,
  share_enabled boolean not null default false,
  share_token text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  due_date date,
  completed_at timestamptz,
  constraint projects_status_check check (
    status in ('activo', 'en_pausa', 'completado', 'vencido')
  )
);

create table if not exists public.project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'editor',
  created_at timestamptz not null default now(),
  unique(project_id, user_id),
  constraint project_members_role_check check (
    role in ('owner', 'editor', 'viewer')
  )
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  title text not null,
  description text,
  status text not null default 'en_proceso',
  department_id bigint references public.departments(id),
  client_name text,
  due_date date,
  priority text not null default 'media',
  share_enabled boolean not null default false,
  share_token text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint tasks_status_check check (
    status in ('en_proceso', 'en_espera', 'concluido')
  ),
  constraint tasks_priority_check check (
    priority in ('baja', 'media', 'alta')
  )
);

create table if not exists public.task_assignees (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  unique(task_id, user_id)
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  task_id uuid references public.tasks(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now(),
  constraint comments_entity_check check (
    (project_id is not null and task_id is null)
    or
    (project_id is null and task_id is not null)
  )
);

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  task_id uuid references public.tasks(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  remind_at timestamptz not null,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  constraint reminders_entity_check check (
    task_id is not null or project_id is not null
  )
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  entity_type text not null,
  entity_id uuid not null,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_boards_updated_at on public.boards;
create trigger trg_boards_updated_at
before update on public.boards
for each row execute function public.set_updated_at();

drop trigger if exists trg_projects_updated_at on public.projects;
create trigger trg_projects_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

drop trigger if exists trg_tasks_updated_at on public.tasks;
create trigger trg_tasks_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

create or replace function public.handle_task_completed_at()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'concluido' and old.status is distinct from new.status then
    new.completed_at = now();
  elsif new.status <> 'concluido' then
    new.completed_at = null;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_tasks_completed_at on public.tasks;
create trigger trg_tasks_completed_at
before update on public.tasks
for each row execute function public.handle_task_completed_at();

create or replace function public.handle_project_completed_at()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'completado' and old.status is distinct from new.status then
    new.completed_at = now();
  elsif new.status <> 'completado' then
    new.completed_at = null;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_projects_completed_at on public.projects;
create trigger trg_projects_completed_at
before update on public.projects
for each row execute function public.handle_project_completed_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email
  )
  on conflict (id) do update
  set full_name = excluded.full_name,
      email = excluded.email;

  insert into public.boards (user_id, title)
  values (new.id, 'Mi tablero')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.boards enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.tasks enable row level security;
alter table public.task_assignees enable row level security;
alter table public.comments enable row level security;
alter table public.reminders enable row level security;
alter table public.activity_logs enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
for select to authenticated using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
for insert to authenticated with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "boards_select_own" on public.boards;
create policy "boards_select_own" on public.boards
for select to authenticated using (auth.uid() = user_id);

drop policy if exists "boards_insert_own" on public.boards;
create policy "boards_insert_own" on public.boards
for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "boards_update_own" on public.boards;
create policy "boards_update_own" on public.boards
for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "boards_delete_own" on public.boards;
create policy "boards_delete_own" on public.boards
for delete to authenticated using (auth.uid() = user_id);

drop policy if exists "project_members_select_related" on public.project_members;
create policy "project_members_select_related" on public.project_members
for select to authenticated using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.projects p
    where p.id = project_members.project_id
      and p.owner_id = auth.uid()
  )
);

drop policy if exists "project_members_insert_project_owner" on public.project_members;
create policy "project_members_insert_project_owner" on public.project_members
for insert to authenticated with check (
  exists (
    select 1 from public.projects p
    where p.id = project_members.project_id
      and p.owner_id = auth.uid()
  )
);

drop policy if exists "project_members_delete_project_owner" on public.project_members;
create policy "project_members_delete_project_owner" on public.project_members
for delete to authenticated using (
  exists (
    select 1 from public.projects p
    where p.id = project_members.project_id
      and p.owner_id = auth.uid()
  )
);

drop policy if exists "projects_select_owner_or_member" on public.projects;
create policy "projects_select_owner_or_member" on public.projects
for select to authenticated using (
  owner_id = auth.uid()
  or exists (
    select 1 from public.project_members pm
    where pm.project_id = projects.id
      and pm.user_id = auth.uid()
  )
);

drop policy if exists "projects_insert_owner" on public.projects;
create policy "projects_insert_owner" on public.projects
for insert to authenticated with check (owner_id = auth.uid());

drop policy if exists "projects_update_owner_or_editor" on public.projects;
create policy "projects_update_owner_or_editor" on public.projects
for update to authenticated using (
  owner_id = auth.uid()
  or exists (
    select 1 from public.project_members pm
    where pm.project_id = projects.id
      and pm.user_id = auth.uid()
      and pm.role in ('owner', 'editor')
  )
) with check (
  owner_id = auth.uid()
  or exists (
    select 1 from public.project_members pm
    where pm.project_id = projects.id
      and pm.user_id = auth.uid()
      and pm.role in ('owner', 'editor')
  )
);

drop policy if exists "projects_delete_owner" on public.projects;
create policy "projects_delete_owner" on public.projects
for delete to authenticated using (owner_id = auth.uid());

drop policy if exists "tasks_select_access" on public.tasks;
create policy "tasks_select_access" on public.tasks
for select to authenticated using (
  owner_id = auth.uid()
  or exists (
    select 1 from public.task_assignees ta
    where ta.task_id = tasks.id and ta.user_id = auth.uid()
  )
  or (
    project_id is not null and exists (
      select 1 from public.project_members pm
      where pm.project_id = tasks.project_id and pm.user_id = auth.uid()
    )
  )
);

drop policy if exists "tasks_insert_owner" on public.tasks;
create policy "tasks_insert_owner" on public.tasks
for insert to authenticated with check (owner_id = auth.uid());

drop policy if exists "tasks_update_access" on public.tasks;
create policy "tasks_update_access" on public.tasks
for update to authenticated using (
  owner_id = auth.uid()
  or exists (
    select 1 from public.task_assignees ta
    where ta.task_id = tasks.id and ta.user_id = auth.uid()
  )
  or (
    project_id is not null and exists (
      select 1 from public.project_members pm
      where pm.project_id = tasks.project_id and pm.user_id = auth.uid()
    )
  )
) with check (
  owner_id = auth.uid()
  or (
    project_id is not null and exists (
      select 1 from public.project_members pm
      where pm.project_id = tasks.project_id and pm.user_id = auth.uid()
    )
  )
);

drop policy if exists "tasks_delete_owner" on public.tasks;
create policy "tasks_delete_owner" on public.tasks
for delete to authenticated using (owner_id = auth.uid());

drop policy if exists "task_assignees_select_access" on public.task_assignees;
create policy "task_assignees_select_access" on public.task_assignees
for select to authenticated using (
  user_id = auth.uid()
  or exists (
    select 1 from public.tasks t
    where t.id = task_assignees.task_id and t.owner_id = auth.uid()
  )
);

drop policy if exists "task_assignees_insert_task_owner" on public.task_assignees;
create policy "task_assignees_insert_task_owner" on public.task_assignees
for insert to authenticated with check (
  exists (
    select 1 from public.tasks t
    where t.id = task_assignees.task_id and t.owner_id = auth.uid()
  )
);

drop policy if exists "task_assignees_delete_task_owner" on public.task_assignees;
create policy "task_assignees_delete_task_owner" on public.task_assignees
for delete to authenticated using (
  exists (
    select 1 from public.tasks t
    where t.id = task_assignees.task_id and t.owner_id = auth.uid()
  )
);

drop policy if exists "comments_select_access" on public.comments;
create policy "comments_select_access" on public.comments
for select to authenticated using (
  (
    task_id is not null and exists (
      select 1
      from public.tasks t
      where t.id = comments.task_id
        and (
          t.owner_id = auth.uid()
          or exists (
            select 1 from public.task_assignees ta
            where ta.task_id = t.id and ta.user_id = auth.uid()
          )
          or (
            t.project_id is not null and exists (
              select 1 from public.project_members pm
              where pm.project_id = t.project_id and pm.user_id = auth.uid()
            )
          )
        )
    )
  )
  or
  (
    project_id is not null and exists (
      select 1
      from public.projects p
      where p.id = comments.project_id
        and (
          p.owner_id = auth.uid()
          or exists (
            select 1 from public.project_members pm
            where pm.project_id = p.id and pm.user_id = auth.uid()
          )
        )
    )
  )
);

drop policy if exists "comments_insert_access" on public.comments;
create policy "comments_insert_access" on public.comments
for insert to authenticated with check (author_id = auth.uid());

drop policy if exists "reminders_select_own" on public.reminders;
create policy "reminders_select_own" on public.reminders
for select to authenticated using (user_id = auth.uid());

drop policy if exists "reminders_insert_own" on public.reminders;
create policy "reminders_insert_own" on public.reminders
for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "reminders_update_own" on public.reminders;
create policy "reminders_update_own" on public.reminders
for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "reminders_delete_own" on public.reminders;
create policy "reminders_delete_own" on public.reminders
for delete to authenticated using (user_id = auth.uid());

drop policy if exists "activity_logs_select_own" on public.activity_logs;
create policy "activity_logs_select_own" on public.activity_logs
for select to authenticated using (user_id = auth.uid());

drop policy if exists "activity_logs_insert_own" on public.activity_logs;
create policy "activity_logs_insert_own" on public.activity_logs
for insert to authenticated with check (user_id = auth.uid());
