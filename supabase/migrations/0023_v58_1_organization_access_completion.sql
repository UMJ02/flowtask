-- V58.1 · Organization access completion
-- Completa el flujo real: bootstrap → owner/admin → invitar → aceptar invitación → roles consistentes.

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

-- El usuario puede ver las invitaciones enviadas a SU correo, además de las de su organización.
drop policy if exists "organization_invites_select_related" on public.organization_invites;
create policy "organization_invites_select_related"
on public.organization_invites for select to authenticated
using (
  exists (
    select 1
    from public.organization_members om
    where om.organization_id = organization_invites.organization_id
      and om.user_id = auth.uid()
  )
  or lower(organization_invites.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
);

create or replace function public.accept_organization_invite(p_invite_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  v_invite public.organization_invites%rowtype;
  v_membership_id uuid;
  v_default_exists boolean;
begin
  if v_user_id is null then
    raise exception 'Sesión no válida.';
  end if;

  select *
  into v_invite
  from public.organization_invites
  where id = p_invite_id
    and status = 'pending'
    and lower(email) = v_email
  limit 1;

  if v_invite.id is null then
    raise exception 'No se encontró una invitación pendiente para esta cuenta.';
  end if;

  update public.organization_members
  set is_default = false
  where user_id = v_user_id
    and is_default = true;

  insert into public.organization_members (organization_id, user_id, role, is_default)
  values (v_invite.organization_id, v_user_id, v_invite.role, true)
  on conflict (organization_id, user_id)
  do update set role = excluded.role, is_default = true
  returning id into v_membership_id;

  update public.organization_invites
  set status = 'accepted', accepted_by = v_user_id, accepted_at = now()
  where id = v_invite.id;

  return v_invite.organization_id;
end;
$$;

revoke all on function public.accept_organization_invite(uuid) from public;
grant execute on function public.accept_organization_invite(uuid) to authenticated;
