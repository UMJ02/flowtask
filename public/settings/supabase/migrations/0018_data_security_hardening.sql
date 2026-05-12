create or replace function public.is_org_admin_or_manager(org_id uuid)
returns boolean
language sql
stable
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
as $$
  select exists (
    select 1
    from public.organization_members om
    where om.organization_id = org_id
      and om.user_id = auth.uid()
      and om.role = 'admin_global'
  );
$$;

create index if not exists organization_members_user_default_idx on public.organization_members (user_id, is_default desc, created_at desc);
create index if not exists client_permissions_org_user_idx on public.client_permissions (organization_id, user_id, client_id);
create index if not exists organization_invites_org_email_status_idx on public.organization_invites (organization_id, email, status);
create index if not exists organization_role_templates_org_name_idx on public.organization_role_templates (organization_id, name);
create index if not exists organization_role_permissions_org_role_idx on public.organization_role_permissions (organization_id, role_template_id);

create policy "organizations_update_admin"
on public.organizations
for update to authenticated
using (public.is_org_admin(id))
with check (public.is_org_admin(id));

do $$ begin
  create policy "organization_members_insert_admin_or_manager"
  on public.organization_members
  for insert to authenticated
  with check (public.is_org_admin_or_manager(organization_id));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "organization_members_update_admin_or_manager"
  on public.organization_members
  for update to authenticated
  using (public.is_org_admin_or_manager(organization_id))
  with check (public.is_org_admin_or_manager(organization_id));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "organization_members_delete_admin"
  on public.organization_members
  for delete to authenticated
  using (public.is_org_admin(organization_id));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "client_permissions_insert_admin_or_manager"
  on public.client_permissions
  for insert to authenticated
  with check (public.is_org_admin_or_manager(organization_id));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "client_permissions_update_admin_or_manager"
  on public.client_permissions
  for update to authenticated
  using (public.is_org_admin_or_manager(organization_id))
  with check (public.is_org_admin_or_manager(organization_id));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "client_permissions_delete_admin"
  on public.client_permissions
  for delete to authenticated
  using (public.is_org_admin(organization_id));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "organization_role_templates_insert_admin_or_manager"
  on public.organization_role_templates
  for insert to authenticated
  with check (public.is_org_admin_or_manager(organization_id));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "organization_role_templates_update_admin_or_manager"
  on public.organization_role_templates
  for update to authenticated
  using (public.is_org_admin_or_manager(organization_id))
  with check (public.is_org_admin_or_manager(organization_id));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "organization_role_templates_delete_admin"
  on public.organization_role_templates
  for delete to authenticated
  using (public.is_org_admin(organization_id));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "organization_role_permissions_insert_admin_or_manager"
  on public.organization_role_permissions
  for insert to authenticated
  with check (public.is_org_admin_or_manager(organization_id));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "organization_role_permissions_update_admin_or_manager"
  on public.organization_role_permissions
  for update to authenticated
  using (public.is_org_admin_or_manager(organization_id))
  with check (public.is_org_admin_or_manager(organization_id));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "organization_role_permissions_delete_admin"
  on public.organization_role_permissions
  for delete to authenticated
  using (public.is_org_admin(organization_id));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "organization_invites_update_admin_or_manager"
  on public.organization_invites
  for update to authenticated
  using (public.is_org_admin_or_manager(organization_id))
  with check (public.is_org_admin_or_manager(organization_id));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "organization_invites_delete_admin_or_manager"
  on public.organization_invites
  for delete to authenticated
  using (public.is_org_admin_or_manager(organization_id));
exception when duplicate_object then null; end $$;
