-- V58.0 · Organization bootstrap + role consistency + workspace guardrails

alter table public.clients
  alter column organization_id drop not null;

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

  update public.organization_members
  set is_default = false
  where user_id = v_user_id
    and is_default = true;

  insert into public.organization_members (organization_id, user_id, role, is_default)
  values (v_org_id, v_user_id, 'admin_global', true);

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
    'growth',
    'Growth',
    'active',
    'annual',
    now() + interval '14 days',
    now() + interval '1 year',
    20,
    1,
    120,
    0,
    50,
    0
  )
  on conflict (organization_id) do nothing;

  return v_org_id;
end;
$$;

revoke all on function public.bootstrap_organization_workspace(text, text) from public;
grant execute on function public.bootstrap_organization_workspace(text, text) to authenticated;
