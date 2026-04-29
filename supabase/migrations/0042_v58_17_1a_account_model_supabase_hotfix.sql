-- v58.17.1a — Account Model & Supabase Safe Hotfix
-- Safe to run more than once after v58.17 or after a failed/partial v58.17.1 attempt.
-- No destructive data changes. No plan commercial names are finalized here.

-- 1) Document the product contract in the database.
do $$
begin
  if to_regclass('public.organizations') is not null then
    comment on table public.organizations is
    'Flowtask organizations are collaborative workspaces created by individual users. They are not user accounts. The creator remains an individual user and becomes organization owner/admin.';
  end if;

  if to_regclass('public.organization_members') is not null then
    comment on table public.organization_members is
    'Memberships link individual users to organizations. Organizations never authenticate independently.';
  end if;

  if to_regclass('public.user_account_modes') is not null then
    comment on table public.user_account_modes is
    'Per-user account/workspace preference. The individual user is the primary identity; organization selection is an explicit workspace preference.';
  end if;
end $$;

-- 2) Remove only the duplicate experimental constraint created by previous failed hotfix attempts.
do $$
begin
  if to_regclass('public.organization_members') is not null then
    alter table public.organization_members
      drop constraint if exists organization_members_role_allowed_v58171;
  end if;
end $$;

-- 3) Avoid broken ON CONFLICT assumptions by ensuring a safe index only when possible.
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
      raise notice 'Skipped organization_subscriptions_org_unique because duplicate organization_id rows exist. No data was deleted.';
    end if;
  end if;
end $$;

-- 4) Repair owner/admin memberships safely.
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

-- 5) Trigger: creator/owner stays an individual user and becomes admin of the organization workspace.
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

-- 6) Bootstrap organization without fragile ON CONFLICT, while preserving v58.17 table names.
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
      organization_id, plan_code, plan_name, status, billing_cycle,
      trial_ends_at, renews_at, seats_included, seats_used,
      projects_included, projects_used, storage_gb_included, storage_gb_used
    ) values (
      v_org_id, 'starter', 'Starter', 'trial', 'monthly',
      now() + interval '14 days', null, 5, 1, 25, 0, 5, 0
    );
  end if;

  return v_org_id;
end;
$$;

revoke all on function public.bootstrap_organization_workspace(text, text) from public;
grant execute on function public.bootstrap_organization_workspace(text, text) to authenticated;

select public.repair_organization_owner_memberships();
