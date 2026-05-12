create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  owner_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member',
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  unique (organization_id, user_id),
  constraint organization_members_role_check check (role in ('admin_global', 'manager', 'member', 'viewer'))
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (organization_id, name)
);

alter table public.projects add column if not exists organization_id uuid references public.organizations(id) on delete set null;
alter table public.tasks add column if not exists organization_id uuid references public.organizations(id) on delete set null;
alter table public.projects add column if not exists client_id uuid references public.clients(id) on delete set null;
alter table public.tasks add column if not exists client_id uuid references public.clients(id) on delete set null;

create table if not exists public.client_permissions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  role text not null default 'viewer',
  can_view boolean not null default true,
  can_edit boolean not null default false,
  can_manage_members boolean not null default false,
  created_at timestamptz not null default now(),
  unique (organization_id, client_id, user_id),
  constraint client_permissions_role_check check (role in ('admin_global', 'manager', 'member', 'viewer'))
);

alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.clients enable row level security;
alter table public.client_permissions enable row level security;

drop policy if exists "organizations_select_member" on public.organizations;
create policy "organizations_select_member" on public.organizations for select to authenticated using (
  exists (
    select 1 from public.organization_members om
    where om.organization_id = organizations.id and om.user_id = auth.uid()
  )
);

drop policy if exists "organization_members_select_member" on public.organization_members;
create policy "organization_members_select_member" on public.organization_members for select to authenticated using (
  user_id = auth.uid() or exists (
    select 1 from public.organization_members om
    where om.organization_id = organization_members.organization_id
      and om.user_id = auth.uid()
      and om.role in ('admin_global','manager')
  )
);

drop policy if exists "clients_select_org_member" on public.clients;
create policy "clients_select_org_member" on public.clients for select to authenticated using (
  exists (
    select 1 from public.organization_members om
    where om.organization_id = clients.organization_id and om.user_id = auth.uid()
  )
);

drop policy if exists "client_permissions_select_related" on public.client_permissions;
create policy "client_permissions_select_related" on public.client_permissions for select to authenticated using (
  user_id = auth.uid() or exists (
    select 1 from public.organization_members om
    where om.organization_id = client_permissions.organization_id
      and om.user_id = auth.uid()
      and om.role in ('admin_global','manager')
  )
);
