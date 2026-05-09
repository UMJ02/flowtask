-- V58.22.2 Task Status Production
-- Adds Producción as an official task status without changing RLS or ownership rules.

alter table public.tasks
  drop constraint if exists tasks_status_check;

alter table public.tasks
  add constraint tasks_status_check
  check (status in ('en_proceso', 'produccion', 'en_espera', 'concluido'));

insert into public.task_statuses (value, label, color, counts_as_active, excluded_from_overdue, hidden_by_default, sort_order, is_system)
values
  ('produccion', 'Producción', 'violet', true, false, false, 15, true)
on conflict do nothing;
