-- v58.24.9 — Workspace Data Isolation + Organization Lifecycle Hardening
-- Goal:
-- 1) Keep personal and organization workspaces isolated.
-- 2) Make organization deletion recoverable before purge.
-- 3) Purge organization-scoped data in a controlled order instead of relying on FK ON DELETE SET NULL.

-- ---------------------------------------------------------------------------
-- Workspace helper
-- ---------------------------------------------------------------------------

create or replace function public.is_organization_member(p_organization_id uuid, p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members om
    join public.organizations o on o.id = om.organization_id
    where om.organization_id = p_organization_id
      and om.user_id = p_user_id
      and o.deleted_at is null
  );
$$;

grant execute on function public.is_organization_member(uuid, uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Projects isolation policies
-- Personal: organization_id is null AND owner_id = auth.uid()
-- Organization: organization_id is not null AND user belongs to organization
-- ---------------------------------------------------------------------------

drop policy if exists projects_select_owner_or_member on public.projects;
drop policy if exists projects_select_workspace_access on public.projects;
drop policy if exists projects_insert_owner on public.projects;
drop policy if exists projects_update_owner_or_editor on public.projects;
drop policy if exists projects_update_workspace_editor on public.projects;
drop policy if exists projects_delete_owner on public.projects;
drop policy if exists projects_delete_workspace_owner on public.projects;

create policy projects_select_workspace_access
on public.projects
for select
to authenticated
using (
  (
    organization_id is null
    and owner_id = auth.uid()
  )
  or (
    organization_id is not null
    and public.is_organization_member(organization_id, auth.uid())
  )
  or public.is_project_member(id, auth.uid())
);

create policy projects_insert_workspace_owner
on public.projects
for insert
to authenticated
with check (
  owner_id = auth.uid()
  and (
    organization_id is null
    or public.is_organization_member(organization_id, auth.uid())
  )
);

create policy projects_update_workspace_editor
on public.projects
for update
to authenticated
using (
  (
    organization_id is null
    and owner_id = auth.uid()
  )
  or public.has_project_role(id, auth.uid(), array['owner','editor'])
  or (
    organization_id is not null
    and public.is_org_admin_or_manager(organization_id)
  )
)
with check (
  owner_id = auth.uid()
  and (
    organization_id is null
    or public.is_organization_member(organization_id, auth.uid())
  )
);

create policy projects_delete_workspace_owner
on public.projects
for delete
to authenticated
using (
  (
    organization_id is null
    and owner_id = auth.uid()
  )
  or (
    organization_id is not null
    and public.is_org_admin(organization_id)
  )
);

-- ---------------------------------------------------------------------------
-- Tasks isolation policies
-- ---------------------------------------------------------------------------

drop policy if exists tasks_select_access on public.tasks;
drop policy if exists tasks_select_workspace_access on public.tasks;
drop policy if exists tasks_insert_owner on public.tasks;
drop policy if exists tasks_update_access on public.tasks;
drop policy if exists tasks_update_workspace_access on public.tasks;
drop policy if exists tasks_delete_owner on public.tasks;
drop policy if exists tasks_delete_workspace_owner on public.tasks;

create policy tasks_select_workspace_access
on public.tasks
for select
to authenticated
using (
  (
    organization_id is null
    and (
      owner_id = auth.uid()
      or public.is_task_assignee(id, auth.uid())
      or (
        project_id is not null
        and public.is_project_member(project_id, auth.uid())
      )
    )
  )
  or (
    organization_id is not null
    and public.is_organization_member(organization_id, auth.uid())
  )
);

create policy tasks_insert_workspace_owner
on public.tasks
for insert
to authenticated
with check (
  owner_id = auth.uid()
  and (
    organization_id is null
    or public.is_organization_member(organization_id, auth.uid())
  )
  and (
    project_id is null
    or exists (
      select 1
      from public.projects p
      where p.id = tasks.project_id
        and p.organization_id is not distinct from tasks.organization_id
        and (
          p.owner_id = auth.uid()
          or public.is_project_member(p.id, auth.uid())
          or (
            p.organization_id is not null
            and public.is_organization_member(p.organization_id, auth.uid())
          )
        )
    )
  )
);

create policy tasks_update_workspace_access
on public.tasks
for update
to authenticated
using (
  (
    organization_id is null
    and (
      owner_id = auth.uid()
      or public.is_task_assignee(id, auth.uid())
      or (
        project_id is not null
        and public.is_project_member(project_id, auth.uid())
      )
    )
  )
  or (
    organization_id is not null
    and (
      public.is_org_admin_or_manager(organization_id)
      or public.is_task_assignee(id, auth.uid())
      or (
        project_id is not null
        and public.is_project_member(project_id, auth.uid())
      )
    )
  )
)
with check (
  owner_id = auth.uid()
  and (
    organization_id is null
    or public.is_organization_member(organization_id, auth.uid())
  )
  and (
    project_id is null
    or exists (
      select 1
      from public.projects p
      where p.id = tasks.project_id
        and p.organization_id is not distinct from tasks.organization_id
    )
  )
);

create policy tasks_delete_workspace_owner
on public.tasks
for delete
to authenticated
using (
  (
    organization_id is null
    and owner_id = auth.uid()
  )
  or (
    organization_id is not null
    and public.is_org_admin(organization_id)
  )
);

-- ---------------------------------------------------------------------------
-- Organization lifecycle
-- ---------------------------------------------------------------------------

create or replace function public.schedule_organization_deletion(
  p_organization_id uuid,
  p_retention_days integer default 30
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_retention_days integer := greatest(coalesce(p_retention_days, 30), 1);
  v_org public.organizations%rowtype;
begin
  select * into v_org
  from public.organizations
  where id = p_organization_id;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'Organización no encontrada.');
  end if;

  if not (
    public.is_platform_admin()
    or v_org.owner_id = auth.uid()
    or public.is_org_admin(p_organization_id)
  ) then
    raise exception 'No tienes permisos para eliminar esta organización.';
  end if;

  update public.organizations
  set
    deleted_at = coalesce(deleted_at, v_now),
    purge_scheduled_at = v_now + make_interval(days => v_retention_days),
    purge_after = v_now + make_interval(days => v_retention_days),
    reactivated_at = null,
    updated_at = v_now
  where id = p_organization_id;

  return jsonb_build_object(
    'ok', true,
    'organization_id', p_organization_id,
    'deleted_at', v_now,
    'purge_after', v_now + make_interval(days => v_retention_days)
  );
end;
$$;

create or replace function public.restore_organization(
  p_organization_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_org public.organizations%rowtype;
begin
  select * into v_org
  from public.organizations
  where id = p_organization_id;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'Organización no encontrada.');
  end if;

  if not (
    public.is_platform_admin()
    or v_org.owner_id = auth.uid()
    or public.is_org_admin(p_organization_id)
  ) then
    raise exception 'No tienes permisos para restaurar esta organización.';
  end if;

  if v_org.deleted_at is null then
    return jsonb_build_object('ok', true, 'organization_id', p_organization_id, 'restored', false, 'message', 'La organización ya está activa.');
  end if;

  if v_org.purge_after is not null and v_org.purge_after <= v_now then
    return jsonb_build_object('ok', false, 'error', 'El periodo de recuperación ya venció.');
  end if;

  update public.organizations
  set
    deleted_at = null,
    purge_scheduled_at = null,
    purge_after = null,
    reactivated_at = v_now,
    updated_at = v_now
  where id = p_organization_id;

  return jsonb_build_object('ok', true, 'organization_id', p_organization_id, 'restored', true, 'reactivated_at', v_now);
end;
$$;

create or replace function public.purge_organization_data(
  p_organization_id uuid,
  p_force boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org public.organizations%rowtype;
  v_now timestamptz := now();
  v_counts jsonb := '{}'::jsonb;
  v_count integer;
begin
  select * into v_org
  from public.organizations
  where id = p_organization_id;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'Organización no encontrada.');
  end if;

  if not (
    public.is_platform_admin()
    or (
      p_force = true
      and (v_org.owner_id = auth.uid() or public.is_org_admin(p_organization_id))
      and v_org.deleted_at is not null
    )
    or (
      (v_org.owner_id = auth.uid() or public.is_org_admin(p_organization_id))
      and v_org.deleted_at is not null
      and coalesce(v_org.purge_after, v_org.purge_scheduled_at, v_now + interval '100 years') <= v_now
    )
  ) then
    raise exception 'No tienes permisos para purgar esta organización o el periodo de recuperación no ha vencido.';
  end if;

  -- Visual boards
  delete from public.visual_board_activity
  where board_id in (select id from public.visual_boards where organization_id = p_organization_id);
  get diagnostics v_count = row_count;
  v_counts := v_counts || jsonb_build_object('visual_board_activity', v_count);

  delete from public.visual_board_comments
  where board_id in (select id from public.visual_boards where organization_id = p_organization_id);
  get diagnostics v_count = row_count;
  v_counts := v_counts || jsonb_build_object('visual_board_comments', v_count);

  delete from public.visual_board_collaborators
  where board_id in (select id from public.visual_boards where organization_id = p_organization_id);
  get diagnostics v_count = row_count;
  v_counts := v_counts || jsonb_build_object('visual_board_collaborators', v_count);

  delete from public.visual_board_elements
  where board_id in (select id from public.visual_boards where organization_id = p_organization_id);
  get diagnostics v_count = row_count;
  v_counts := v_counts || jsonb_build_object('visual_board_elements', v_count);

  delete from public.visual_boards where organization_id = p_organization_id;
  get diagnostics v_count = row_count;
  v_counts := v_counts || jsonb_build_object('visual_boards', v_count);

  -- Task/project children
  delete from public.task_dependencies
  where predecessor_task_id in (select id from public.tasks where organization_id = p_organization_id)
     or successor_task_id in (select id from public.tasks where organization_id = p_organization_id);
  get diagnostics v_count = row_count;
  v_counts := v_counts || jsonb_build_object('task_dependencies', v_count);

  delete from public.task_checklist_items
  where task_id in (select id from public.tasks where organization_id = p_organization_id);
  get diagnostics v_count = row_count;
  v_counts := v_counts || jsonb_build_object('task_checklist_items', v_count);

  delete from public.task_assignees
  where task_id in (select id from public.tasks where organization_id = p_organization_id);
  get diagnostics v_count = row_count;
  v_counts := v_counts || jsonb_build_object('task_assignees', v_count);

  delete from public.reminders
  where task_id in (select id from public.tasks where organization_id = p_organization_id)
     or project_id in (select id from public.projects where organization_id = p_organization_id);
  get diagnostics v_count = row_count;
  v_counts := v_counts || jsonb_build_object('reminders', v_count);

  delete from public.comments
  where task_id in (select id from public.tasks where organization_id = p_organization_id)
     or project_id in (select id from public.projects where organization_id = p_organization_id);
  get diagnostics v_count = row_count;
  v_counts := v_counts || jsonb_build_object('comments', v_count);

  delete from public.attachments
  where task_id in (select id from public.tasks where organization_id = p_organization_id)
     or project_id in (select id from public.projects where organization_id = p_organization_id);
  get diagnostics v_count = row_count;
  v_counts := v_counts || jsonb_build_object('attachments', v_count);

  delete from public.project_section_permissions
  where project_id in (select id from public.projects where organization_id = p_organization_id);
  get diagnostics v_count = row_count;
  v_counts := v_counts || jsonb_build_object('project_section_permissions', v_count);

  delete from public.project_members
  where project_id in (select id from public.projects where organization_id = p_organization_id);
  get diagnostics v_count = row_count;
  v_counts := v_counts || jsonb_build_object('project_members', v_count);

  delete from public.tasks where organization_id = p_organization_id;
  get diagnostics v_count = row_count;
  v_counts := v_counts || jsonb_build_object('tasks', v_count);

  delete from public.projects where organization_id = p_organization_id;
  get diagnostics v_count = row_count;
  v_counts := v_counts || jsonb_build_object('projects', v_count);

  -- Workspace catalogs and organization-owned records
  delete from public.client_permissions where organization_id = p_organization_id;
  get diagnostics v_count = row_count;
  v_counts := v_counts || jsonb_build_object('client_permissions', v_count);

  delete from public.clients where organization_id = p_organization_id;
  get diagnostics v_count = row_count;
  v_counts := v_counts || jsonb_build_object('clients', v_count);

  delete from public.countries where organization_id = p_organization_id;
  get diagnostics v_count = row_count;
  v_counts := v_counts || jsonb_build_object('countries', v_count);

  delete from public.departments where organization_id = p_organization_id;
  get diagnostics v_count = row_count;
  v_counts := v_counts || jsonb_build_object('departments', v_count);

  delete from public.activity_logs where organization_id = p_organization_id;
  get diagnostics v_count = row_count;
  v_counts := v_counts || jsonb_build_object('activity_logs', v_count);

  delete from public.error_logs where organization_id = p_organization_id;
  get diagnostics v_count = row_count;
  v_counts := v_counts || jsonb_build_object('error_logs', v_count);

  delete from public.internal_support_tickets where organization_id = p_organization_id;
  get diagnostics v_count = row_count;
  v_counts := v_counts || jsonb_build_object('internal_support_tickets', v_count);

  delete from public.usage_events where organization_id = p_organization_id;
  get diagnostics v_count = row_count;
  v_counts := v_counts || jsonb_build_object('usage_events', v_count);

  delete from public.task_view_preferences where organization_id = p_organization_id;
  get diagnostics v_count = row_count;
  v_counts := v_counts || jsonb_build_object('task_view_preferences', v_count);

  -- Organization management records
  delete from public.organization_invites where organization_id = p_organization_id;
  get diagnostics v_count = row_count;
  v_counts := v_counts || jsonb_build_object('organization_invites', v_count);

  delete from public.organization_invoices where organization_id = p_organization_id;
  get diagnostics v_count = row_count;
  v_counts := v_counts || jsonb_build_object('organization_invoices', v_count);

  delete from public.organization_subscriptions where organization_id = p_organization_id;
  get diagnostics v_count = row_count;
  v_counts := v_counts || jsonb_build_object('organization_subscriptions', v_count);

  delete from public.organization_role_permissions where organization_id = p_organization_id;
  get diagnostics v_count = row_count;
  v_counts := v_counts || jsonb_build_object('organization_role_permissions', v_count);

  delete from public.organization_role_templates where organization_id = p_organization_id;
  get diagnostics v_count = row_count;
  v_counts := v_counts || jsonb_build_object('organization_role_templates', v_count);

  delete from public.organization_members where organization_id = p_organization_id;
  get diagnostics v_count = row_count;
  v_counts := v_counts || jsonb_build_object('organization_members', v_count);

  delete from public.organizations where id = p_organization_id;
  get diagnostics v_count = row_count;
  v_counts := v_counts || jsonb_build_object('organizations', v_count);

  return jsonb_build_object('ok', true, 'organization_id', p_organization_id, 'purged_at', v_now, 'counts', v_counts);
end;
$$;

create or replace function public.purge_expired_organizations()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org record;
  v_results jsonb := '[]'::jsonb;
  v_result jsonb;
begin
  if not public.is_platform_admin() then
    raise exception 'Solo un administrador de plataforma puede ejecutar la purga automática.';
  end if;

  for v_org in
    select id
    from public.organizations
    where deleted_at is not null
      and coalesce(purge_after, purge_scheduled_at) is not null
      and coalesce(purge_after, purge_scheduled_at) <= now()
  loop
    v_result := public.purge_organization_data(v_org.id, true);
    v_results := v_results || jsonb_build_array(v_result);
  end loop;

  return jsonb_build_object('ok', true, 'results', v_results);
end;
$$;

-- Move a complete personal project into an organization.
-- This does not move every personal task globally; it only moves the selected project and its direct tasks.
create or replace function public.move_personal_project_to_organization(
  p_project_id uuid,
  p_organization_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_project public.projects%rowtype;
begin
  select * into v_project
  from public.projects
  where id = p_project_id
    and organization_id is null;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'Proyecto personal no encontrado.');
  end if;

  if v_project.owner_id <> auth.uid() then
    raise exception 'Solo el dueño puede mover este proyecto.';
  end if;

  if not public.is_organization_member(p_organization_id, auth.uid()) then
    raise exception 'No perteneces a la organización destino.';
  end if;

  update public.projects
  set organization_id = p_organization_id
  where id = p_project_id;

  update public.tasks
  set organization_id = p_organization_id
  where project_id = p_project_id
    and organization_id is null;

  return jsonb_build_object(
    'ok', true,
    'project_id', p_project_id,
    'organization_id', p_organization_id
  );
end;
$$;

grant execute on function public.schedule_organization_deletion(uuid, integer) to authenticated;
grant execute on function public.restore_organization(uuid) to authenticated;
grant execute on function public.purge_organization_data(uuid, boolean) to authenticated;
grant execute on function public.purge_expired_organizations() to authenticated;
grant execute on function public.move_personal_project_to_organization(uuid, uuid) to authenticated;
