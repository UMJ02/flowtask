-- V58.14.6 Product Final Connections PASS
create table if not exists public.task_checklist_items (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  done boolean not null default false,
  due_date date,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists task_checklist_items_task_position_idx on public.task_checklist_items (task_id, position asc, created_at asc);
create table if not exists public.task_view_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete cascade,
  scope text not null default 'tasks',
  name text not null default 'Vista personal',
  view_mode text not null default 'list',
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, organization_id, scope, name)
);
create index if not exists task_view_preferences_user_scope_idx on public.task_view_preferences (user_id, organization_id, scope);
create table if not exists public.task_dependencies (
  id uuid primary key default gen_random_uuid(),
  predecessor_task_id uuid not null references public.tasks(id) on delete cascade,
  successor_task_id uuid not null references public.tasks(id) on delete cascade,
  dependency_type text not null default 'finish_to_start',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint task_dependencies_not_self check (predecessor_task_id <> successor_task_id),
  unique (predecessor_task_id, successor_task_id)
);
create index if not exists task_dependencies_successor_idx on public.task_dependencies (successor_task_id);
create or replace function public.touch_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;
drop trigger if exists task_checklist_items_touch_updated_at on public.task_checklist_items;
create trigger task_checklist_items_touch_updated_at before update on public.task_checklist_items for each row execute function public.touch_updated_at();
drop trigger if exists task_view_preferences_touch_updated_at on public.task_view_preferences;
create trigger task_view_preferences_touch_updated_at before update on public.task_view_preferences for each row execute function public.touch_updated_at();
alter table public.task_checklist_items enable row level security;
alter table public.task_view_preferences enable row level security;
alter table public.task_dependencies enable row level security;
drop policy if exists task_checklist_items_select_access on public.task_checklist_items;
create policy task_checklist_items_select_access on public.task_checklist_items for select to authenticated using (exists (select 1 from public.tasks t where t.id = task_checklist_items.task_id and (t.owner_id = auth.uid() or public.is_task_assignee(t.id, auth.uid()) or ((t.project_id is not null) and public.is_project_member(t.project_id, auth.uid())) or (t.organization_id is not null and exists (select 1 from public.organization_members om where om.organization_id = t.organization_id and om.user_id = auth.uid())))));
drop policy if exists task_checklist_items_insert_access on public.task_checklist_items;
create policy task_checklist_items_insert_access on public.task_checklist_items for insert to authenticated with check (owner_id = auth.uid() and exists (select 1 from public.tasks t where t.id = task_checklist_items.task_id and (t.owner_id = auth.uid() or public.is_task_assignee(t.id, auth.uid()) or ((t.project_id is not null) and public.is_project_member(t.project_id, auth.uid())) or (t.organization_id is not null and public.is_org_admin(t.organization_id)))));
drop policy if exists task_checklist_items_update_access on public.task_checklist_items;
create policy task_checklist_items_update_access on public.task_checklist_items for update to authenticated using (exists (select 1 from public.tasks t where t.id = task_checklist_items.task_id and (t.owner_id = auth.uid() or task_checklist_items.owner_id = auth.uid() or public.is_task_assignee(t.id, auth.uid()) or ((t.project_id is not null) and public.is_project_member(t.project_id, auth.uid())) or (t.organization_id is not null and public.is_org_admin(t.organization_id))))) with check (exists (select 1 from public.tasks t where t.id = task_checklist_items.task_id and (t.owner_id = auth.uid() or task_checklist_items.owner_id = auth.uid() or public.is_task_assignee(t.id, auth.uid()) or ((t.project_id is not null) and public.is_project_member(t.project_id, auth.uid())) or (t.organization_id is not null and public.is_org_admin(t.organization_id)))));
drop policy if exists task_checklist_items_delete_access on public.task_checklist_items;
create policy task_checklist_items_delete_access on public.task_checklist_items for delete to authenticated using (exists (select 1 from public.tasks t where t.id = task_checklist_items.task_id and (t.owner_id = auth.uid() or task_checklist_items.owner_id = auth.uid() or (t.organization_id is not null and public.is_org_admin(t.organization_id)))));
drop policy if exists task_view_preferences_owner_access on public.task_view_preferences;
create policy task_view_preferences_owner_access on public.task_view_preferences for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists task_dependencies_select_access on public.task_dependencies;
create policy task_dependencies_select_access on public.task_dependencies for select to authenticated using (exists (select 1 from public.tasks t where t.id = task_dependencies.predecessor_task_id and (t.owner_id = auth.uid() or public.is_task_assignee(t.id, auth.uid()) or ((t.project_id is not null) and public.is_project_member(t.project_id, auth.uid())) or (t.organization_id is not null and exists (select 1 from public.organization_members om where om.organization_id = t.organization_id and om.user_id = auth.uid())))) or exists (select 1 from public.tasks t where t.id = task_dependencies.successor_task_id and (t.owner_id = auth.uid() or public.is_task_assignee(t.id, auth.uid()) or ((t.project_id is not null) and public.is_project_member(t.project_id, auth.uid())) or (t.organization_id is not null and exists (select 1 from public.organization_members om where om.organization_id = t.organization_id and om.user_id = auth.uid())))));
drop policy if exists task_dependencies_write_access on public.task_dependencies;
create policy task_dependencies_write_access on public.task_dependencies for all to authenticated using (created_by = auth.uid()) with check (created_by = auth.uid());
