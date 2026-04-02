-- V53.1 · Security & Access Foundation
-- Objetivos:
-- 1) Separar admin de organización de admin de plataforma.
-- 2) Evitar escalamiento manager -> admin_global.
-- 3) Endurecer invites / client permissions / attachments.
-- 4) Alinear integridad relacional client <-> project <-> task.

alter table public.platform_admins
  add column if not exists grant_source text not null default 'manual';

alter table public.platform_admins
  drop constraint if exists platform_admins_grant_source_check;

alter table public.platform_admins
  add constraint platform_admins_grant_source_check
  check (grant_source in ('manual', 'legacy_bootstrap'));

update public.platform_admins
set grant_source = 'legacy_bootstrap'
where grant_source is distinct from 'legacy_bootstrap';

create or replace function public.is_org_admin_or_manager(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members om
    where om.organization_id = org_id
      and om.user_id = auth.uid()
      and om.role in ('admin_global', 'manager')
  );
$$;

create or replace function public.is_org_admin(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members om
    where om.organization_id = org_id
      and om.user_id = auth.uid()
      and om.role = 'admin_global'
  );
$$;

create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.platform_admins pa
    where pa.user_id = auth.uid()
      and pa.active = true
      and pa.grant_source = 'manual'
  );
$$;

revoke all on function public.is_org_admin_or_manager(uuid) from public;
revoke all on function public.is_org_admin(uuid) from public;
revoke all on function public.is_platform_admin() from public;
grant execute on function public.is_org_admin_or_manager(uuid) to authenticated;
grant execute on function public.is_org_admin(uuid) to authenticated;
grant execute on function public.is_platform_admin() to authenticated;

create or replace function public.has_client_access(p_client_id uuid, p_mode text default 'view')
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.clients c
    where c.id = p_client_id
      and (
        public.is_platform_admin()
        or public.is_org_admin_or_manager(c.organization_id)
        or exists (
          select 1
          from public.client_permissions cp
          where cp.client_id = c.id
            and cp.organization_id = c.organization_id
            and cp.user_id = auth.uid()
            and (
              case
                when p_mode = 'edit' then cp.can_edit
                when p_mode = 'manage_members' then cp.can_manage_members
                else (cp.can_view or cp.can_edit or cp.can_manage_members)
              end
            )
        )
      )
  );
$$;

revoke all on function public.has_client_access(uuid, text) from public;
grant execute on function public.has_client_access(uuid, text) to authenticated;

create or replace function public.can_assign_org_role(org_id uuid, target_role text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case
    when public.is_platform_admin() then true
    when public.is_org_admin(org_id) then target_role in ('admin_global', 'manager', 'member', 'viewer')
    when public.is_org_admin_or_manager(org_id) then target_role in ('manager', 'member', 'viewer')
    else false
  end;
$$;

revoke all on function public.can_assign_org_role(uuid, text) from public;
grant execute on function public.can_assign_org_role(uuid, text) to authenticated;

create or replace function public.enforce_org_role_security()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  acting_is_admin boolean;
  acting_is_manager boolean;
begin
  acting_is_admin := public.is_platform_admin() or public.is_org_admin(coalesce(new.organization_id, old.organization_id));
  acting_is_manager := public.is_org_admin_or_manager(coalesce(new.organization_id, old.organization_id));

  if not acting_is_manager then
    raise exception 'No tienes permisos para administrar esta organización.';
  end if;

  if tg_op in ('INSERT', 'UPDATE') then
    if not public.can_assign_org_role(new.organization_id, new.role) then
      raise exception 'No puedes asignar el rol % en esta organización.', new.role;
    end if;
  end if;

  if tg_op = 'UPDATE' and old.role = 'admin_global' and not acting_is_admin then
    raise exception 'Solo un admin global puede modificar a otro admin global.';
  end if;

  if tg_op = 'DELETE' and old.role = 'admin_global' and not acting_is_admin then
    raise exception 'Solo un admin global puede eliminar a otro admin global.';
  end if;

  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_organization_members_role_security on public.organization_members;
create trigger trg_organization_members_role_security
before insert or update or delete on public.organization_members
for each row execute function public.enforce_org_role_security();

drop trigger if exists trg_organization_invites_role_security on public.organization_invites;
create trigger trg_organization_invites_role_security
before insert or update or delete on public.organization_invites
for each row execute function public.enforce_org_role_security();

drop policy if exists "organization_members_insert_admin_or_manager" on public.organization_members;
create policy "organization_members_insert_admin_or_manager"
on public.organization_members
for insert to authenticated
with check (
  public.is_org_admin_or_manager(organization_id)
  and public.can_assign_org_role(organization_id, role)
);

drop policy if exists "organization_members_update_admin_or_manager" on public.organization_members;
create policy "organization_members_update_admin_or_manager"
on public.organization_members
for update to authenticated
using (
  public.is_org_admin_or_manager(organization_id)
  and (role <> 'admin_global' or public.is_org_admin(organization_id))
)
with check (
  public.is_org_admin_or_manager(organization_id)
  and public.can_assign_org_role(organization_id, role)
);

drop policy if exists "organization_members_delete_admin" on public.organization_members;
create policy "organization_members_delete_admin"
on public.organization_members
for delete to authenticated
using (
  public.is_org_admin_or_manager(organization_id)
  and (role <> 'admin_global' or public.is_org_admin(organization_id))
);

drop policy if exists "organization_invites_insert_admin_or_manager" on public.organization_invites;
create policy "organization_invites_insert_admin_or_manager"
on public.organization_invites
for insert to authenticated
with check (
  public.is_org_admin_or_manager(organization_id)
  and public.can_assign_org_role(organization_id, role)
);

drop policy if exists "organization_invites_update_admin_or_manager" on public.organization_invites;
create policy "organization_invites_update_admin_or_manager"
on public.organization_invites
for update to authenticated
using (
  public.is_org_admin_or_manager(organization_id)
  and (role <> 'admin_global' or public.is_org_admin(organization_id))
)
with check (
  public.is_org_admin_or_manager(organization_id)
  and public.can_assign_org_role(organization_id, role)
);

drop policy if exists "organization_invites_delete_admin_or_manager" on public.organization_invites;
create policy "organization_invites_delete_admin_or_manager"
on public.organization_invites
for delete to authenticated
using (
  public.is_org_admin_or_manager(organization_id)
  and (role <> 'admin_global' or public.is_org_admin(organization_id))
);

drop policy if exists "client_permissions_insert_admin_or_manager" on public.client_permissions;
create policy "client_permissions_insert_admin_or_manager"
on public.client_permissions
for insert to authenticated
with check (
  public.is_org_admin_or_manager(organization_id)
  and public.can_assign_org_role(organization_id, role)
);

drop policy if exists "client_permissions_update_admin_or_manager" on public.client_permissions;
create policy "client_permissions_update_admin_or_manager"
on public.client_permissions
for update to authenticated
using (
  public.is_org_admin_or_manager(organization_id)
  and (role <> 'admin_global' or public.is_org_admin(organization_id))
)
with check (
  public.is_org_admin_or_manager(organization_id)
  and public.can_assign_org_role(organization_id, role)
);

drop policy if exists "client_permissions_delete_admin" on public.client_permissions;
create policy "client_permissions_delete_admin"
on public.client_permissions
for delete to authenticated
using (
  public.is_org_admin_or_manager(organization_id)
  and (role <> 'admin_global' or public.is_org_admin(organization_id))
);

create or replace function public.enforce_project_integrity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  client_org_id uuid;
begin
  if new.client_id is not null then
    select c.organization_id into client_org_id
    from public.clients c
    where c.id = new.client_id;

    if client_org_id is null then
      raise exception 'El cliente asociado no existe.';
    end if;

    if new.organization_id is null then
      new.organization_id := client_org_id;
    elsif new.organization_id <> client_org_id then
      raise exception 'El cliente debe pertenecer a la misma organización del proyecto.';
    end if;
  end if;

  if new.organization_id is not null and not exists (
    select 1 from public.organization_members om
    where om.organization_id = new.organization_id
      and om.user_id = new.owner_id
  ) then
    raise exception 'El owner del proyecto debe pertenecer a la organización.';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_projects_integrity on public.projects;
create trigger trg_projects_integrity
before insert or update on public.projects
for each row execute function public.enforce_project_integrity();

create or replace function public.enforce_task_integrity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  project_org_id uuid;
  project_client_id uuid;
  client_org_id uuid;
begin
  if new.project_id is not null then
    select p.organization_id, p.client_id into project_org_id, project_client_id
    from public.projects p
    where p.id = new.project_id;

    if project_org_id is null and project_client_id is null then
      if not exists (select 1 from public.projects p where p.id = new.project_id) then
        raise exception 'El proyecto asociado no existe.';
      end if;
    end if;

    if new.organization_id is null then
      new.organization_id := project_org_id;
    elsif project_org_id is not null and new.organization_id <> project_org_id then
      raise exception 'La tarea debe pertenecer a la misma organización del proyecto.';
    end if;

    if new.client_id is null and project_client_id is not null then
      new.client_id := project_client_id;
    elsif project_client_id is not null and new.client_id <> project_client_id then
      raise exception 'La tarea debe usar el mismo cliente del proyecto vinculado.';
    end if;
  end if;

  if new.client_id is not null then
    select c.organization_id into client_org_id
    from public.clients c
    where c.id = new.client_id;

    if client_org_id is null then
      raise exception 'El cliente asociado a la tarea no existe.';
    end if;

    if new.organization_id is null then
      new.organization_id := client_org_id;
    elsif new.organization_id <> client_org_id then
      raise exception 'El cliente debe pertenecer a la misma organización de la tarea.';
    end if;
  end if;

  if new.organization_id is not null and not exists (
    select 1 from public.organization_members om
    where om.organization_id = new.organization_id
      and om.user_id = new.owner_id
  ) then
    raise exception 'El owner de la tarea debe pertenecer a la organización.';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_tasks_integrity on public.tasks;
create trigger trg_tasks_integrity
before insert or update on public.tasks
for each row execute function public.enforce_task_integrity();

drop policy if exists "attachments_insert_owner" on public.attachments;
create policy "attachments_insert_owner"
on public.attachments
for insert to authenticated
with check (
  owner_id = auth.uid()
  and (
    (task_id is not null and exists (
      select 1 from public.tasks t
      where t.id = attachments.task_id
        and (
          t.owner_id = auth.uid()
          or public.has_client_access(t.client_id, 'edit')
          or (t.project_id is not null and exists (
            select 1 from public.project_members pm
            where pm.project_id = t.project_id and pm.user_id = auth.uid()
          ))
        )
    ))
    or
    (project_id is not null and exists (
      select 1 from public.projects p
      where p.id = attachments.project_id
        and (
          p.owner_id = auth.uid()
          or public.has_client_access(p.client_id, 'edit')
          or exists (
            select 1 from public.project_members pm
            where pm.project_id = p.id and pm.user_id = auth.uid()
          )
        )
    ))
  )
);

drop policy if exists "attachments_delete_owner" on public.attachments;
create policy "attachments_delete_owner"
on public.attachments
for delete to authenticated
using (
  owner_id = auth.uid()
);

do $$
begin
  if not exists (select 1 from storage.buckets where id = 'attachments') then
    insert into storage.buckets (id, name, public)
    values ('attachments', 'attachments', false);
  end if;
exception when undefined_table then
  null;
end $$;

do $$ begin
  create policy "attachments_storage_select_authenticated"
  on storage.objects for select to authenticated
  using (bucket_id = 'attachments');
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "attachments_storage_insert_owner"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'attachments' and owner = auth.uid());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "attachments_storage_update_owner"
  on storage.objects for update to authenticated
  using (bucket_id = 'attachments' and owner = auth.uid())
  with check (bucket_id = 'attachments' and owner = auth.uid());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "attachments_storage_delete_owner"
  on storage.objects for delete to authenticated
  using (bucket_id = 'attachments' and owner = auth.uid());
exception when duplicate_object then null; end $$;
