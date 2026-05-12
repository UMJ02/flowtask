alter table public.notification_preferences
  add column if not exists quiet_hours_enabled boolean not null default false,
  add column if not exists quiet_hours_start smallint not null default 22,
  add column if not exists quiet_hours_end smallint not null default 7;

alter table public.notification_preferences
  drop constraint if exists notification_preferences_quiet_hours_start_check,
  drop constraint if exists notification_preferences_quiet_hours_end_check;

alter table public.notification_preferences
  add constraint notification_preferences_quiet_hours_start_check check (quiet_hours_start between 0 and 23),
  add constraint notification_preferences_quiet_hours_end_check check (quiet_hours_end between 0 and 23);
