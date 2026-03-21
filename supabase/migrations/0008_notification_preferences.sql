create table if not exists public.notification_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  enable_task boolean not null default true,
  enable_project boolean not null default true,
  enable_comment boolean not null default true,
  enable_reminder boolean not null default true,
  enable_toasts boolean not null default true,
  enable_email boolean not null default false,
  enable_whatsapp boolean not null default false,
  delivery_frequency text not null default 'immediate',
  daily_digest_hour smallint not null default 8,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint notification_preferences_delivery_frequency_check check (delivery_frequency in ('immediate', 'daily')),
  constraint notification_preferences_daily_digest_hour_check check (daily_digest_hour between 0 and 23)
);

alter table public.notification_preferences enable row level security;

create policy if not exists "notification_preferences_select_own"
on public.notification_preferences
for select
to authenticated
using (user_id = auth.uid());

create policy if not exists "notification_preferences_insert_own"
on public.notification_preferences
for insert
to authenticated
with check (user_id = auth.uid());

create policy if not exists "notification_preferences_update_own"
on public.notification_preferences
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create or replace function public.set_notification_preferences_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_notification_preferences_updated_at on public.notification_preferences;
create trigger trg_notification_preferences_updated_at
before update on public.notification_preferences
for each row execute function public.set_notification_preferences_updated_at();
