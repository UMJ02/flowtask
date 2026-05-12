-- v58.23.3 — Board Templates + Comments Activity
-- Adds comments table for visual boards and hardens element type constraint for connector support.

-- Older v58.23.0 installations only allowed sticky/text/shape/table.
-- v58.23.1 introduced connectors in code, so this migration keeps databases aligned.
do $$
declare
  constraint_name text;
begin
  select conname into constraint_name
  from pg_constraint
  where conrelid = 'public.visual_board_elements'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) ilike '%type%';

  if constraint_name is not null then
    execute format('alter table public.visual_board_elements drop constraint %I', constraint_name);
  end if;
end $$;

alter table public.visual_board_elements
add constraint visual_board_elements_type_check
check (type in ('sticky','text','shape','connector','table'));

create table if not exists public.visual_board_comments (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.visual_boards(id) on delete cascade,
  element_id uuid null references public.visual_board_elements(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  x numeric,
  y numeric,
  body text not null,
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists visual_board_comments_board_id_idx on public.visual_board_comments(board_id);
create index if not exists visual_board_comments_element_id_idx on public.visual_board_comments(element_id);

alter table public.visual_board_comments enable row level security;

drop policy if exists visual_board_comments_select_by_board_access on public.visual_board_comments;
create policy visual_board_comments_select_by_board_access
on public.visual_board_comments for select
using (
  exists (
    select 1 from public.visual_boards vb
    where vb.id = visual_board_comments.board_id
      and vb.deleted_at is null
      and (
        vb.owner_id = auth.uid()
        or exists (
          select 1 from public.organization_members om
          where om.organization_id = vb.organization_id and om.user_id = auth.uid()
        )
      )
  )
);

drop policy if exists visual_board_comments_insert_by_board_access on public.visual_board_comments;
create policy visual_board_comments_insert_by_board_access
on public.visual_board_comments for insert
with check (
  exists (
    select 1 from public.visual_boards vb
    where vb.id = visual_board_comments.board_id
      and vb.deleted_at is null
      and (
        vb.owner_id = auth.uid()
        or exists (
          select 1 from public.organization_members om
          where om.organization_id = vb.organization_id and om.user_id = auth.uid()
        )
      )
  )
);

drop policy if exists visual_board_comments_update_by_author_or_board_owner on public.visual_board_comments;
create policy visual_board_comments_update_by_author_or_board_owner
on public.visual_board_comments for update
using (
  author_id = auth.uid()
  or exists (
    select 1 from public.visual_boards vb
    where vb.id = visual_board_comments.board_id and vb.owner_id = auth.uid()
  )
)
with check (
  author_id = auth.uid()
  or exists (
    select 1 from public.visual_boards vb
    where vb.id = visual_board_comments.board_id and vb.owner_id = auth.uid()
  )
);
