-- v58.24.8.4 — Visual Boards RLS Workspace Scope Hardening
-- Apply only if the project has organization_members(organization_id, user_id)
-- and visual_board_collaborator_role(uuid).

drop policy if exists visual_boards_select_access on public.visual_boards;
drop policy if exists visual_boards_update_access on public.visual_boards;
drop policy if exists visual_boards_insert_owner on public.visual_boards;

create policy visual_boards_select_access
on public.visual_boards
for select
to public
using (
  deleted_at is null
  and (
    owner_id = auth.uid()
    or visibility = 'public_link'
    or exists (
      select 1
      from public.organization_members om
      where om.organization_id = visual_boards.organization_id
        and om.user_id = auth.uid()
    )
    or public.visual_board_collaborator_role(id) in ('viewer', 'editor', 'admin')
  )
);

create policy visual_boards_insert_owner
on public.visual_boards
for insert
to authenticated
with check (
  owner_id = auth.uid()
  and (
    organization_id is null
    or exists (
      select 1
      from public.organization_members om
      where om.organization_id = visual_boards.organization_id
        and om.user_id = auth.uid()
    )
  )
);

create policy visual_boards_update_access
on public.visual_boards
for update
to public
using (
  deleted_at is null
  and (
    owner_id = auth.uid()
    or exists (
      select 1
      from public.organization_members om
      where om.organization_id = visual_boards.organization_id
        and om.user_id = auth.uid()
    )
    or public.visual_board_collaborator_role(id) in ('editor', 'admin')
    or (
      visibility = 'public_link'
      and public_can_edit = true
    )
  )
)
with check (
  deleted_at is null
  and (
    owner_id = auth.uid()
    or exists (
      select 1
      from public.organization_members om
      where om.organization_id = visual_boards.organization_id
        and om.user_id = auth.uid()
    )
    or public.visual_board_collaborator_role(id) in ('editor', 'admin')
    or (
      visibility = 'public_link'
      and public_can_edit = true
    )
  )
);
