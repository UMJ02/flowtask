create extension if not exists pgcrypto;

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text,
  kind text not null default 'info',
  entity_type text,
  entity_id uuid,
  is_read boolean not null default false,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists notifications_user_created_idx
  on public.notifications (user_id, created_at desc);
create index if not exists notifications_user_unread_idx
  on public.notifications (user_id, is_read);
create index if not exists activity_logs_entity_idx
  on public.activity_logs (entity_type, entity_id, created_at desc);

alter table public.notifications enable row level security;

DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
create policy "notifications_select_own"
on public.notifications
for select
to authenticated
using (user_id = auth.uid());

DROP POLICY IF EXISTS "notifications_insert_own" ON public.notifications;
create policy "notifications_insert_own"
on public.notifications
for insert
to authenticated
with check (user_id = auth.uid());

DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
create policy "notifications_update_own"
on public.notifications
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create or replace function public.set_notification_read_at()
returns trigger
language plpgsql
as $$
begin
  if new.is_read = true and coalesce(old.is_read, false) = false then
    new.read_at = now();
  elsif new.is_read = false then
    new.read_at = null;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_notifications_read_at on public.notifications;
create trigger trg_notifications_read_at
before update on public.notifications
for each row execute function public.set_notification_read_at();
