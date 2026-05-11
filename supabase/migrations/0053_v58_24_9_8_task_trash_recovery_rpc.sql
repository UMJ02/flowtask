-- v58.24.9.8 — Task trash recovery RPCs

create or replace function public.restore_deleted_task(p_task_id uuid)
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
    deleted_at = null,
    deleted_by = null,
    delete_reason = null,
    updated_at = v_now
  where id = p_task_id
    and deleted_at is not null;

  get diagnostics v_updated = row_count;

  if v_updated = 0 then
    return jsonb_build_object('ok', false, 'taskId', p_task_id, 'error', 'No se pudo restaurar la tarea.');
  end if;

  return jsonb_build_object('ok', true, 'taskId', p_task_id, 'restored_at', v_now);
end;
$$;

create or replace function public.purge_deleted_task(p_task_id uuid)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_deleted integer := 0;
begin
  delete from public.tasks
  where id = p_task_id
    and deleted_at is not null;

  get diagnostics v_deleted = row_count;

  if v_deleted = 0 then
    return jsonb_build_object('ok', false, 'taskId', p_task_id, 'error', 'No se pudo eliminar definitivamente la tarea.');
  end if;

  return jsonb_build_object('ok', true, 'taskId', p_task_id, 'purged', true);
end;
$$;

grant execute on function public.restore_deleted_task(uuid) to authenticated;
grant execute on function public.purge_deleted_task(uuid) to authenticated;
