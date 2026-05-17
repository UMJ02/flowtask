-- v58.27.3 — Project Views: support projects view type
-- Safe/idempotent constraint refresh for saved workspace views.

do $$
begin
  if to_regclass('public.project_views') is not null then
    alter table public.project_views drop constraint if exists project_views_view_type_check;
    alter table public.project_views
      add constraint project_views_view_type_check
      check (view_type in ('home','list','projects','board','timeline','table','canvas','files','reports'));
  end if;
end $$;
