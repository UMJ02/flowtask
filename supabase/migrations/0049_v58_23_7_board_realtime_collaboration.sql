-- v58.23.7 — Board Realtime Collaboration
-- Enables Supabase Realtime publication for visual boards, elements, comments, activity and collaborators.
-- Safe to run multiple times: duplicate publication additions are ignored.

alter table if exists public.visual_boards replica identity full;
alter table if exists public.visual_board_elements replica identity full;
alter table if exists public.visual_board_comments replica identity full;
alter table if exists public.visual_board_activity replica identity full;
alter table if exists public.visual_board_collaborators replica identity full;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      alter publication supabase_realtime add table public.visual_boards;
    exception when duplicate_object then null;
    end;

    begin
      alter publication supabase_realtime add table public.visual_board_elements;
    exception when duplicate_object then null;
    end;

    begin
      alter publication supabase_realtime add table public.visual_board_comments;
    exception when duplicate_object then null;
    end;

    begin
      alter publication supabase_realtime add table public.visual_board_activity;
    exception when duplicate_object then null;
    end;

    begin
      alter publication supabase_realtime add table public.visual_board_collaborators;
    exception when duplicate_object then null;
    end;
  end if;
end $$;
