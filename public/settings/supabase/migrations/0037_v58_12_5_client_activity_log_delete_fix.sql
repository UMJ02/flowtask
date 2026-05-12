create or replace function public.write_governance_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_action text;
  v_entity_type text;
  v_entity_id uuid;
  v_org_id uuid;
  v_client_id uuid;
  v_metadata jsonb := '{}'::jsonb;
begin
  if tg_table_name = 'clients' then
    v_entity_type := 'client';
    v_entity_id := coalesce(new.id, old.id);
    v_org_id := coalesce(new.organization_id, old.organization_id);
    v_client_id := null;
    v_action := case tg_op when 'INSERT' then 'client_created' when 'UPDATE' then 'client_updated' else 'client_deleted' end;
    v_metadata := jsonb_build_object(
      'name', coalesce(new.name, old.name),
      'status', coalesce(new.status, old.status),
      'client_id', coalesce(new.id, old.id)
    );
  elsif tg_table_name = 'organization_members' then
    v_entity_type := 'organization_member';
    v_entity_id := coalesce(new.id, old.id);
    v_org_id := coalesce(new.organization_id, old.organization_id);
    v_action := case tg_op when 'INSERT' then 'organization_member_created' when 'UPDATE' then 'organization_member_updated' else 'organization_member_deleted' end;
    v_metadata := jsonb_build_object(
      'user_id', coalesce(new.user_id, old.user_id),
      'role', coalesce(new.role, old.role),
      'previous_role', old.role
    );
  elsif tg_table_name = 'organization_invites' then
    v_entity_type := 'organization_invite';
    v_entity_id := coalesce(new.id, old.id);
    v_org_id := coalesce(new.organization_id, old.organization_id);
    v_action := case
      when tg_op = 'INSERT' then 'organization_invite_created'
      when tg_op = 'UPDATE' and coalesce(new.status, '') = 'revoked' and coalesce(old.status, '') <> 'revoked' then 'organization_invite_revoked'
      when tg_op = 'UPDATE' then 'organization_invite_updated'
      else 'organization_invite_deleted'
    end;
    v_metadata := jsonb_build_object(
      'email', coalesce(new.email, old.email),
      'role', coalesce(new.role, old.role),
      'status', coalesce(new.status, old.status)
    );
  elsif tg_table_name = 'client_permissions' then
    v_entity_type := 'client_permission';
    v_entity_id := coalesce(new.id, old.id);
    v_org_id := coalesce(new.organization_id, old.organization_id);
    v_client_id := coalesce(new.client_id, old.client_id);
    v_action := case tg_op when 'INSERT' then 'client_permission_created' when 'UPDATE' then 'client_permission_updated' else 'client_permission_deleted' end;
    v_metadata := jsonb_build_object(
      'user_id', coalesce(new.user_id, old.user_id),
      'role', coalesce(new.role, old.role),
      'can_view', coalesce(new.can_view, old.can_view),
      'can_edit', coalesce(new.can_edit, old.can_edit),
      'can_manage_members', coalesce(new.can_manage_members, old.can_manage_members)
    );
  else
    return coalesce(new, old);
  end if;

  insert into public.activity_logs (
    user_id, entity_type, entity_id, action, metadata, organization_id, client_id
  ) values (
    auth.uid(), v_entity_type, v_entity_id, v_action, v_metadata, v_org_id, v_client_id
  );

  return coalesce(new, old);
end;
$$;
