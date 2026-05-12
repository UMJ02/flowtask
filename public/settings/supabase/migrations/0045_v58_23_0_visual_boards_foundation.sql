-- v58.23.0 — Boards Foundation + Visual Canvas MVP
-- New visual boards module. Uses visual_* table names to avoid conflict with existing public.boards dashboard layout table.

create table if not exists public.visual_boards (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  organization_id uuid null,
  project_id uuid null references public.projects(id) on delete set null,
  task_id uuid null references public.tasks(id) on delete set null,
  title text not null default 'Nueva pizarra',
  description text,
  visibility text not null default 'private' check (visibility in ('private','workspace','public_link')),
  thumbnail_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.visual_board_elements (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.visual_boards(id) on delete cascade,
  type text not null check (type in ('sticky','text','shape','table')),
  x numeric not null default 0,
  y numeric not null default 0,
  width numeric not null default 160,
  height numeric not null default 80,
  rotation numeric not null default 0,
  z_index integer not null default 1,
  locked boolean not null default false,
  hidden boolean not null default false,
  data jsonb not null default '{}'::jsonb,
  style jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.visual_board_activity (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.visual_boards(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists visual_boards_owner_id_idx on public.visual_boards(owner_id);
create index if not exists visual_boards_organization_id_idx on public.visual_boards(organization_id);
create index if not exists visual_board_elements_board_id_idx on public.visual_board_elements(board_id);
create index if not exists visual_board_elements_not_deleted_idx on public.visual_board_elements(board_id) where deleted_at is null;

alter table public.visual_boards enable row level security;
alter table public.visual_board_elements enable row level security;
alter table public.visual_board_activity enable row level security;

drop policy if exists visual_boards_select_owner_or_org on public.visual_boards;
create policy visual_boards_select_owner_or_org
on public.visual_boards for select
using (
  deleted_at is null and (
    owner_id = auth.uid()
    or exists (
      select 1 from public.organization_members om
      where om.organization_id = visual_boards.organization_id
        and om.user_id = auth.uid()
    )
  )
);

drop policy if exists visual_boards_insert_owner on public.visual_boards;
create policy visual_boards_insert_owner
on public.visual_boards for insert
with check (owner_id = auth.uid());

drop policy if exists visual_boards_update_owner_or_org_member on public.visual_boards;
create policy visual_boards_update_owner_or_org_member
on public.visual_boards for update
using (
  owner_id = auth.uid()
  or exists (
    select 1 from public.organization_members om
    where om.organization_id = visual_boards.organization_id
      and om.user_id = auth.uid()
  )
)
with check (
  owner_id = auth.uid()
  or exists (
    select 1 from public.organization_members om
    where om.organization_id = visual_boards.organization_id
      and om.user_id = auth.uid()
  )
);

drop policy if exists visual_board_elements_select_by_board_access on public.visual_board_elements;
create policy visual_board_elements_select_by_board_access
on public.visual_board_elements for select
using (
  deleted_at is null and exists (
    select 1 from public.visual_boards vb
    where vb.id = visual_board_elements.board_id
      and vb.deleted_at is null
      and (
        vb.owner_id = auth.uid()
        or exists (
          select 1 from public.organization_members om
          where om.organization_id = vb.organization_id
            and om.user_id = auth.uid()
        )
      )
  )
);

drop policy if exists visual_board_elements_write_by_board_access on public.visual_board_elements;
create policy visual_board_elements_write_by_board_access
on public.visual_board_elements for all
using (
  exists (
    select 1 from public.visual_boards vb
    where vb.id = visual_board_elements.board_id
      and (
        vb.owner_id = auth.uid()
        or exists (
          select 1 from public.organization_members om
          where om.organization_id = vb.organization_id
            and om.user_id = auth.uid()
        )
      )
  )
)
with check (
  exists (
    select 1 from public.visual_boards vb
    where vb.id = visual_board_elements.board_id
      and (
        vb.owner_id = auth.uid()
        or exists (
          select 1 from public.organization_members om
          where om.organization_id = vb.organization_id
            and om.user_id = auth.uid()
        )
      )
  )
);

drop policy if exists visual_board_activity_select_by_board_access on public.visual_board_activity;
create policy visual_board_activity_select_by_board_access
on public.visual_board_activity for select
using (
  exists (
    select 1 from public.visual_boards vb
    where vb.id = visual_board_activity.board_id
      and vb.deleted_at is null
      and (vb.owner_id = auth.uid() or exists (
        select 1 from public.organization_members om
        where om.organization_id = vb.organization_id and om.user_id = auth.uid()
      ))
  )
);

drop policy if exists visual_board_activity_insert_by_board_access on public.visual_board_activity;
create policy visual_board_activity_insert_by_board_access
on public.visual_board_activity for insert
with check (
  exists (
    select 1 from public.visual_boards vb
    where vb.id = visual_board_activity.board_id
      and (vb.owner_id = auth.uid() or exists (
        select 1 from public.organization_members om
        where om.organization_id = vb.organization_id and om.user_id = auth.uid()
      ))
  )
);
