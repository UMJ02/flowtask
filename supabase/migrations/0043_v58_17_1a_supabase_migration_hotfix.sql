-- V58.17.1a Supabase Migration Hotfix
-- Safe recovery migration for environments where 0042 was already executed partially or fully.
-- Goals:
-- 1. Do not drop business data.
-- 2. Ensure owner/admin membership can be repaired safely.
-- 3. Ensure organization_subscriptions has a unique organization_id path before using ON CONFLICT.
-- 4. Replace bootstrap_organization_workspace with a defensive version that avoids fragile assumptions.
-- 5. Keep the account model: individual user is primary; organizations are workspaces, never users.

-- Documentation comments are safe and can run repeatedly.
do $$
begin
  if to_regclass('public.organizations') is not null then
    comment on table public.organizations is
    'Flowtask organizations are collaborative workspaces created by individual users. They are not user accounts. The creator is the owner/admin.';
  end if;

  if to_regclass('public.organization_members') is not null then
    comment on table public.organization_members is
    'Memberships link individual users to organizations with roles. Organizations never authenticate independently.';
  end if;

  if to_regclass('public.activation_codes') is not null then
    comment on table public.activation_codes is
    'Commercial activation codes. Plan labels are not final; use neutral internal plan_code values until pricing is approved.';
  end if;
end $$;

-- If 0042 added a redundant role constraint, remove it. The original schema already has
-- organization_members_role_check in normal v58.17 databases. Removing only the new
-- hotfix-era duplicate avoids future inserts failing because of a second constraint.
do $$
begin
  if to_regclass('public.organization_members') is not null then
    alter table public.organization_members
      drop constraint if exists organization_members_role_allowed_v58171;
  end if;
end $$;

-- Ensure uniqueness for one active subscription record per organization. This is required
-- by previous bootstrap versions that used ON CONFLICT (organization_id). The index is
-- created only after duplicates are detected/resolved manually, so this block is defensive.
do $$
declare
  v_duplicate_count integer := 0;
begin
  if to_regclass('public.organization_subscriptions') is not null then
    select count(*) into v_duplicate_count
    from (
      select organization_id
      from public.organization_subscriptions
      where organization_id is not null
      group by organization_id
      having count(*) > 1
    ) duplicates;

    if v_duplicate_count = 0 then
      create unique index if not exists organization_subscriptions_org_unique
        on public.organization_subscriptions (organization_id);
    else
      raise notice 'Skipped unique index organization_subscriptions_org_unique because duplicate organization_id rows exist. Resolve duplicates manually before enforcing uniqueness.';
    end if;
  end if;
end $$;

-- Safe repair function: creates missing owner memberships without assuming constraints beyond table existence.
create or replace function public.repair_organization_owner_memberships()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer := 0;
begin
  if to_regclass('public.organizations') is null or to_regclass('public.organization_members') is null then
    return 0;
  end if;

  insert into public.organization_members (organization_id, user_id, role, is_default)
  select o.id, o.owner_id, 'admin_global', false
  from public.organizations o
  where o.owner_id is not null
    and not exists (
      select 1
      from public.organization_members om
      where om.organization_id = o.id
        and om.user_id = o.owner_id
    );

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

grant execute on function public.repair_organization_owner_memberships() to authenticated;

-- Safe trigger function. It does not rely on ON CONFLICT and therefore works even if
-- the membership uniqueness index is absent in older/partial databases.
create or replace function public.ensure_organization_owner_membership()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.owner_id is not null
    and to_regclass('public.organization_members') is not null
    and not exists (
      select 1
      from public.organization_members om
      where om.organization_id = new.id
        and om.user_id = new.owner_id
    ) then
    insert into public.organization_members (organization_id, user_id, role, is_default)
    values (new.id, new.owner_id, 'admin_global', false);
  end if;

  return new;
end;
$$;

drop trigger if exists trg_ensure_organization_owner_membership on public.organizations;
create trigger trg_ensure_organization_owner_membership
after insert on public.organizations
for each row execute function public.ensure_organization_owner_membership();

-- Defensive bootstrap function.
-- Important: avoids ON CONFLICT (organization_id) so it can run even if 0042 failed before
-- the unique subscription index existed. It checks existence first and inserts only if missing.
create or replace function public.bootstrap_organization_workspace(p_name text, p_slug text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_org_id uuid;
  v_slug text := lower(btrim(coalesce(p_slug, '')));
  v_name text := btrim(coalesce(p_name, ''));
begin
  if v_user_id is null then
    raise exception 'Sesión no válida para crear la organización.';
  end if;

  if v_name = '' then
    raise exception 'El nombre de la organización es obligatorio.';
  end if;

  if v_slug = '' then
    raise exception 'El slug de la organización es obligatorio.';
  end if;

  if exists (select 1 from public.organizations where slug = v_slug and deleted_at is null) then
    raise exception 'Ya existe una organización activa con ese slug.';
  end if;

  insert into public.organizations (name, slug, owner_id)
  values (v_name, v_slug, v_user_id)
  returning id into v_org_id;

  if not exists (
    select 1 from public.organization_members
    where organization_id = v_org_id and user_id = v_user_id
  ) then
    insert into public.organization_members (organization_id, user_id, role, is_default)
    values (v_org_id, v_user_id, 'admin_global', false);
  end if;

  if to_regclass('public.organization_subscriptions') is not null
    and not exists (
      select 1 from public.organization_subscriptions
      where organization_id = v_org_id
    ) then
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
      'starter',
      'Starter',
      'trial',
      'monthly',
      now() + interval '14 days',
      null,
      5,
      1,
      25,
      0,
      5,
      0
    );
  end if;

  return v_org_id;
end;
$$;

revoke all on function public.bootstrap_organization_workspace(text, text) from public;
grant execute on function public.bootstrap_organization_workspace(text, text) to authenticated;

-- Run repair once after the safer function exists.
select public.repair_organization_owner_memberships();
