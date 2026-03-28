alter table public.clients add column if not exists status text not null default 'activo' check (status in ('activo','en_pausa','cerrado'));
alter table public.clients add column if not exists notes text;
alter table public.clients add column if not exists account_owner_id uuid references public.profiles(id) on delete set null;

create index if not exists clients_organization_status_idx on public.clients (organization_id, status);
create index if not exists projects_client_id_idx on public.projects (client_id);
create index if not exists tasks_client_id_idx on public.tasks (client_id);

drop policy if exists "clients_insert_org_manager" on public.clients;
create policy "clients_insert_org_manager" on public.clients for insert to authenticated with check (
  exists (
    select 1 from public.organization_members om
    where om.organization_id = clients.organization_id
      and om.user_id = auth.uid()
      and om.role in ('admin_global','manager')
  )
);

drop policy if exists "clients_update_org_manager" on public.clients;
create policy "clients_update_org_manager" on public.clients for update to authenticated using (
  exists (
    select 1 from public.organization_members om
    where om.organization_id = clients.organization_id
      and om.user_id = auth.uid()
      and om.role in ('admin_global','manager')
  )
) with check (
  exists (
    select 1 from public.organization_members om
    where om.organization_id = clients.organization_id
      and om.user_id = auth.uid()
      and om.role in ('admin_global','manager')
  )
);

drop policy if exists "clients_delete_org_admin" on public.clients;
create policy "clients_delete_org_admin" on public.clients for delete to authenticated using (
  exists (
    select 1 from public.organization_members om
    where om.organization_id = clients.organization_id
      and om.user_id = auth.uid()
      and om.role = 'admin_global'
  )
);
