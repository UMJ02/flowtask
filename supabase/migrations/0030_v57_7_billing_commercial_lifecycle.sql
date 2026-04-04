alter table public.organization_subscriptions
  add column if not exists activation_code_id uuid references public.activation_codes(id) on delete set null,
  add column if not exists auto_renew boolean not null default true,
  add column if not exists expires_at timestamptz,
  add column if not exists last_renewed_at timestamptz,
  add column if not exists renewal_grace_ends_at timestamptz,
  add column if not exists soft_locked boolean not null default false,
  add column if not exists soft_locked_at timestamptz,
  add column if not exists soft_lock_reason text,
  add column if not exists scheduled_plan_code text,
  add column if not exists scheduled_plan_name text,
  add column if not exists scheduled_change_at timestamptz;

create index if not exists organization_subscriptions_activation_code_idx
  on public.organization_subscriptions (activation_code_id);

create or replace function public.sync_organization_subscription_lifecycle(p_organization_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  subscription_row public.organization_subscriptions%rowtype;
  next_status text;
  next_soft_locked boolean;
  next_soft_locked_at timestamptz;
  next_soft_lock_reason text;
begin
  select *
  into subscription_row
  from public.organization_subscriptions
  where organization_id = p_organization_id
  order by created_at desc
  limit 1;

  if not found then
    return;
  end if;

  next_status := subscription_row.status;
  next_soft_locked := false;
  next_soft_locked_at := null;
  next_soft_lock_reason := null;

  if subscription_row.status = 'canceled' then
    next_soft_locked := true;
    next_soft_locked_at := coalesce(subscription_row.soft_locked_at, now());
    next_soft_lock_reason := coalesce(subscription_row.soft_lock_reason, 'Suscripción cancelada.');
  elsif subscription_row.expires_at is not null and subscription_row.expires_at <= now() then
    next_soft_locked := true;
    next_soft_locked_at := coalesce(subscription_row.soft_locked_at, now());
    next_soft_lock_reason := coalesce(subscription_row.soft_lock_reason, 'La vigencia del plan venció.');
    if subscription_row.status = 'active' then
      next_status := 'past_due';
    end if;
  elsif subscription_row.renews_at is not null and subscription_row.renews_at <= now() and coalesce(subscription_row.auto_renew, true) = false then
    next_soft_locked := true;
    next_soft_locked_at := coalesce(subscription_row.soft_locked_at, now());
    next_soft_lock_reason := 'La renovación automática está desactivada y el plan venció.';
    if subscription_row.status = 'active' then
      next_status := 'past_due';
    end if;
  elsif subscription_row.status in ('active','trial') then
    next_soft_locked := false;
    next_soft_locked_at := null;
    next_soft_lock_reason := null;
  end if;

  update public.organization_subscriptions
  set
    status = next_status,
    soft_locked = next_soft_locked,
    soft_locked_at = next_soft_locked_at,
    soft_lock_reason = next_soft_lock_reason,
    updated_at = now()
  where id = subscription_row.id;
end;
$$;

create or replace function public.trg_sync_organization_subscription_lifecycle()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.sync_organization_subscription_lifecycle(coalesce(new.organization_id, old.organization_id));
  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_organization_subscription_lifecycle on public.organization_subscriptions;
create trigger trg_organization_subscription_lifecycle
after insert or update on public.organization_subscriptions
for each row execute function public.trg_sync_organization_subscription_lifecycle();

with impacted_orgs as (
  select organization_id from public.organization_subscriptions
)
select public.sync_organization_subscription_lifecycle(organization_id)
from impacted_orgs;
