-- V58.10.7 · registros + departamentos + países personalizados por workspace/personal

alter table public.departments add column if not exists phone text;
alter table public.departments add column if not exists organization_id uuid references public.organizations(id) on delete cascade;
alter table public.departments add column if not exists account_owner_id uuid references public.profiles(id) on delete set null;
alter table public.departments add column if not exists created_at timestamptz not null default now();

create table if not exists public.countries (
  id bigserial primary key,
  code text not null unique,
  name text not null unique,
  organization_id uuid references public.organizations(id) on delete cascade,
  account_owner_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint countries_scope_check check (
    (organization_id is not null and account_owner_id is null)
    or (organization_id is null)
  )
);

alter table public.countries enable row level security;
create index if not exists countries_organization_idx on public.countries (organization_id, name);
create index if not exists countries_account_owner_idx on public.countries (account_owner_id, name);
create index if not exists departments_organization_idx on public.departments (organization_id, name);
create index if not exists departments_account_owner_idx on public.departments (account_owner_id, name);

insert into public.countries (code, name)
values
  ('costa-rica', 'Costa Rica'),
  ('panama', 'Panamá'),
  ('ecuador', 'Ecuador'),
  ('nicaragua', 'Nicaragua')
on conflict (code) do update set name = excluded.name;

update public.departments
set organization_id = null
where organization_id is not null and account_owner_id is not null;

alter table public.departments enable row level security;

drop policy if exists "departments_select_workspace" on public.departments;
create policy "departments_select_workspace" on public.departments
for select to authenticated
using (
  public.is_platform_admin()
  or departments.organization_id is null and departments.account_owner_id is null
  or (
    departments.organization_id is not null
    and exists (
      select 1 from public.organization_members om
      where om.organization_id = departments.organization_id
        and om.user_id = auth.uid()
    )
  )
  or (
    departments.organization_id is null
    and departments.account_owner_id = auth.uid()
  )
);

drop policy if exists "departments_insert_workspace_manager" on public.departments;
create policy "departments_insert_workspace_manager" on public.departments
for insert to authenticated
with check (
  public.is_platform_admin()
  or (
    departments.organization_id is not null
    and exists (
      select 1 from public.organization_members om
      where om.organization_id = departments.organization_id
        and om.user_id = auth.uid()
        and om.role in ('admin_global','manager')
    )
  )
  or (
    departments.organization_id is null
    and departments.account_owner_id = auth.uid()
  )
);

drop policy if exists "departments_update_workspace_manager" on public.departments;
create policy "departments_update_workspace_manager" on public.departments
for update to authenticated
using (
  public.is_platform_admin()
  or (
    departments.organization_id is not null
    and exists (
      select 1 from public.organization_members om
      where om.organization_id = departments.organization_id
        and om.user_id = auth.uid()
        and om.role in ('admin_global','manager')
    )
  )
  or (
    departments.organization_id is null
    and departments.account_owner_id = auth.uid()
  )
)
with check (
  public.is_platform_admin()
  or (
    departments.organization_id is not null
    and exists (
      select 1 from public.organization_members om
      where om.organization_id = departments.organization_id
        and om.user_id = auth.uid()
        and om.role in ('admin_global','manager')
    )
  )
  or (
    departments.organization_id is null
    and departments.account_owner_id = auth.uid()
  )
);

drop policy if exists "departments_delete_workspace_admin" on public.departments;
create policy "departments_delete_workspace_admin" on public.departments
for delete to authenticated
using (
  public.is_platform_admin()
  or (
    departments.organization_id is not null
    and exists (
      select 1 from public.organization_members om
      where om.organization_id = departments.organization_id
        and om.user_id = auth.uid()
        and om.role = 'admin_global'
    )
  )
  or (
    departments.organization_id is null
    and departments.account_owner_id = auth.uid()
  )
);

drop policy if exists "countries_select_workspace" on public.countries;
create policy "countries_select_workspace" on public.countries
for select to authenticated
using (
  public.is_platform_admin()
  or countries.organization_id is null and countries.account_owner_id is null
  or (
    countries.organization_id is not null
    and exists (
      select 1 from public.organization_members om
      where om.organization_id = countries.organization_id
        and om.user_id = auth.uid()
    )
  )
  or (
    countries.organization_id is null
    and countries.account_owner_id = auth.uid()
  )
);

drop policy if exists "countries_insert_workspace_manager" on public.countries;
create policy "countries_insert_workspace_manager" on public.countries
for insert to authenticated
with check (
  public.is_platform_admin()
  or (
    countries.organization_id is not null
    and exists (
      select 1 from public.organization_members om
      where om.organization_id = countries.organization_id
        and om.user_id = auth.uid()
        and om.role in ('admin_global','manager')
    )
  )
  or (
    countries.organization_id is null
    and countries.account_owner_id = auth.uid()
  )
);

drop policy if exists "countries_update_workspace_manager" on public.countries;
create policy "countries_update_workspace_manager" on public.countries
for update to authenticated
using (
  public.is_platform_admin()
  or (
    countries.organization_id is not null
    and exists (
      select 1 from public.organization_members om
      where om.organization_id = countries.organization_id
        and om.user_id = auth.uid()
        and om.role in ('admin_global','manager')
    )
  )
  or (
    countries.organization_id is null
    and countries.account_owner_id = auth.uid()
  )
)
with check (
  public.is_platform_admin()
  or (
    countries.organization_id is not null
    and exists (
      select 1 from public.organization_members om
      where om.organization_id = countries.organization_id
        and om.user_id = auth.uid()
        and om.role in ('admin_global','manager')
    )
  )
  or (
    countries.organization_id is null
    and countries.account_owner_id = auth.uid()
  )
);

drop policy if exists "countries_delete_workspace_admin" on public.countries;
create policy "countries_delete_workspace_admin" on public.countries
for delete to authenticated
using (
  public.is_platform_admin()
  or (
    countries.organization_id is not null
    and exists (
      select 1 from public.organization_members om
      where om.organization_id = countries.organization_id
        and om.user_id = auth.uid()
        and om.role = 'admin_global'
    )
  )
  or (
    countries.organization_id is null
    and countries.account_owner_id = auth.uid()
  )
);
