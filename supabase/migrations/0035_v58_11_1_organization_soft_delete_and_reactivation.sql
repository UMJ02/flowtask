alter table public.organizations
  add column if not exists deleted_at timestamptz,
  add column if not exists purge_scheduled_at timestamptz;

create index if not exists organizations_deleted_at_idx
  on public.organizations (deleted_at, purge_scheduled_at);
