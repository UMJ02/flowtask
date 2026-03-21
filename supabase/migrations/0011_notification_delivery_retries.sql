alter table if exists public.notification_deliveries
  add column if not exists attempt_number integer not null default 1,
  add column if not exists retry_after timestamptz,
  add column if not exists retry_group text;

create index if not exists notification_deliveries_status_idx
  on public.notification_deliveries (user_id, status, attempted_at desc);

create index if not exists notification_deliveries_retry_after_idx
  on public.notification_deliveries (status, retry_after);
