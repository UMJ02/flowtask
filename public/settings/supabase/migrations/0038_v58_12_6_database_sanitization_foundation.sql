-- FlowTask V58.12.6 · Database Sanitization Foundation
-- Objetivo: alinear catálogos/workspaces, deletes y soft-delete de organizaciones.
-- Recomendación: ejecutar primero en staging o con backup/snapshot de Supabase.

begin;

-- 1) Organizaciones: columnas esperadas por flujos de eliminación/reactivación.
alter table public.organizations
  add column if not exists deleted_at timestamptz,
  add column if not exists purge_scheduled_at timestamptz,
  add column if not exists purge_after timestamptz,
  add column if not exists reactivated_at timestamptz;

-- Mantener compatibilidad entre nombres usados por versiones anteriores/nuevas.
update public.organizations
set purge_after = coalesce(purge_after, purge_scheduled_at)
where purge_after is null and purge_scheduled_at is not null;

create index if not exists organizations_deleted_purge_idx
  on public.organizations (deleted_at, purge_scheduled_at, purge_after);

-- 2) Catálogos: quitar unicidad global de code porque rompe registros por workspace.
alter table public.countries drop constraint if exists countries_code_key;
alter table public.countries drop constraint if exists countries_name_key;
alter table public.departments drop constraint if exists departments_code_key;
alter table public.departments drop constraint if exists departments_name_key;

drop index if exists public.countries_scope_name_unique;
drop index if exists public.departments_scope_name_unique;
drop index if exists public.countries_scope_code_unique;
drop index if exists public.departments_scope_code_unique;

-- Unicidad correcta por scope. Permite el mismo catálogo global/personal/organización sin duplicar dentro del mismo scope.
create unique index if not exists countries_scope_code_unique
  on public.countries (
    coalesce(organization_id::text, 'global'),
    coalesce(account_owner_id::text, 'global'),
    lower(trim(code))
  );

create unique index if not exists countries_scope_name_unique
  on public.countries (
    coalesce(organization_id::text, 'global'),
    coalesce(account_owner_id::text, 'global'),
    lower(trim(name))
  );

create unique index if not exists departments_scope_code_unique
  on public.departments (
    coalesce(organization_id::text, 'global'),
    coalesce(account_owner_id::text, 'global'),
    lower(trim(code))
  );

create unique index if not exists departments_scope_name_unique
  on public.departments (
    coalesce(organization_id::text, 'global'),
    coalesce(account_owner_id::text, 'global'),
    lower(trim(name))
  );

-- 3) Activity logs: no reenganchar client_id desde metadata cuando el cliente fue eliminado.
create or replace function public.enrich_activity_log_row()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_project public.projects%rowtype;
  v_task public.tasks%rowtype;
  v_client public.clients%rowtype;
begin
  if new.project_id is not null then
    select * into v_project from public.projects where id = new.project_id;
    if found then
      new.organization_id := coalesce(new.organization_id, v_project.organization_id);
      new.client_id := coalesce(new.client_id, v_project.client_id);
    end if;
  end if;

  if new.task_id is not null then
    select * into v_task from public.tasks where id = new.task_id;
    if found then
      new.organization_id := coalesce(new.organization_id, v_task.organization_id);
      new.client_id := coalesce(new.client_id, v_task.client_id);
      new.project_id := coalesce(new.project_id, v_task.project_id);
    end if;
  end if;

  if new.client_id is not null then
    select * into v_client from public.clients where id = new.client_id;
    if found then
      new.organization_id := coalesce(new.organization_id, v_client.organization_id);
    else
      new.client_id := null;
    end if;
  end if;

  if new.organization_id is null and new.metadata ? 'organization_id' then
    begin
      new.organization_id := (new.metadata->>'organization_id')::uuid;
    exception when others then
      null;
    end;
  end if;

  if new.client_id is null
     and new.metadata ? 'client_id'
     and coalesce(new.action, '') <> 'client_deleted' then
    begin
      select * into v_client
      from public.clients
      where id = (new.metadata->>'client_id')::uuid;

      if found then
        new.client_id := v_client.id;
        new.organization_id := coalesce(new.organization_id, v_client.organization_id);
      end if;
    exception when others then
      null;
    end;
  end if;

  if new.project_id is null and new.metadata ? 'project_id' then
    begin
      new.project_id := (new.metadata->>'project_id')::uuid;
    exception when others then
      null;
    end;
  end if;

  if new.task_id is null and new.metadata ? 'task_id' then
    begin
      new.task_id := (new.metadata->>'task_id')::uuid;
    exception when others then
      null;
    end;
  end if;

  return new;
end;
$function$;

-- 4) Función RPC segura para borrar cliente con auditoría sin bloquear FK.
create or replace function public.delete_workspace_client(p_client_id uuid)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_client public.clients%rowtype;
  v_can_delete boolean;
begin
  select * into v_client from public.clients where id = p_client_id;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'Cliente no encontrado.');
  end if;

  v_can_delete := public.is_platform_admin()
    or (v_client.organization_id is not null and public.is_org_admin(v_client.organization_id))
    or (v_client.organization_id is null and v_client.account_owner_id = auth.uid());

  if not v_can_delete then
    return jsonb_build_object('ok', false, 'error', 'No tienes permisos para eliminar este cliente.');
  end if;

  -- Desvincula entidades operativas, conserva histórico.
  update public.tasks
    set client_id = null,
        client_name = coalesce(client_name, v_client.name)
    where client_id = p_client_id;

  update public.projects
    set client_id = null,
        client_name = coalesce(client_name, v_client.name)
    where client_id = p_client_id;

  update public.activity_logs
    set client_id = null,
        metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object('deleted_client_id', p_client_id, 'deleted_client_name', v_client.name)
    where client_id = p_client_id;

  delete from public.client_permissions where client_id = p_client_id;
  delete from public.clients where id = p_client_id;

  return jsonb_build_object('ok', true, 'deleted_client_id', p_client_id, 'name', v_client.name);
end;
$function$;

-- 5) Vista útil para frontend: catálogos globales + scope activo, deduplicados por code.
create or replace view public.v_departments_catalog as
select distinct on (lower(trim(code)), coalesce(organization_id::text, 'global'), coalesce(account_owner_id::text, 'global'))
  id, code, name, phone, organization_id, account_owner_id, created_at
from public.departments
order by lower(trim(code)), coalesce(organization_id::text, 'global'), coalesce(account_owner_id::text, 'global'), created_at asc;

create or replace view public.v_countries_catalog as
select distinct on (lower(trim(code)), coalesce(organization_id::text, 'global'), coalesce(account_owner_id::text, 'global'))
  id, code, name, organization_id, account_owner_id, created_at
from public.countries
order by lower(trim(code)), coalesce(organization_id::text, 'global'), coalesce(account_owner_id::text, 'global'), created_at asc;

commit;

-- Post-checks
select 'organizations_columns' as check_name, column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'organizations'
  and column_name in ('deleted_at','purge_scheduled_at','purge_after','reactivated_at')
order by column_name;

select 'country_duplicate_scope_check' as check_name, lower(trim(code)) as code, organization_id, account_owner_id, count(*)
from public.countries
group by 1,2,3,4
having count(*) > 1;

select 'department_duplicate_scope_check' as check_name, lower(trim(code)) as code, organization_id, account_owner_id, count(*)
from public.departments
group by 1,2,3,4
having count(*) > 1;

-- V58.12.6 additional hardening: clients unique by scope + workspace RLS for tasks/projects.
drop index if exists public.clients_scope_name_unique;
create unique index if not exists clients_scope_name_unique
  on public.clients (coalesce(organization_id::text, 'personal'), coalesce(account_owner_id::text, 'none'), lower(trim(name)));

drop policy if exists projects_select_owner_or_member on public.projects;
create policy projects_select_workspace_access on public.projects for select to authenticated using (
  owner_id = auth.uid() or is_project_member(id, auth.uid()) or (organization_id is not null and exists (select 1 from public.organization_members om where om.organization_id = projects.organization_id and om.user_id = auth.uid()))
);
drop policy if exists projects_update_owner_or_editor on public.projects;
create policy projects_update_workspace_editor on public.projects for update to authenticated using (
  owner_id = auth.uid() or has_project_role(id, auth.uid(), array['owner','editor']) or (organization_id is not null and public.is_org_admin_or_manager(organization_id))
) with check (
  owner_id = auth.uid() or has_project_role(id, auth.uid(), array['owner','editor']) or (organization_id is not null and public.is_org_admin_or_manager(organization_id))
);
drop policy if exists projects_delete_owner on public.projects;
create policy projects_delete_workspace_owner on public.projects for delete to authenticated using (owner_id = auth.uid() or (organization_id is not null and public.is_org_admin(organization_id)));

drop policy if exists tasks_select_access on public.tasks;
create policy tasks_select_workspace_access on public.tasks for select to authenticated using (
  owner_id = auth.uid() or is_task_assignee(id, auth.uid()) or ((project_id is not null) and is_project_member(project_id, auth.uid())) or (organization_id is not null and exists (select 1 from public.organization_members om where om.organization_id = tasks.organization_id and om.user_id = auth.uid()))
);
drop policy if exists tasks_update_access on public.tasks;
create policy tasks_update_workspace_access on public.tasks for update to authenticated using (
  owner_id = auth.uid() or is_task_assignee(id, auth.uid()) or ((project_id is not null) and is_project_member(project_id, auth.uid())) or (organization_id is not null and public.is_org_admin_or_manager(organization_id))
) with check (
  owner_id = auth.uid() or ((project_id is not null) and is_project_member(project_id, auth.uid())) or (organization_id is not null and public.is_org_admin_or_manager(organization_id))
);
drop policy if exists tasks_delete_owner on public.tasks;
create policy tasks_delete_workspace_owner on public.tasks for delete to authenticated using (owner_id = auth.uid() or (organization_id is not null and public.is_org_admin(organization_id)));
