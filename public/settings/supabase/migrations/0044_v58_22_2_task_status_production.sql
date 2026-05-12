-- V58.22.3 Production status migration hotfix
-- Allows Producción as an official task status without assuming optional lookup tables exist.
-- Safe for bases that only use the tasks.status CHECK constraint.

alter table public.tasks
  drop constraint if exists tasks_status_check;

alter table public.tasks
  add constraint tasks_status_check
  check (status in ('en_proceso', 'produccion', 'en_espera', 'concluido'));

-- Optional lookup table support.
-- Some environments do not have public.task_statuses, so this block is intentionally guarded.
do $$
begin
  if to_regclass('public.task_statuses') is not null then
    insert into public.task_statuses (
      value,
      label,
      color,
      counts_as_active,
      excluded_from_overdue,
      hidden_by_default,
      sort_order,
      is_system
    )
    values (
      'produccion',
      'Producción',
      'violet',
      true,
      false,
      false,
      15,
      true
    )
    on conflict (value) do update
    set
      label = excluded.label,
      color = excluded.color,
      counts_as_active = excluded.counts_as_active,
      excluded_from_overdue = excluded.excluded_from_overdue,
      hidden_by_default = excluded.hidden_by_default,
      sort_order = excluded.sort_order,
      is_system = excluded.is_system;
  end if;
end $$;
