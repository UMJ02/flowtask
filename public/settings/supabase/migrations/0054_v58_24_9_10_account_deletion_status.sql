-- v58.24.9.10 — Account deletion request status

alter table public.profiles
  add column if not exists account_deletion_requested_at timestamptz,
  add column if not exists account_deletion_status text default 'active';

create index if not exists profiles_account_deletion_status_idx
on public.profiles (account_deletion_status, account_deletion_requested_at)
where account_deletion_requested_at is not null;
