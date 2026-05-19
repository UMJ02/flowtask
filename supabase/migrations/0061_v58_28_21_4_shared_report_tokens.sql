create table if not exists public.shared_reports (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  owner_id uuid not null references auth.users(id) on delete cascade,
  workspace_name text not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked_at timestamptz
);

create index if not exists shared_reports_token_idx on public.shared_reports(token);
create index if not exists shared_reports_owner_created_idx on public.shared_reports(owner_id, created_at desc);

alter table public.shared_reports enable row level security;

drop policy if exists shared_reports_public_select_active on public.shared_reports;
create policy shared_reports_public_select_active
on public.shared_reports
for select
to public
using (
  revoked_at is null
  and (expires_at is null or expires_at > now())
);

drop policy if exists shared_reports_insert_owner on public.shared_reports;
create policy shared_reports_insert_owner
on public.shared_reports
for insert
to authenticated
with check (owner_id = auth.uid());

drop policy if exists shared_reports_update_owner on public.shared_reports;
create policy shared_reports_update_owner
on public.shared_reports
for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists shared_reports_delete_owner on public.shared_reports;
create policy shared_reports_delete_owner
on public.shared_reports
for delete
to authenticated
using (owner_id = auth.uid());
