-- V58.12.4 · registry integrity + scoped uniqueness + safe department deletes

alter table public.departments drop constraint if exists departments_name_key;
alter table public.countries drop constraint if exists countries_name_key;

do $$
begin
  if exists (
    select 1 from information_schema.table_constraints
    where table_schema = 'public' and table_name = 'tasks' and constraint_name = 'tasks_department_id_fkey'
  ) then
    alter table public.tasks drop constraint tasks_department_id_fkey;
  end if;
end $$;

alter table public.tasks
  add constraint tasks_department_id_fkey
  foreign key (department_id) references public.departments(id) on delete set null;

do $$
begin
  if exists (
    select 1 from information_schema.table_constraints
    where table_schema = 'public' and table_name = 'projects' and constraint_name = 'projects_department_id_fkey'
  ) then
    alter table public.projects drop constraint projects_department_id_fkey;
  end if;
end $$;

alter table public.projects
  add constraint projects_department_id_fkey
  foreign key (department_id) references public.departments(id) on delete set null;

create unique index if not exists departments_scope_name_unique
  on public.departments (
    coalesce(organization_id::text, 'personal'),
    coalesce(account_owner_id::text, 'owner'),
    lower(name)
  );

create unique index if not exists countries_scope_name_unique
  on public.countries (
    coalesce(organization_id::text, 'personal'),
    coalesce(account_owner_id::text, 'owner'),
    lower(name)
  );
