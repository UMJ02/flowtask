-- v58.25.7.4 — Visual Board Safe Delete RPC + RLS Soft Delete Alignment
-- Fixes client-side 403 when soft deleting visual_boards because the UPDATE policy
-- used WITH CHECK (deleted_at is null), which rejects the new soft-deleted row.

-- 1) Keep normal update/edit behavior, but allow the new row to have deleted_at set
-- when the old row was visible and the authenticated user has board edit access.
drop policy if exists visual_boards_update_access on public.visual_boards;

create policy visual_boards_update_access
on public.visual_boards
for update
to authenticated
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
);

-- 2) Security-definer RPC used by the app for deletion confirmation.
-- It avoids the PostgREST .update(...).select("id") problem where SELECT RLS can hide
-- the row immediately after deleted_at is set.
create or replace function public.safe_delete_visual_board(p_board_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_board public.visual_boards%rowtype;
  v_is_allowed boolean := false;
begin
  if v_user_id is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;

  select *
  into v_board
  from public.visual_boards
  where id = p_board_id
    and deleted_at is null;

  if not found then
    return false;
  end if;

  v_is_allowed :=
    v_board.owner_id = v_user_id
    or exists (
      select 1
      from public.organization_members om
      where om.organization_id = v_board.organization_id
        and om.user_id = v_user_id
        and lower(coalesce(om.role, '')) in ('owner', 'admin', 'admin_global')
    )
    or public.visual_board_collaborator_role(v_board.id) = 'admin';

  if not v_is_allowed then
    raise exception 'Not allowed to delete this visual board' using errcode = '42501';
  end if;

  update public.visual_boards
  set deleted_at = now(),
      updated_at = now()
  where id = p_board_id
    and deleted_at is null;

  return found;
end;
$$;

revoke all on function public.safe_delete_visual_board(uuid) from public;
grant execute on function public.safe_delete_visual_board(uuid) to authenticated;
