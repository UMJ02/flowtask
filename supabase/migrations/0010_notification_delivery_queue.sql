create extension if not exists pgcrypto;

create table if not exists public.notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  notification_id uuid not null references public.notifications(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  channel text not null,
  status text not null default 'queued',
  error_message text,
  provider_response jsonb not null default '{}'::jsonb,
  attempted_at timestamptz not null default now(),
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  constraint notification_deliveries_channel_check check (channel in ('email', 'whatsapp')),
  constraint notification_deliveries_status_check check (status in ('queued', 'sent', 'skipped', 'failed'))
);

create index if not exists notification_deliveries_notification_idx
  on public.notification_deliveries (notification_id, created_at desc);
create index if not exists notification_deliveries_user_idx
  on public.notification_deliveries (user_id, created_at desc);

create table if not exists public.daily_notification_digests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  digest_date date not null,
  delivery_frequency text not null default 'daily',
  status text not null default 'queued',
  total_notifications integer not null default 0,
  summary_title text not null,
  summary_body text,
  created_at timestamptz not null default now(),
  processed_at timestamptz,
  unique (user_id, digest_date),
  constraint daily_notification_digests_status_check check (status in ('queued', 'sent', 'skipped', 'failed')),
  constraint daily_notification_digests_delivery_frequency_check check (delivery_frequency in ('daily'))
);

create index if not exists daily_notification_digests_user_idx
  on public.daily_notification_digests (user_id, digest_date desc);

alter table public.notification_deliveries enable row level security;
alter table public.daily_notification_digests enable row level security;

drop policy if exists "notification_deliveries_select_own" on public.notification_deliveries;
create policy "notification_deliveries_select_own"
on public.notification_deliveries
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "daily_notification_digests_select_own" on public.daily_notification_digests;
create policy "daily_notification_digests_select_own"
on public.daily_notification_digests
for select
to authenticated
using (user_id = auth.uid());
