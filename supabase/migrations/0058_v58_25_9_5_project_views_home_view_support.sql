-- v58.25.9.5 — Workspace Project Home Dashboard
-- Allows the persisted project_views table to save the new Home/Resumen workspace view.
-- Safe to run after 0056; it does not recreate project_views and it is idempotent.

do $$
begin
  if to_regclass('public.project_views') is not null then
    alter table public.project_views
      drop constraint if exists project_views_view_type_check;

    alter table public.project_views
      add constraint project_views_view_type_check
      check (view_type in ('home','list','board','timeline','table','canvas','files','reports'));
  end if;
end $$;
