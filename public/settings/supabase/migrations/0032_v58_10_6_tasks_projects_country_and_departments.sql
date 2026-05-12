alter table public.tasks add column if not exists country text;
alter table public.projects add column if not exists country text;

insert into public.departments (code, name)
values
  ('respaldo_tecnico', 'Respaldo técnico'),
  ('comercial', 'Comercial'),
  ('proyectos', 'Proyectos')
on conflict (code) do update set name = excluded.name;
