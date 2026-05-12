-- V53.2 · Relational Audit & Scope Visibility
-- Objetivos:
-- 1) Extender activity_logs con contexto relacional.
-- 2) Habilitar lectura auditada por organización / cliente / proyecto / tarea.
-- 3) Registrar movimientos sensibles de gobierno y permisos.

alter table public.activity_logs
  add column if not exists organization_id uuid references public.organizations(id) on delete set null,
  add column if not exists client_id uuid references public.clients(id) on delete set null,
  add column if not exists project_id uuid references public.projects(id) on delete set null,
  add column if not exists task_id uuid references public.tasks(id) on delete set null;

create index if not exists activity_logs_org_created_idx
  on public.activity_logs (organization_id, created_at desc);
create index if not exists activity_logs_client_created_idx
  on public.activity_logs (client_id, created_at desc);
create index if not exists activity_logs_project_created_idx
  on public.activity_logs (project_id, created_at desc);
create index if not exists activity_logs_task_created_idx
  on public.activity_logs (task_id, created_at desc);
create index if not exists activity_logs_action_created_idx
  on public.activity_logs (action, created_at desc);

drop policy if exists "activity_logs_select_own" on public.activity_logs;
create policy "activity_logs_select_scope_access"
on public.activity_logs
for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_platform_admin()
  or (organization_id is not null and public.is_org_admin_or_manager(organization_id))
  or (client_id is not null and public.has_client_access(client_id, 'view'))
  or (
    project_id is not null and exists (
      select 1
      from public.projects p
      where p.id = activity_logs.project_id
        and (
          p.owner_id = auth.uid()
          or exists (
            select 1 from public.project_members pm
            where pm.project_id = p.id and pm.user_id = auth.uid()
          )
          or public.has_client_access(p.client_id, 'view')
        )
    )
  )
  or (
    task_id is not null and exists (
      select 1
      from public.tasks t
      where t.id = activity_logs.task_id
        and (
          t.owner_id = auth.uid()
          or exists (
            select 1 from public.task_assignees ta
            where ta.task_id = t.id and ta.user_id = auth.uid()
          )
          or (
            t.project_id is not null and exists (
              select 1 from public.project_members pm
              where pm.project_id = t.project_id and pm.user_id = auth.uid()
            )
          )
          or public.has_client_access(t.client_id, 'view')
        )
    )
  )
);

create or replace function public.enrich_activity_log_row()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
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
    end if;
  end if;

  if new.organization_id is null and new.metadata ? 'organization_id' then
    begin
      new.organization_id := (new.metadata->>'organization_id')::uuid;
    exception when others then
      new.organization_id := new.organization_id;
    end;
  end if;

  if new.client_id is null and new.metadata ? 'client_id' then
    begin
      new.client_id := (new.metadata->>'client_id')::uuid;
    exception when others then
      new.client_id := new.client_id;
    end;
  end if;

  if new.project_id is null and new.metadata ? 'project_id' then
    begin
      new.project_id := (new.metadata->>'project_id')::uuid;
    exception when others then
      new.project_id := new.project_id;
    end;
  end if;

  if new.task_id is null and new.metadata ? 'task_id' then
    begin
      new.task_id := (new.metadata->>'task_id')::uuid;
    exception when others then
      new.task_id := new.task_id;
    end;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_activity_logs_enrich on public.activity_logs;
create trigger trg_activity_logs_enrich
before insert or update on public.activity_logs
for each row execute function public.enrich_activity_log_row();

create or replace function public.write_governance_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_action text;
  v_entity_type text;
  v_entity_id uuid;
  v_org_id uuid;
  v_client_id uuid;
  v_metadata jsonb := '{}'::jsonb;
begin
  if tg_table_name = 'clients' then
    v_entity_type := 'client';
    v_entity_id := coalesce(new.id, old.id);
    v_org_id := coalesce(new.organization_id, old.organization_id);
    v_client_id := coalesce(new.id, old.id);
    v_action := case tg_op when 'INSERT' then 'client_created' when 'UPDATE' then 'client_updated' else 'client_deleted' end;
    v_metadata := jsonb_build_object(
      'name', coalesce(new.name, old.name),
      'status', coalesce(new.status, old.status)
    );
  elsif tg_table_name = 'organization_members' then
    v_entity_type := 'organization_member';
    v_entity_id := coalesce(new.id, old.id);
    v_org_id := coalesce(new.organization_id, old.organization_id);
    v_action := case tg_op when 'INSERT' then 'organization_member_created' when 'UPDATE' then 'organization_member_updated' else 'organization_member_deleted' end;
    v_metadata := jsonb_build_object(
      'user_id', coalesce(new.user_id, old.user_id),
      'role', coalesce(new.role, old.role),
      'previous_role', old.role
    );
  elsif tg_table_name = 'organization_invites' then
    v_entity_type := 'organization_invite';
    v_entity_id := coalesce(new.id, old.id);
    v_org_id := coalesce(new.organization_id, old.organization_id);
    v_action := case
      when tg_op = 'INSERT' then 'organization_invite_created'
      when tg_op = 'UPDATE' and coalesce(new.status, '') = 'revoked' and coalesce(old.status, '') <> 'revoked' then 'organization_invite_revoked'
      when tg_op = 'UPDATE' then 'organization_invite_updated'
      else 'organization_invite_deleted'
    end;
    v_metadata := jsonb_build_object(
      'email', coalesce(new.email, old.email),
      'role', coalesce(new.role, old.role),
      'status', coalesce(new.status, old.status)
    );
  elsif tg_table_name = 'client_permissions' then
    v_entity_type := 'client_permission';
    v_entity_id := coalesce(new.id, old.id);
    v_org_id := coalesce(new.organization_id, old.organization_id);
    v_client_id := coalesce(new.client_id, old.client_id);
    v_action := case tg_op when 'INSERT' then 'client_permission_created' when 'UPDATE' then 'client_permission_updated' else 'client_permission_deleted' end;
    v_metadata := jsonb_build_object(
      'user_id', coalesce(new.user_id, old.user_id),
      'role', coalesce(new.role, old.role),
      'can_view', coalesce(new.can_view, old.can_view),
      'can_edit', coalesce(new.can_edit, old.can_edit),
      'can_manage_members', coalesce(new.can_manage_members, old.can_manage_members)
    );
  else
    return coalesce(new, old);
  end if;

  insert into public.activity_logs (
    user_id,
    entity_type,
    entity_id,
    action,
    metadata,
    organization_id,
    client_id
  ) values (
    auth.uid(),
    v_entity_type,
    v_entity_id,
    v_action,
    v_metadata,
    v_org_id,
    v_client_id
  );

  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_clients_governance_activity on public.clients;
create trigger trg_clients_governance_activity
after insert or update or delete on public.clients
for each row execute function public.write_governance_activity();

drop trigger if exists trg_organization_members_governance_activity on public.organization_members;
create trigger trg_organization_members_governance_activity
after insert or update or delete on public.organization_members
for each row execute function public.write_governance_activity();

drop trigger if exists trg_organization_invites_governance_activity on public.organization_invites;
create trigger trg_organization_invites_governance_activity
after insert or update or delete on public.organization_invites
for each row execute function public.write_governance_activity();

drop trigger if exists trg_client_permissions_governance_activity on public.client_permissions;
create trigger trg_client_permissions_governance_activity
after insert or update or delete on public.client_permissions
for each row execute function public.write_governance_activity();
