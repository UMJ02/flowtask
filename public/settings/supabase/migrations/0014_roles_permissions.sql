create table if not exists public.organization_permission_definitions (
  key text primary key,
  label text not null,
  description text,
  category text not null check (category in ('tasks','projects','clients','team','reports')),
  created_at timestamptz not null default now()
);

create table if not exists public.organization_role_templates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  description text not null default '',
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  unique (organization_id, name)
);

create table if not exists public.organization_role_permissions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  role_template_id uuid not null references public.organization_role_templates(id) on delete cascade,
  permission_key text not null references public.organization_permission_definitions(key) on delete cascade,
  created_at timestamptz not null default now(),
  unique (organization_id, role_template_id, permission_key)
);

alter table public.organization_permission_definitions enable row level security;
alter table public.organization_role_templates enable row level security;
alter table public.organization_role_permissions enable row level security;

do $$ begin
  create policy "organization_permission_definitions_select_authenticated"
  on public.organization_permission_definitions for select to authenticated using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "organization_role_templates_select_member"
  on public.organization_role_templates for select to authenticated using (
    exists (
      select 1 from public.organization_members om
      where om.organization_id = organization_role_templates.organization_id
        and om.user_id = auth.uid()
    )
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "organization_role_permissions_select_member"
  on public.organization_role_permissions for select to authenticated using (
    exists (
      select 1 from public.organization_members om
      where om.organization_id = organization_role_permissions.organization_id
        and om.user_id = auth.uid()
    )
  );
exception when duplicate_object then null; end $$;

insert into public.organization_permission_definitions (key, label, description, category) values
  ('tasks.create', 'Crear tareas', 'Permite crear nuevas tareas dentro de la organización.', 'tasks'),
  ('tasks.edit', 'Editar tareas', 'Permite actualizar contenido y seguimiento de tareas.', 'tasks'),
  ('tasks.delete', 'Eliminar tareas', 'Permite borrar tareas creadas dentro de la organización.', 'tasks'),
  ('projects.manage', 'Gestionar proyectos', 'Permite crear, editar y cerrar proyectos.', 'projects'),
  ('clients.manage', 'Gestionar clientes', 'Permite cambiar permisos y configuración por cliente.', 'clients'),
  ('team.invite', 'Invitar miembros', 'Permite invitar nuevas personas y asignar roles.', 'team'),
  ('reports.view', 'Ver reportes', 'Permite acceder a métricas y exportaciones.', 'reports')
on conflict (key) do update set
  label = excluded.label,
  description = excluded.description,
  category = excluded.category;

insert into public.organization_role_templates (organization_id, name, description, is_system)
select o.id, r.name, r.description, true
from public.organizations o
cross join (
  values
    ('admin_global', 'Control total de organización y clientes.'),
    ('manager', 'Coordinación operativa con acceso a equipo y reportes.'),
    ('member', 'Ejecución operativa diaria sobre tareas.'),
    ('viewer', 'Lectura y seguimiento para jefatura.')
) as r(name, description)
on conflict (organization_id, name) do nothing;

insert into public.organization_role_permissions (organization_id, role_template_id, permission_key)
select rt.organization_id, rt.id, perms.permission_key
from public.organization_role_templates rt
join lateral (
  select unnest(
    case rt.name
      when 'admin_global' then array['tasks.create','tasks.edit','tasks.delete','projects.manage','clients.manage','team.invite','reports.view']::text[]
      when 'manager' then array['tasks.create','tasks.edit','projects.manage','clients.manage','team.invite','reports.view']::text[]
      when 'member' then array['tasks.create','tasks.edit']::text[]
      when 'viewer' then array['reports.view']::text[]
      else array[]::text[]
    end
  ) as permission_key
) perms on true
on conflict (organization_id, role_template_id, permission_key) do nothing;
