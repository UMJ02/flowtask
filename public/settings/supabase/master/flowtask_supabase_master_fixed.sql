-- FlowTask Supabase master schema
-- Built from the project's migration chain (0001-0018) and adjusted
-- for direct execution from the Supabase SQL Editor on a NEW database.
--
-- Recommended execution:
-- 1) Run this file once in SQL Editor.
-- 2) Then run the companion seed file for departments.
-- 3) Then create your first auth user from the app; profile + board are auto-created.


-- =====================================================================
-- 0001_init.sql
-- =====================================================================

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


-- =====================================================================
-- 0002_share_functions.sql
-- =====================================================================

create or replace function public.shared_project_details(p_token text)
returns jsonb
language sql
security definer
set search_path = public
as $$
  with project_row as (
    select
      p.id,
      p.title,
      p.description,
      p.status,
      p.client_name,
      p.due_date,
      p.created_at,
      p.updated_at,
      p.is_collaborative,
      d.name as department_name
    from public.projects p
    left join public.departments d on d.id = p.department_id
    where p.share_enabled = true
      and p.share_token = p_token
    limit 1
  ),
  project_comments as (
    select jsonb_agg(
      jsonb_build_object(
        'content', c.content,
        'created_at', c.created_at
      ) order by c.created_at desc
    ) as items
    from public.comments c
    join project_row p on p.id = c.project_id
  ),
  project_tasks as (
    select jsonb_agg(
      jsonb_build_object(
        'id', t.id,
        'title', t.title,
        'status', t.status,
        'client_name', t.client_name,
        'due_date', t.due_date,
        'created_at', t.created_at
      ) order by t.created_at desc
    ) as items
    from public.tasks t
    join project_row p on p.id = t.project_id
  )
  select case
    when exists(select 1 from project_row) then
      (
        select jsonb_build_object(
          'project', to_jsonb(project_row.*),
          'comments', coalesce(project_comments.items, '[]'::jsonb),
          'tasks', coalesce(project_tasks.items, '[]'::jsonb)
        )
        from project_row, project_comments, project_tasks
      )
    else null
  end;
$$;

grant execute on function public.shared_project_details(text) to anon, authenticated;

create or replace function public.shared_task_details(p_token text)
returns jsonb
language sql
security definer
set search_path = public
as $$
  with task_row as (
    select
      t.id,
      t.title,
      t.description,
      t.status,
      t.client_name,
      t.due_date,
      t.created_at,
      t.updated_at,
      t.priority,
      d.name as department_name,
      p.title as project_title
    from public.tasks t
    left join public.departments d on d.id = t.department_id
    left join public.projects p on p.id = t.project_id
    where t.share_enabled = true
      and t.share_token = p_token
    limit 1
  ),
  task_comments as (
    select jsonb_agg(
      jsonb_build_object(
        'content', c.content,
        'created_at', c.created_at
      ) order by c.created_at desc
    ) as items
    from public.comments c
    join task_row t on t.id = c.task_id
  )
  select case
    when exists(select 1 from task_row) then
      (
        select jsonb_build_object(
          'task', to_jsonb(task_row.*),
          'comments', coalesce(task_comments.items, '[]'::jsonb)
        )
        from task_row, task_comments
      )
    else null
  end;
$$;

grant execute on function public.shared_task_details(text) to anon, authenticated;


-- =====================================================================
-- 0003_realtime.sql
-- =====================================================================

-- Realtime publication support for FlowTask v7.2
alter publication supabase_realtime add table public.comments;
alter publication supabase_realtime add table public.tasks;
alter publication supabase_realtime add table public.projects;


-- =====================================================================
-- 0004_project_member_roles.sql
-- =====================================================================

-- Permite al owner del proyecto actualizar el rol de sus miembros.
create policy "project_members_update_project_owner"
on public.project_members
for update
to authenticated
using (
  exists (
    select 1
    from public.projects p
    where p.id = project_members.project_id
      and p.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.projects p
    where p.id = project_members.project_id
      and p.owner_id = auth.uid()
  )
  and role in ('owner', 'editor', 'viewer')
);


-- =====================================================================
-- 0005_attachments_and_section_permissions.sql
-- =====================================================================

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

drop policy if exists "attachments_select_access" on public.attachments;
create policy "attachments_select_access"
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

drop policy if exists "attachments_insert_owner" on public.attachments;
create policy "attachments_insert_owner"
on public.attachments
for insert
to authenticated
with check (owner_id = auth.uid());

drop policy if exists "attachments_delete_owner" on public.attachments;
create policy "attachments_delete_owner"
on public.attachments
for delete
to authenticated
using (owner_id = auth.uid());

drop policy if exists "project_section_permissions_select_project_access" on public.project_section_permissions;
create policy "project_section_permissions_select_project_access"
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

drop policy if exists "project_section_permissions_write_owner" on public.project_section_permissions;
create policy "project_section_permissions_write_owner"
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


-- =====================================================================
-- 0006_activity_notifications.sql
-- =====================================================================

create extension if not exists pgcrypto;

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text,
  kind text not null default 'info',
  entity_type text,
  entity_id uuid,
  is_read boolean not null default false,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists notifications_user_created_idx
  on public.notifications (user_id, created_at desc);
create index if not exists notifications_user_unread_idx
  on public.notifications (user_id, is_read);
create index if not exists activity_logs_entity_idx
  on public.activity_logs (entity_type, entity_id, created_at desc);

alter table public.notifications enable row level security;

DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
create policy "notifications_select_own"
on public.notifications
for select
to authenticated
using (user_id = auth.uid());

DROP POLICY IF EXISTS "notifications_insert_own" ON public.notifications;
create policy "notifications_insert_own"
on public.notifications
for insert
to authenticated
with check (user_id = auth.uid());

DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
create policy "notifications_update_own"
on public.notifications
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create or replace function public.set_notification_read_at()
returns trigger
language plpgsql
as $$
begin
  if new.is_read = true and coalesce(old.is_read, false) = false then
    new.read_at = now();
  elsif new.is_read = false then
    new.read_at = null;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_notifications_read_at on public.notifications;
create trigger trg_notifications_read_at
before update on public.notifications
for each row execute function public.set_notification_read_at();


-- =====================================================================
-- 0007_notifications_realtime.sql
-- =====================================================================

alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.activity_logs;


-- =====================================================================
-- 0008_notification_preferences.sql
-- =====================================================================

create table if not exists public.notification_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  enable_task boolean not null default true,
  enable_project boolean not null default true,
  enable_comment boolean not null default true,
  enable_reminder boolean not null default true,
  enable_toasts boolean not null default true,
  enable_email boolean not null default false,
  enable_whatsapp boolean not null default false,
  delivery_frequency text not null default 'immediate',
  daily_digest_hour smallint not null default 8,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint notification_preferences_delivery_frequency_check check (delivery_frequency in ('immediate', 'daily')),
  constraint notification_preferences_daily_digest_hour_check check (daily_digest_hour between 0 and 23)
);

alter table public.notification_preferences enable row level security;

drop policy if exists "notification_preferences_select_own" on public.notification_preferences;
create policy "notification_preferences_select_own"
on public.notification_preferences
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "notification_preferences_insert_own" on public.notification_preferences;
create policy "notification_preferences_insert_own"
on public.notification_preferences
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "notification_preferences_update_own" on public.notification_preferences;
create policy "notification_preferences_update_own"
on public.notification_preferences
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create or replace function public.set_notification_preferences_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_notification_preferences_updated_at on public.notification_preferences;
create trigger trg_notification_preferences_updated_at
before update on public.notification_preferences
for each row execute function public.set_notification_preferences_updated_at();


-- =====================================================================
-- 0009_notification_quiet_hours.sql
-- =====================================================================

alter table public.notification_preferences
  add column if not exists quiet_hours_enabled boolean not null default false,
  add column if not exists quiet_hours_start smallint not null default 22,
  add column if not exists quiet_hours_end smallint not null default 7;

alter table public.notification_preferences
  drop constraint if exists notification_preferences_quiet_hours_start_check,
  drop constraint if exists notification_preferences_quiet_hours_end_check;

alter table public.notification_preferences
  add constraint notification_preferences_quiet_hours_start_check check (quiet_hours_start between 0 and 23),
  add constraint notification_preferences_quiet_hours_end_check check (quiet_hours_end between 0 and 23);


-- =====================================================================
-- 0010_notification_delivery_queue.sql
-- =====================================================================

create extension if not exists pgcrypto;

create table if not exists public.notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  notification_id uuid not null references public.notifications(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  channel text not null,
  status text not null default 'queued',
  error_message text,
  provider_response jsonb not null default '{}'::jsonb,
  attempted_at timestamptz not null default now(),
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  constraint notification_deliveries_channel_check check (channel in ('email', 'whatsapp')),
  constraint notification_deliveries_status_check check (status in ('queued', 'sent', 'skipped', 'failed'))
);

create index if not exists notification_deliveries_notification_idx
  on public.notification_deliveries (notification_id, created_at desc);
create index if not exists notification_deliveries_user_idx
  on public.notification_deliveries (user_id, created_at desc);

create table if not exists public.daily_notification_digests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  digest_date date not null,
  delivery_frequency text not null default 'daily',
  status text not null default 'queued',
  total_notifications integer not null default 0,
  summary_title text not null,
  summary_body text,
  created_at timestamptz not null default now(),
  processed_at timestamptz,
  unique (user_id, digest_date),
  constraint daily_notification_digests_status_check check (status in ('queued', 'sent', 'skipped', 'failed')),
  constraint daily_notification_digests_delivery_frequency_check check (delivery_frequency in ('daily'))
);

create index if not exists daily_notification_digests_user_idx
  on public.daily_notification_digests (user_id, digest_date desc);

alter table public.notification_deliveries enable row level security;
alter table public.daily_notification_digests enable row level security;

drop policy if exists "notification_deliveries_select_own" on public.notification_deliveries;
create policy "notification_deliveries_select_own"
on public.notification_deliveries
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "daily_notification_digests_select_own" on public.daily_notification_digests;
create policy "daily_notification_digests_select_own"
on public.daily_notification_digests
for select
to authenticated
using (user_id = auth.uid());


-- =====================================================================
-- 0011_notification_delivery_retries.sql
-- =====================================================================

alter table if exists public.notification_deliveries
  add column if not exists attempt_number integer not null default 1,
  add column if not exists retry_after timestamptz,
  add column if not exists retry_group text;

create index if not exists notification_deliveries_status_idx
  on public.notification_deliveries (user_id, status, attempted_at desc);

create index if not exists notification_deliveries_retry_after_idx
  on public.notification_deliveries (status, retry_after);


-- =====================================================================
-- 0012_organizations_multi_tenant.sql
-- =====================================================================

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  owner_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member',
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  unique (organization_id, user_id),
  constraint organization_members_role_check check (role in ('admin_global', 'manager', 'member', 'viewer'))
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (organization_id, name)
);

alter table public.projects add column if not exists organization_id uuid references public.organizations(id) on delete set null;
alter table public.tasks add column if not exists organization_id uuid references public.organizations(id) on delete set null;
alter table public.projects add column if not exists client_id uuid references public.clients(id) on delete set null;
alter table public.tasks add column if not exists client_id uuid references public.clients(id) on delete set null;

create table if not exists public.client_permissions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  role text not null default 'viewer',
  can_view boolean not null default true,
  can_edit boolean not null default false,
  can_manage_members boolean not null default false,
  created_at timestamptz not null default now(),
  unique (organization_id, client_id, user_id),
  constraint client_permissions_role_check check (role in ('admin_global', 'manager', 'member', 'viewer'))
);

alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.clients enable row level security;
alter table public.client_permissions enable row level security;

drop policy if exists "organizations_select_member" on public.organizations;
create policy "organizations_select_member" on public.organizations for select to authenticated using (
  exists (
    select 1 from public.organization_members om
    where om.organization_id = organizations.id and om.user_id = auth.uid()
  )
);

drop policy if exists "organization_members_select_member" on public.organization_members;
create policy "organization_members_select_member" on public.organization_members for select to authenticated using (
  user_id = auth.uid() or exists (
    select 1 from public.organization_members om
    where om.organization_id = organization_members.organization_id
      and om.user_id = auth.uid()
      and om.role in ('admin_global','manager')
  )
);

drop policy if exists "clients_select_org_member" on public.clients;
create policy "clients_select_org_member" on public.clients for select to authenticated using (
  exists (
    select 1 from public.organization_members om
    where om.organization_id = clients.organization_id and om.user_id = auth.uid()
  )
);

drop policy if exists "client_permissions_select_related" on public.client_permissions;
create policy "client_permissions_select_related" on public.client_permissions for select to authenticated using (
  user_id = auth.uid() or exists (
    select 1 from public.organization_members om
    where om.organization_id = client_permissions.organization_id
      and om.user_id = auth.uid()
      and om.role in ('admin_global','manager')
  )
);


-- =====================================================================
-- 0013_organization_invites.sql
-- =====================================================================

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


-- =====================================================================
-- 0014_roles_permissions.sql
-- =====================================================================

create table if not exists public.organization_permission_definitions (
  key text primary key,
  label text not null,
  description text,
  category text not null check (category in ('tasks','projects','clients','team','reports')),
  created_at timestamptz not null default now()
);

create table if not exists public.organization_role_templates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  description text not null default '',
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  unique (organization_id, name)
);

create table if not exists public.organization_role_permissions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  role_template_id uuid not null references public.organization_role_templates(id) on delete cascade,
  permission_key text not null references public.organization_permission_definitions(key) on delete cascade,
  created_at timestamptz not null default now(),
  unique (organization_id, role_template_id, permission_key)
);

alter table public.organization_permission_definitions enable row level security;
alter table public.organization_role_templates enable row level security;
alter table public.organization_role_permissions enable row level security;

do $$ begin
  create policy "organization_permission_definitions_select_authenticated"
  on public.organization_permission_definitions for select to authenticated using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "organization_role_templates_select_member"
  on public.organization_role_templates for select to authenticated using (
    exists (
      select 1 from public.organization_members om
      where om.organization_id = organization_role_templates.organization_id
        and om.user_id = auth.uid()
    )
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "organization_role_permissions_select_member"
  on public.organization_role_permissions for select to authenticated using (
    exists (
      select 1 from public.organization_members om
      where om.organization_id = organization_role_permissions.organization_id
        and om.user_id = auth.uid()
    )
  );
exception when duplicate_object then null; end $$;

insert into public.organization_permission_definitions (key, label, description, category) values
  ('tasks.create', 'Crear tareas', 'Permite crear nuevas tareas dentro de la organización.', 'tasks'),
  ('tasks.edit', 'Editar tareas', 'Permite actualizar contenido y seguimiento de tareas.', 'tasks'),
  ('tasks.delete', 'Eliminar tareas', 'Permite borrar tareas creadas dentro de la organización.', 'tasks'),
  ('projects.manage', 'Gestionar proyectos', 'Permite crear, editar y cerrar proyectos.', 'projects'),
  ('clients.manage', 'Gestionar clientes', 'Permite cambiar permisos y configuración por cliente.', 'clients'),
  ('team.invite', 'Invitar miembros', 'Permite invitar nuevas personas y asignar roles.', 'team'),
  ('reports.view', 'Ver reportes', 'Permite acceder a métricas y exportaciones.', 'reports')
on conflict (key) do update set
  label = excluded.label,
  description = excluded.description,
  category = excluded.category;

insert into public.organization_role_templates (organization_id, name, description, is_system)
select o.id, r.name, r.description, true
from public.organizations o
cross join (
  values
    ('admin_global', 'Control total de organización y clientes.'),
    ('manager', 'Coordinación operativa con acceso a equipo y reportes.'),
    ('member', 'Ejecución operativa diaria sobre tareas.'),
    ('viewer', 'Lectura y seguimiento para jefatura.')
) as r(name, description)
on conflict (organization_id, name) do nothing;

insert into public.organization_role_permissions (organization_id, role_template_id, permission_key)
select rt.organization_id, rt.id, perms.permission_key
from public.organization_role_templates rt
join lateral (
  select unnest(
    case rt.name
      when 'admin_global' then array['tasks.create','tasks.edit','tasks.delete','projects.manage','clients.manage','team.invite','reports.view']::text[]
      when 'manager' then array['tasks.create','tasks.edit','projects.manage','clients.manage','team.invite','reports.view']::text[]
      when 'member' then array['tasks.create','tasks.edit']::text[]
      when 'viewer' then array['reports.view']::text[]
      else array[]::text[]
    end
  ) as permission_key
) perms on true
on conflict (organization_id, role_template_id, permission_key) do nothing;


-- =====================================================================
-- 0015_clients_workspace.sql
-- =====================================================================

alter table public.clients add column if not exists status text not null default 'activo' check (status in ('activo','en_pausa','cerrado'));
alter table public.clients add column if not exists notes text;
alter table public.clients add column if not exists account_owner_id uuid references public.profiles(id) on delete set null;

create index if not exists clients_organization_status_idx on public.clients (organization_id, status);
create index if not exists projects_client_id_idx on public.projects (client_id);
create index if not exists tasks_client_id_idx on public.tasks (client_id);

drop policy if exists "clients_insert_org_manager" on public.clients;
create policy "clients_insert_org_manager" on public.clients for insert to authenticated with check (
  exists (
    select 1 from public.organization_members om
    where om.organization_id = clients.organization_id
      and om.user_id = auth.uid()
      and om.role in ('admin_global','manager')
  )
);

drop policy if exists "clients_update_org_manager" on public.clients;
create policy "clients_update_org_manager" on public.clients for update to authenticated using (
  exists (
    select 1 from public.organization_members om
    where om.organization_id = clients.organization_id
      and om.user_id = auth.uid()
      and om.role in ('admin_global','manager')
  )
) with check (
  exists (
    select 1 from public.organization_members om
    where om.organization_id = clients.organization_id
      and om.user_id = auth.uid()
      and om.role in ('admin_global','manager')
  )
);

drop policy if exists "clients_delete_org_admin" on public.clients;
create policy "clients_delete_org_admin" on public.clients for delete to authenticated using (
  exists (
    select 1 from public.organization_members om
    where om.organization_id = clients.organization_id
      and om.user_id = auth.uid()
      and om.role = 'admin_global'
  )
);


-- =====================================================================
-- 0016_billing_subscription_limits.sql
-- =====================================================================

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


-- =====================================================================
-- 0017_super_admin_platform.sql
-- =====================================================================

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


-- =====================================================================
-- 0018_data_security_hardening.sql
-- =====================================================================

create or replace function public.is_org_admin_or_manager(org_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.organization_members om
    where om.organization_id = org_id
      and om.user_id = auth.uid()
      and om.role in ('admin_global', 'manager')
  );
$$;

create or replace function public.is_org_admin(org_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.organization_members om
    where om.organization_id = org_id
      and om.user_id = auth.uid()
      and om.role = 'admin_global'
  );
$$;

create index if not exists organization_members_user_default_idx on public.organization_members (user_id, is_default desc, created_at desc);
create index if not exists client_permissions_org_user_idx on public.client_permissions (organization_id, user_id, client_id);
create index if not exists organization_invites_org_email_status_idx on public.organization_invites (organization_id, email, status);
create index if not exists organization_role_templates_org_name_idx on public.organization_role_templates (organization_id, name);
create index if not exists organization_role_permissions_org_role_idx on public.organization_role_permissions (organization_id, role_template_id);

create policy "organizations_update_admin"
on public.organizations
for update to authenticated
using (public.is_org_admin(id))
with check (public.is_org_admin(id));

do $$ begin
  create policy "organization_members_insert_admin_or_manager"
  on public.organization_members
  for insert to authenticated
  with check (public.is_org_admin_or_manager(organization_id));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "organization_members_update_admin_or_manager"
  on public.organization_members
  for update to authenticated
  using (public.is_org_admin_or_manager(organization_id))
  with check (public.is_org_admin_or_manager(organization_id));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "organization_members_delete_admin"
  on public.organization_members
  for delete to authenticated
  using (public.is_org_admin(organization_id));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "client_permissions_insert_admin_or_manager"
  on public.client_permissions
  for insert to authenticated
  with check (public.is_org_admin_or_manager(organization_id));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "client_permissions_update_admin_or_manager"
  on public.client_permissions
  for update to authenticated
  using (public.is_org_admin_or_manager(organization_id))
  with check (public.is_org_admin_or_manager(organization_id));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "client_permissions_delete_admin"
  on public.client_permissions
  for delete to authenticated
  using (public.is_org_admin(organization_id));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "organization_role_templates_insert_admin_or_manager"
  on public.organization_role_templates
  for insert to authenticated
  with check (public.is_org_admin_or_manager(organization_id));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "organization_role_templates_update_admin_or_manager"
  on public.organization_role_templates
  for update to authenticated
  using (public.is_org_admin_or_manager(organization_id))
  with check (public.is_org_admin_or_manager(organization_id));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "organization_role_templates_delete_admin"
  on public.organization_role_templates
  for delete to authenticated
  using (public.is_org_admin(organization_id));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "organization_role_permissions_insert_admin_or_manager"
  on public.organization_role_permissions
  for insert to authenticated
  with check (public.is_org_admin_or_manager(organization_id));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "organization_role_permissions_update_admin_or_manager"
  on public.organization_role_permissions
  for update to authenticated
  using (public.is_org_admin_or_manager(organization_id))
  with check (public.is_org_admin_or_manager(organization_id));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "organization_role_permissions_delete_admin"
  on public.organization_role_permissions
  for delete to authenticated
  using (public.is_org_admin(organization_id));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "organization_invites_update_admin_or_manager"
  on public.organization_invites
  for update to authenticated
  using (public.is_org_admin_or_manager(organization_id))
  with check (public.is_org_admin_or_manager(organization_id));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "organization_invites_delete_admin_or_manager"
  on public.organization_invites
  for delete to authenticated
  using (public.is_org_admin_or_manager(organization_id));
exception when duplicate_object then null; end $$;


-- =====================================================================
-- extra_runtime_support.sql
-- Added to make the project fully operable after schema creation.
-- =====================================================================

-- Storage bucket used by src/components/attachments/entity-attachments.tsx
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'attachments',
  'attachments',
  true,
  52428800,
  array[
    'image/jpeg','image/png','image/webp','application/pdf',
    'text/plain','application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]::text[]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "attachments_bucket_read_public" on storage.objects;
create policy "attachments_bucket_read_public"
on storage.objects
for select
to public
using (bucket_id = 'attachments');

drop policy if exists "attachments_bucket_write_authenticated" on storage.objects;
create policy "attachments_bucket_write_authenticated"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'attachments');

drop policy if exists "attachments_bucket_update_authenticated" on storage.objects;
create policy "attachments_bucket_update_authenticated"
on storage.objects
for update
to authenticated
using (bucket_id = 'attachments')
with check (bucket_id = 'attachments');

drop policy if exists "attachments_bucket_delete_authenticated" on storage.objects;
create policy "attachments_bucket_delete_authenticated"
on storage.objects
for delete
to authenticated
using (bucket_id = 'attachments');

-- Ensure every new organization gets its default role templates + permissions.
create or replace function public.bootstrap_organization_defaults(p_organization_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.organization_role_templates (organization_id, name, description, is_system)
  select p_organization_id, r.name, r.description, true
  from (
    values
      ('admin_global', 'Control total de organización y clientes.'),
      ('manager', 'Coordinación operativa con acceso a equipo y reportes.'),
      ('member', 'Ejecución operativa diaria sobre tareas.'),
      ('viewer', 'Lectura y seguimiento para jefatura.')
  ) as r(name, description)
  on conflict (organization_id, name) do nothing;

  insert into public.organization_role_permissions (organization_id, role_template_id, permission_key)
  select rt.organization_id, rt.id, perms.permission_key
  from public.organization_role_templates rt
  join lateral (
    select unnest(
      case rt.name
        when 'admin_global' then array['tasks.create','tasks.edit','tasks.delete','projects.manage','clients.manage','team.invite','reports.view']::text[]
        when 'manager' then array['tasks.create','tasks.edit','projects.manage','clients.manage','team.invite','reports.view']::text[]
        when 'member' then array['tasks.create','tasks.edit']::text[]
        when 'viewer' then array['reports.view']::text[]
        else array[]::text[]
      end
    ) as permission_key
  ) perms on true
  where rt.organization_id = p_organization_id
  on conflict (organization_id, role_template_id, permission_key) do nothing;

  insert into public.organization_subscriptions (
    organization_id, plan_code, plan_name, status, billing_cycle,
    trial_ends_at, renews_at, seats_included, seats_used,
    projects_included, projects_used, storage_gb_included, storage_gb_used
  )
  values (
    p_organization_id, 'starter', 'Starter', 'trial', 'monthly',
    now() + interval '14 days', now() + interval '14 days',
    5, 1, 25, 0, 5, 0
  )
  on conflict (organization_id) do nothing;
end;
$$;

create or replace function public.handle_new_organization_defaults()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.bootstrap_organization_defaults(new.id);
  return new;
end;
$$;

drop trigger if exists trg_organizations_bootstrap_defaults on public.organizations;
create trigger trg_organizations_bootstrap_defaults
after insert on public.organizations
for each row execute function public.handle_new_organization_defaults();

-- Backfill defaults for organizations already inserted before this trigger exists.
do $$
declare
  org record;
begin
  for org in select id from public.organizations loop
    perform public.bootstrap_organization_defaults(org.id);
  end loop;
end $$;

-- Make the onboarding ticket backfill idempotent.
delete from public.internal_support_tickets ist
where exists (
  select 1
  from public.organizations o
  where o.id = ist.organization_id
    and o.owner_id = ist.requester_user_id
    and ist.subject = concat('Onboarding inicial · ', o.name)
)
and ist.id not in (
  select distinct on (ist2.organization_id, ist2.requester_user_id, ist2.subject) ist2.id
  from public.internal_support_tickets ist2
  join public.organizations o2 on o2.id = ist2.organization_id
  where o2.owner_id = ist2.requester_user_id
    and ist2.subject = concat('Onboarding inicial · ', o2.name)
  order by ist2.organization_id, ist2.requester_user_id, ist2.subject, ist2.created_at asc, ist2.id asc
);
