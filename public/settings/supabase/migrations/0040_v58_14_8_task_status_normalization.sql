-- V58.14.8 Product Logic Normalization
-- Centraliza estados base para futuras opciones personalizadas por workspace.

create table if not exists public.task_statuses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete cascade,
  value text not null,
  label text not null,
  color text not null default 'blue',
  counts_as_active boolean not null default true,
  excluded_from_overdue boolean not null default false,
  hidden_by_default boolean not null default false,
  sort_order integer not null default 100,
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint task_statuses_scope_required check (owner_id is not null or organization_id is not null or is_system = true)
);

create unique index if not exists task_statuses_scope_value_unique
on public.task_statuses (
  coalesce(organization_id, '00000000-0000-0000-0000-000000000000'::uuid),
  coalesce(owner_id, '00000000-0000-0000-0000-000000000000'::uuid),
  value
);

alter table public.task_statuses enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'task_statuses' and policyname = 'task_statuses_select_workspace') then
    create policy task_statuses_select_workspace on public.task_statuses
      for select using (
        is_system = true
        or owner_id = auth.uid()
        or exists (
          select 1 from public.organization_members om
          where om.organization_id = task_statuses.organization_id
          and om.user_id = auth.uid()
        )
      );
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'task_statuses' and policyname = 'task_statuses_write_workspace') then
    create policy task_statuses_write_workspace on public.task_statuses
      for all using (
        owner_id = auth.uid()
        or exists (
          select 1 from public.organization_members om
          where om.organization_id = task_statuses.organization_id
          and om.user_id = auth.uid()
          and om.role in ('owner','admin')
        )
      ) with check (
        owner_id = auth.uid()
        or exists (
          select 1 from public.organization_members om
          where om.organization_id = task_statuses.organization_id
          and om.user_id = auth.uid()
          and om.role in ('owner','admin')
        )
      );
  end if;
end $$;

insert into public.task_statuses (value, label, color, counts_as_active, excluded_from_overdue, hidden_by_default, sort_order, is_system)
values
  ('en_proceso', 'En proceso', 'blue', true, false, false, 10, true),
  ('en_espera', 'En espera', 'amber', false, true, false, 20, true),
  ('concluido', 'Concluido', 'emerald', false, true, true, 90, true)
on conflict do nothing;
