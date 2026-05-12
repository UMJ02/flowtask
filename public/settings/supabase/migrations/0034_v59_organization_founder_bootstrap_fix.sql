-- V59 · Founder bootstrap fix for organization creation
-- Evita recursión / stack depth al crear el primer miembro fundador de una organización.

create or replace function public.can_bootstrap_org_founder(org_id uuid, target_user_id uuid, target_role text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select (
    auth.uid() is not null
    and target_user_id = auth.uid()
    and target_role = 'admin_global'
    and exists (
      select 1
      from public.organizations o
      where o.id = org_id
        and o.owner_id = auth.uid()
    )
    and not exists (
      select 1
      from public.organization_members om
      where om.organization_id = org_id
    )
  );
$$;

revoke all on function public.can_bootstrap_org_founder(uuid, uuid, text) from public;
grant execute on function public.can_bootstrap_org_founder(uuid, uuid, text) to authenticated;

create or replace function public.enforce_org_role_security()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  acting_is_admin boolean;
  acting_is_manager boolean;
  invite_matches boolean := false;
  current_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
begin
  -- Permite bootstrap del miembro fundador al crear una organización nueva.
  if tg_table_name = 'organization_members' and tg_op = 'INSERT' then
    if public.can_bootstrap_org_founder(new.organization_id, new.user_id, new.role) then
      return new;
    end if;
  end if;

  -- Permite que un usuario acepte SU propia invitación pendiente sin requerir privilegios de manager/admin.
  if tg_table_name = 'organization_members' and tg_op = 'INSERT' and auth.uid() is not null then
    select exists (
      select 1
      from public.organization_invites oi
      where oi.organization_id = new.organization_id
        and lower(oi.email) = current_email
        and oi.role = new.role
        and oi.status = 'pending'
    ) into invite_matches;

    if invite_matches and new.user_id = auth.uid() then
      return new;
    end if;
  end if;

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

drop policy if exists "organization_members_insert_admin_or_manager" on public.organization_members;
create policy "organization_members_insert_admin_or_manager"
on public.organization_members
for insert to authenticated
with check (
  public.can_bootstrap_org_founder(organization_id, user_id, role)
  or (
    public.is_org_admin_or_manager(organization_id)
    and public.can_assign_org_role(organization_id, role)
  )
);
