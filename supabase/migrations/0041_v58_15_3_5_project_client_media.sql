-- v58.15.3.5 - Project images and client avatars
-- Safe, additive migration. Run before deploying the app version that reads these columns.

alter table public.projects
  add column if not exists image_url text;

alter table public.clients
  add column if not exists avatar_url text;

create index if not exists projects_image_url_idx on public.projects (image_url) where image_url is not null;
create index if not exists clients_avatar_url_idx on public.clients (avatar_url) where avatar_url is not null;
