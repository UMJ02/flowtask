-- v58.24.9.7 — Task safe delete + task list scale indexes
-- Safe delete is soft delete first. It avoids losing task history and keeps the app ready for Trash/Restore later.

alter table public.tasks
  add column if not exists deleted_at timestamptz,
  add column if not exists deleted_by uuid,
  add column if not exists delete_reason text;

create index if not exists tasks_owner_status_idx on public.tasks (owner_id, status) where deleted_at is null;
create index if not exists tasks_org_status_idx on public.tasks (organization_id, status) where deleted_at is null;
create index if not exists tasks_owner_due_idx on public.tasks (owner_id, due_date) where deleted_at is null;
create index if not exists tasks_org_due_idx on public.tasks (organization_id, due_date) where deleted_at is null;
create index if not exists tasks_owner_priority_idx on public.tasks (owner_id, priority) where deleted_at is null;
create index if not exists tasks_org_priority_idx on public.tasks (organization_id, priority) where deleted_at is null;
create index if not exists tasks_project_id_idx on public.tasks (project_id) where deleted_at is null;
create index if not exists tasks_deleted_at_idx on public.tasks (deleted_at) where deleted_at is not null;

create or replace function public.safe_delete_task(p_task_id uuid)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_updated integer := 0;
begin
  update public.tasks
  set
    deleted_at = v_now,
    deleted_by = auth.uid(),
    updated_at = v_now
  where id = p_task_id
    and deleted_at is null;

  get diagnostics v_updated = row_count;

  if v_updated = 0 then
    return jsonb_build_object(
      'ok', false,
      'taskId', p_task_id,
      'error', 'No se pudo eliminar la tarea o ya estaba eliminada.'
    );
  end if;

  return jsonb_build_object(
    'ok', true,
    'taskId', p_task_id,
    'deleted_at', v_now
  );
end;
$$;

grant execute on function public.safe_delete_task(uuid) to authenticated;
