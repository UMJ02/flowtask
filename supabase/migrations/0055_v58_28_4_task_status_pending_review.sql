-- v58.28.4 — Workspace Pro Board status alignment
-- Permite que el Board use Pendiente y Revisión como estados reales.

alter table public.tasks
  drop constraint if exists tasks_status_check;

alter table public.tasks
  add constraint tasks_status_check
  check (status in ('pendiente', 'en_proceso', 'produccion', 'en_espera', 'revision', 'concluido'));

do $$
begin
  if to_regclass('public.task_statuses') is not null then
    insert into public.task_statuses (code, label, color, is_system, is_done, is_waiting, sort_order, is_active)
    values
      ('pendiente', 'Pendiente', 'sky', true, false, false, 5, true),
      ('revision', 'Revisión', 'fuchsia', true, false, false, 40, true)
    on conflict (code) do update set
      label = excluded.label,
      color = excluded.color,
      is_system = excluded.is_system,
      is_done = excluded.is_done,
      is_waiting = excluded.is_waiting,
      sort_order = excluded.sort_order,
      is_active = excluded.is_active;
  end if;
end $$;
