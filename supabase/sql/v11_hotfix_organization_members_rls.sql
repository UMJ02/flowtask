-- Flowtask V11 hotfix: organization_members RLS recursion mitigation
-- Run this in Supabase SQL Editor after the base schema.

begin;

drop policy if exists "organization_members_select_member" on public.organization_members;

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

revoke all on function public.is_org_admin_or_manager(uuid) from public;
revoke all on function public.is_org_admin(uuid) from public;
grant execute on function public.is_org_admin_or_manager(uuid) to authenticated;
grant execute on function public.is_org_admin(uuid) to authenticated;

create policy "organization_members_select_member"
on public.organization_members
for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_org_admin_or_manager(organization_id)
  or public.is_platform_admin()
);

commit;
