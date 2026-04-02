-- V53.3 · Production Release Hardening
-- Objetivos:
-- 1) Blindar integridad relacional project <-> client <-> organization.
-- 2) Blindar integridad relacional task <-> project <-> client <-> organization.
-- 3) Evitar invitaciones pendientes duplicadas por organización/correo.
-- 4) Preparar salida a cliente con validaciones de producción no destructivas.

create index if not exists projects_organization_client_idx
  on public.projects (organization_id, client_id, created_at desc);

create index if not exists tasks_organization_client_project_idx
  on public.tasks (organization_id, client_id, project_id, created_at desc);

create unique index if not exists organization_invites_pending_email_unique_idx
  on public.organization_invites (organization_id, lower(email))
  where status = 'pending';

create or replace function public.enforce_project_task_workspace_integrity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_client public.clients%rowtype;
  v_project public.projects%rowtype;
begin
  if tg_table_name = 'projects' then
    if new.client_id is not null then
      select * into v_client from public.clients where id = new.client_id;
      if not found then
        raise exception 'El cliente seleccionado no existe.';
      end if;

      if new.organization_id is null then
        new.organization_id := v_client.organization_id;
      end if;

      if v_client.organization_id is distinct from new.organization_id then
        raise exception 'El proyecto no puede usar un cliente de otra organización.';
      end if;
    end if;

    return new;
  end if;

  if tg_table_name = 'tasks' then
    if new.project_id is not null then
      select * into v_project from public.projects where id = new.project_id;
      if not found then
        raise exception 'El proyecto seleccionado no existe.';
      end if;

      if new.organization_id is null then
        new.organization_id := v_project.organization_id;
      end if;

      if v_project.organization_id is not null and new.organization_id is distinct from v_project.organization_id then
        raise exception 'La tarea no puede quedar en una organización distinta a la del proyecto.';
      end if;

      if new.client_id is null then
        new.client_id := v_project.client_id;
      end if;

      if v_project.client_id is not null and new.client_id is distinct from v_project.client_id then
        raise exception 'La tarea no puede usar un cliente distinto al del proyecto.';
      end if;

      if (new.client_name is null or btrim(new.client_name) = '') and v_project.client_name is not null then
        new.client_name := v_project.client_name;
      end if;
    end if;

    if new.client_id is not null then
      select * into v_client from public.clients where id = new.client_id;
      if not found then
        raise exception 'El cliente seleccionado no existe.';
      end if;

      if new.organization_id is null then
        new.organization_id := v_client.organization_id;
      end if;

      if v_client.organization_id is distinct from new.organization_id then
        raise exception 'La tarea no puede usar un cliente de otra organización.';
      end if;
    end if;

    return new;
  end if;

  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_projects_workspace_integrity on public.projects;
create trigger trg_projects_workspace_integrity
before insert or update on public.projects
for each row execute function public.enforce_project_task_workspace_integrity();

drop trigger if exists trg_tasks_workspace_integrity on public.tasks;
create trigger trg_tasks_workspace_integrity
before insert or update on public.tasks
for each row execute function public.enforce_project_task_workspace_integrity();

create or replace function public.normalize_organization_invite_email()
returns trigger
language plpgsql
as $$
begin
  new.email := lower(btrim(new.email));
  return new;
end;
$$;

drop trigger if exists trg_organization_invites_normalize_email on public.organization_invites;
create trigger trg_organization_invites_normalize_email
before insert or update on public.organization_invites
for each row execute function public.normalize_organization_invite_email();
