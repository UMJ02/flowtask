-- V58.10.5 · clients personal scope + contact email + import readiness

alter table public.clients
  add column if not exists contact_email text;

create index if not exists clients_contact_email_idx on public.clients (contact_email);
create index if not exists activity_logs_user_created_idx on public.activity_logs (user_id, created_at desc);

-- Permitir scope personal además del organizacional.
drop policy if exists "clients_select_org_member" on public.clients;
create policy "clients_select_org_member" on public.clients
for select to authenticated
using (
  public.is_platform_admin()
  or (
    clients.organization_id is not null
    and exists (
      select 1 from public.organization_members om
      where om.organization_id = clients.organization_id
        and om.user_id = auth.uid()
    )
  )
  or (
    clients.organization_id is null
    and clients.account_owner_id = auth.uid()
  )
);

drop policy if exists "clients_insert_org_manager" on public.clients;
create policy "clients_insert_org_manager" on public.clients
for insert to authenticated
with check (
  public.is_platform_admin()
  or (
    clients.organization_id is not null
    and exists (
      select 1 from public.organization_members om
      where om.organization_id = clients.organization_id
        and om.user_id = auth.uid()
        and om.role in ('admin_global','manager')
    )
  )
  or (
    clients.organization_id is null
    and clients.account_owner_id = auth.uid()
  )
);

drop policy if exists "clients_update_org_manager" on public.clients;
create policy "clients_update_org_manager" on public.clients
for update to authenticated
using (
  public.is_platform_admin()
  or (
    clients.organization_id is not null
    and exists (
      select 1 from public.organization_members om
      where om.organization_id = clients.organization_id
        and om.user_id = auth.uid()
        and om.role in ('admin_global','manager')
    )
  )
  or (
    clients.organization_id is null
    and clients.account_owner_id = auth.uid()
  )
)
with check (
  public.is_platform_admin()
  or (
    clients.organization_id is not null
    and exists (
      select 1 from public.organization_members om
      where om.organization_id = clients.organization_id
        and om.user_id = auth.uid()
        and om.role in ('admin_global','manager')
    )
  )
  or (
    clients.organization_id is null
    and clients.account_owner_id = auth.uid()
  )
);

drop policy if exists "clients_delete_org_admin" on public.clients;
create policy "clients_delete_org_admin" on public.clients
for delete to authenticated
using (
  public.is_platform_admin()
  or (
    clients.organization_id is not null
    and exists (
      select 1 from public.organization_members om
      where om.organization_id = clients.organization_id
        and om.user_id = auth.uid()
        and om.role = 'admin_global'
    )
  )
  or (
    clients.organization_id is null
    and clients.account_owner_id = auth.uid()
  )
);
