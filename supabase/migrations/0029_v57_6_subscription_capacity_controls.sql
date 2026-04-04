create or replace function public.sync_organization_subscription_usage(p_organization_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.organization_subscriptions
  set
    seats_used = (
      select count(*)::integer
      from public.organization_members om
      where om.organization_id = p_organization_id
    ),
    projects_used = (
      select count(*)::integer
      from public.projects p
      where p.organization_id = p_organization_id
    ),
    updated_at = now()
  where organization_id = p_organization_id;
end;
$$;

create or replace function public.get_organization_seat_limit(p_organization_id uuid)
returns integer
language sql
stable
set search_path = public
as $$
  select os.seats_included
  from public.organization_subscriptions os
  where os.organization_id = p_organization_id
  order by os.created_at desc
  limit 1;
$$;

create or replace function public.get_organization_project_limit(p_organization_id uuid)
returns integer
language sql
stable
set search_path = public
as $$
  select os.projects_included
  from public.organization_subscriptions os
  where os.organization_id = p_organization_id
  order by os.created_at desc
  limit 1;
$$;

create or replace function public.enforce_organization_member_capacity()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_org_id uuid;
  v_limit integer;
  v_members integer;
begin
  v_org_id := coalesce(new.organization_id, old.organization_id);
  if v_org_id is null then
    return coalesce(new, old);
  end if;

  if tg_op = 'UPDATE' and new.organization_id is not distinct from old.organization_id then
    return new;
  end if;

  v_limit := public.get_organization_seat_limit(v_org_id);
  if v_limit is null or v_limit >= 9999 then
    return coalesce(new, old);
  end if;

  select count(*)::integer into v_members
  from public.organization_members om
  where om.organization_id = v_org_id
    and (tg_op <> 'UPDATE' or om.id <> old.id);

  if v_members >= v_limit then
    raise exception 'Plan limit reached: this workspace has no seats available.'
      using errcode = 'P0001',
            hint = 'Upgrade the plan or remove an inactive member before adding someone new.';
  end if;

  return coalesce(new, old);
end;
$$;

create or replace function public.enforce_organization_invite_capacity()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_org_id uuid;
  v_limit integer;
  v_members integer;
  v_pending integer;
begin
  if coalesce(new.status, 'pending') <> 'pending' then
    return new;
  end if;

  v_org_id := new.organization_id;
  v_limit := public.get_organization_seat_limit(v_org_id);

  if v_limit is null or v_limit >= 9999 then
    return new;
  end if;

  select count(*)::integer into v_members
  from public.organization_members om
  where om.organization_id = v_org_id;

  select count(*)::integer into v_pending
  from public.organization_invites oi
  where oi.organization_id = v_org_id
    and oi.status = 'pending'
    and (tg_op <> 'UPDATE' or oi.id <> old.id);

  if v_members + v_pending >= v_limit then
    raise exception 'Plan limit reached: pending invites already consume the available seats.'
      using errcode = 'P0001',
            hint = 'Revoke a pending invite or upgrade the plan before sending another one.';
  end if;

  return new;
end;
$$;

create or replace function public.enforce_organization_project_capacity()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_org_id uuid;
  v_limit integer;
  v_projects integer;
begin
  v_org_id := coalesce(new.organization_id, old.organization_id);
  if v_org_id is null then
    return coalesce(new, old);
  end if;

  if tg_op = 'UPDATE' and new.organization_id is not distinct from old.organization_id then
    return new;
  end if;

  v_limit := public.get_organization_project_limit(v_org_id);
  if v_limit is null or v_limit >= 9999 then
    return coalesce(new, old);
  end if;

  select count(*)::integer into v_projects
  from public.projects p
  where p.organization_id = v_org_id
    and (tg_op <> 'UPDATE' or p.id <> old.id);

  if v_projects >= v_limit then
    raise exception 'Plan limit reached: this workspace cannot create more projects.'
      using errcode = 'P0001',
            hint = 'Archive old projects or upgrade the current plan.';
  end if;

  return coalesce(new, old);
end;
$$;

create or replace function public.sync_subscription_usage_after_member_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.sync_organization_subscription_usage(coalesce(new.organization_id, old.organization_id));
  if tg_op = 'UPDATE' and new.organization_id is distinct from old.organization_id then
    perform public.sync_organization_subscription_usage(old.organization_id);
  end if;
  return coalesce(new, old);
end;
$$;

create or replace function public.sync_subscription_usage_after_project_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.sync_organization_subscription_usage(coalesce(new.organization_id, old.organization_id));
  if tg_op = 'UPDATE' and new.organization_id is distinct from old.organization_id then
    perform public.sync_organization_subscription_usage(old.organization_id);
  end if;
  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_organization_members_capacity on public.organization_members;
create trigger trg_organization_members_capacity
before insert or update of organization_id on public.organization_members
for each row execute function public.enforce_organization_member_capacity();

drop trigger if exists trg_organization_invites_capacity on public.organization_invites;
create trigger trg_organization_invites_capacity
before insert or update of status, organization_id on public.organization_invites
for each row execute function public.enforce_organization_invite_capacity();

drop trigger if exists trg_projects_capacity on public.projects;
create trigger trg_projects_capacity
before insert or update of organization_id on public.projects
for each row execute function public.enforce_organization_project_capacity();

drop trigger if exists trg_organization_members_sync_subscription_usage on public.organization_members;
create trigger trg_organization_members_sync_subscription_usage
after insert or update or delete on public.organization_members
for each row execute function public.sync_subscription_usage_after_member_change();

drop trigger if exists trg_projects_sync_subscription_usage on public.projects;
create trigger trg_projects_sync_subscription_usage
after insert or update or delete on public.projects
for each row execute function public.sync_subscription_usage_after_project_change();

with impacted_orgs as (
  select organization_id from public.organization_subscriptions
)
select public.sync_organization_subscription_usage(organization_id)
from impacted_orgs;
