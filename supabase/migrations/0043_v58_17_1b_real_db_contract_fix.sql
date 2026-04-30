-- v58.17.1b — Real DB Contract Fix
-- Safe, idempotent contract documentation only. No destructive data changes.

do $$
begin
  if to_regclass('public.organizations') is not null then comment on table public.organizations is 'Flowtask contract v58.17.1b: organization rows are workspaces created by individual users. They do not authenticate as users. organizations.owner_id points to the individual owner/admin.'; end if;
  if to_regclass('public.organization_members') is not null then comment on table public.organization_members is 'Flowtask contract v58.17.1b: membership rows connect individual users to organization workspaces. Creator/owner must have admin_global membership.'; end if;
  if to_regclass('public.tasks') is not null then comment on table public.tasks is 'Flowtask contract v58.17.1b: personal tasks use owner_id with organization_id null. Organization tasks use organization_id. Country is stored in tasks.country; there is no tasks.country_id contract.'; end if;
  if to_regclass('public.projects') is not null then comment on table public.projects is 'Flowtask contract v58.17.1b: personal projects use owner_id with organization_id null. Organization projects use organization_id. Country is stored in projects.country.'; end if;
  if to_regclass('public.task_checklist_items') is not null then comment on table public.task_checklist_items is 'Flowtask contract v58.17.1b: checklist completion uses task_checklist_items.done; do not use is_done.'; end if;
end $$;

create or replace function public.flowtask_db_contract_v58171b_check()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare v_result jsonb;
begin
  select jsonb_build_object(
    'tasks_has_country', exists (select 1 from information_schema.columns where table_schema='public' and table_name='tasks' and column_name='country'),
    'tasks_has_country_id', exists (select 1 from information_schema.columns where table_schema='public' and table_name='tasks' and column_name='country_id'),
    'checklist_has_done', exists (select 1 from information_schema.columns where table_schema='public' and table_name='task_checklist_items' and column_name='done'),
    'checklist_has_is_done', exists (select 1 from information_schema.columns where table_schema='public' and table_name='task_checklist_items' and column_name='is_done'),
    'organization_members_has_role', exists (select 1 from information_schema.columns where table_schema='public' and table_name='organization_members' and column_name='role'),
    'organization_subscriptions_has_plan_code', exists (select 1 from information_schema.columns where table_schema='public' and table_name='organization_subscriptions' and column_name='plan_code')
  ) into v_result;
  return v_result;
end;
$$;

grant execute on function public.flowtask_db_contract_v58171b_check() to authenticated;
