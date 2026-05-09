-- v58.23.4 — Board Sharing + Collaboration Layer
-- Adds controlled sharing metadata, public read-only board links and collaborator access records.

alter table public.visual_boards
  add column if not exists share_token text,
  add column if not exists public_can_edit boolean not null default false;

create unique index if not exists visual_boards_share_token_unique
  on public.visual_boards(share_token)
  where share_token is not null;

create table if not exists public.visual_board_collaborators (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.visual_boards(id) on delete cascade,
  user_id uuid null references public.profiles(id) on delete cascade,
  email text null,
  role text not null default 'viewer' check (role in ('viewer','editor','admin')),
  invited_by uuid null references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  accepted_at timestamptz
);

create unique index if not exists visual_board_collaborators_board_user_unique
  on public.visual_board_collaborators(board_id, user_id)
  where user_id is not null;

create index if not exists visual_board_collaborators_board_id_idx
  on public.visual_board_collaborators(board_id);

create index if not exists visual_board_collaborators_email_idx
  on public.visual_board_collaborators(lower(email))
  where email is not null;

create unique index if not exists visual_board_collaborators_board_email_unique
  on public.visual_board_collaborators(board_id, email)
  where email is not null;

alter table public.visual_board_collaborators enable row level security;

-- Board owners and organization members can see collaboration records.
drop policy if exists visual_board_collaborators_select_by_board_access on public.visual_board_collaborators;
create policy visual_board_collaborators_select_by_board_access
on public.visual_board_collaborators for select
using (
  exists (
    select 1 from public.visual_boards vb
    where vb.id = visual_board_collaborators.board_id
      and vb.deleted_at is null
      and (
        vb.owner_id = auth.uid()
        or exists (
          select 1 from public.organization_members om
          where om.organization_id = vb.organization_id
            and om.user_id = auth.uid()
        )
        or visual_board_collaborators.user_id = auth.uid()
      )
  )
);

-- Only board owners and organization members may invite/update collaborators in this MVP.
drop policy if exists visual_board_collaborators_write_by_board_access on public.visual_board_collaborators;
create policy visual_board_collaborators_write_by_board_access
on public.visual_board_collaborators for all
using (
  exists (
    select 1 from public.visual_boards vb
    where vb.id = visual_board_collaborators.board_id
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
    where vb.id = visual_board_collaborators.board_id
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

-- Extend existing board read access to explicit collaborators and public read links.
drop policy if exists visual_boards_select_owner_or_org on public.visual_boards;
create policy visual_boards_select_owner_or_org
on public.visual_boards for select
using (
  deleted_at is null and (
    owner_id = auth.uid()
    or visibility = 'public_link'
    or exists (
      select 1 from public.organization_members om
      where om.organization_id = visual_boards.organization_id
        and om.user_id = auth.uid()
    )
    or exists (
      select 1 from public.visual_board_collaborators vbc
      where vbc.board_id = visual_boards.id
        and vbc.user_id = auth.uid()
    )
  )
);

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
  or exists (
    select 1 from public.visual_board_collaborators vbc
    where vbc.board_id = visual_boards.id
      and vbc.user_id = auth.uid()
      and vbc.role in ('editor','admin')
  )
)
with check (
  owner_id = auth.uid()
  or exists (
    select 1 from public.organization_members om
    where om.organization_id = visual_boards.organization_id
      and om.user_id = auth.uid()
  )
  or exists (
    select 1 from public.visual_board_collaborators vbc
    where vbc.board_id = visual_boards.id
      and vbc.user_id = auth.uid()
      and vbc.role in ('editor','admin')
  )
);

-- Elements: public_link can read; owners/org/editors can write.
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
        or vb.visibility = 'public_link'
        or exists (
          select 1 from public.organization_members om
          where om.organization_id = vb.organization_id
            and om.user_id = auth.uid()
        )
        or exists (
          select 1 from public.visual_board_collaborators vbc
          where vbc.board_id = vb.id
            and vbc.user_id = auth.uid()
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
        or exists (
          select 1 from public.visual_board_collaborators vbc
          where vbc.board_id = vb.id
            and vbc.user_id = auth.uid()
            and vbc.role in ('editor','admin')
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
        or exists (
          select 1 from public.visual_board_collaborators vbc
          where vbc.board_id = vb.id
            and vbc.user_id = auth.uid()
            and vbc.role in ('editor','admin')
        )
      )
  )
);

-- Comments and activity are readable from public read links; writing remains authenticated for this MVP.
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
        or vb.visibility = 'public_link'
        or exists (
          select 1 from public.organization_members om
          where om.organization_id = vb.organization_id and om.user_id = auth.uid()
        )
        or exists (
          select 1 from public.visual_board_collaborators vbc
          where vbc.board_id = vb.id and vbc.user_id = auth.uid()
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
      and (
        vb.owner_id = auth.uid()
        or vb.visibility = 'public_link'
        or exists (
          select 1 from public.organization_members om
          where om.organization_id = vb.organization_id and om.user_id = auth.uid()
        )
        or exists (
          select 1 from public.visual_board_collaborators vbc
          where vbc.board_id = vb.id and vbc.user_id = auth.uid()
        )
      )
  )
);
