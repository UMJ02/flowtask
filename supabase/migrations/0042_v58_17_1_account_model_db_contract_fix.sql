-- V58.17.1 Account Model & DB Contract Fix
-- Purpose:
-- 1. Keep the individual user as the primary account identity.
-- 2. Treat organizations as workspaces created/administered by users, never as users.
-- 3. Harden owner/admin consistency.
-- 4. Add DB comments documenting current contract without forcing final commercial plan names.

comment on table public.organizations is
'Flowtask organizations are collaborative workspaces created by individual users. They are not user accounts. The creator is the owner/admin.';

comment on column public.organizations.owner_id is
'Individual user who created/administers the organization. This is the primary ownership link.';

comment on table public.organization_members is
'Memberships link individual users to organizations with roles. Organizations never authenticate independently.';

comment on table public.activation_codes is
'Commercial activation codes. Plan labels are not final; use neutral internal plan_code values until pricing is approved.';

comment on column public.activation_codes.organization_limit is
'Maximum organizations unlockable by an individual account/plan. Enforced in application/business logic until billing is finalized.';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'organization_members_role_allowed_v58171'
      and conrelid = 'public.organization_members'::regclass
  ) then
    alter table public.organization_members
      add constraint organization_members_role_allowed_v58171
      check (role in ('admin_global','manager','member','viewer')) not valid;
  end if;
end $$;

create or replace function public.ensure_organization_owner_membership()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.owner_id is not null then
    insert into public.organization_members (organization_id, user_id, role, is_default)
    values (new.id, new.owner_id, 'admin_global', false)
    on conflict do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_ensure_organization_owner_membership on public.organizations;
create trigger trg_ensure_organization_owner_membership
after insert on public.organizations
for each row execute function public.ensure_organization_owner_membership();

create or replace function public.repair_organization_owner_memberships()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer := 0;
begin
  insert into public.organization_members (organization_id, user_id, role, is_default)
  select o.id, o.owner_id, 'admin_global', false
  from public.organizations o
  where o.owner_id is not null
    and not exists (
      select 1
      from public.organization_members om
      where om.organization_id = o.id
        and om.user_id = o.owner_id
    )
  on conflict do nothing;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

grant execute on function public.repair_organization_owner_memberships() to authenticated;

-- Keep existing bootstrap function but align its default subscription code
-- to a neutral, non-final internal code.
create or replace function public.bootstrap_organization_workspace(p_name text, p_slug text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_org_id uuid;
begin
  if v_user_id is null then
    raise exception 'Sesión no válida para crear la organización.';
  end if;

  if p_name is null or btrim(p_name) = '' then
    raise exception 'El nombre de la organización es obligatorio.';
  end if;

  if p_slug is null or btrim(p_slug) = '' then
    raise exception 'El slug de la organización es obligatorio.';
  end if;

  if exists (select 1 from public.organizations where slug = lower(btrim(p_slug))) then
    raise exception 'Ya existe una organización con ese slug.';
  end if;

  insert into public.organizations (name, slug, owner_id)
  values (btrim(p_name), lower(btrim(p_slug)), v_user_id)
  returning id into v_org_id;

  insert into public.organization_members (organization_id, user_id, role, is_default)
  values (v_org_id, v_user_id, 'admin_global', false)
  on conflict do nothing;

  insert into public.organization_subscriptions (
    organization_id,
    plan_code,
    plan_name,
    status,
    billing_cycle,
    trial_ends_at,
    renews_at,
    seats_included,
    seats_used,
    projects_included,
    projects_used,
    storage_gb_included,
    storage_gb_used
  )
  values (
    v_org_id,
    'team_trial',
    'Team Trial',
    'trial',
    'monthly',
    now() + interval '14 days',
    null,
    10,
    1,
    25,
    0,
    5,
    0
  )
  on conflict (organization_id) do nothing;

  return v_org_id;
end;
$$;

revoke all on function public.bootstrap_organization_workspace(text, text) from public;
grant execute on function public.bootstrap_organization_workspace(text, text) to authenticated;
