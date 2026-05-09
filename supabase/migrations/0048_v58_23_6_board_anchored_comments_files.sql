-- v58.23.6 — Board Anchored Comments + Files
-- Enables image/file board elements, anchored canvas comments and a storage bucket for board uploads.

do $$
declare
  constraint_name text;
begin
  select conname into constraint_name
  from pg_constraint
  where conrelid = 'public.visual_board_elements'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) ilike '%type%';

  if constraint_name is not null then
    execute format('alter table public.visual_board_elements drop constraint %I', constraint_name);
  end if;
end $$;

alter table public.visual_board_elements
add constraint visual_board_elements_type_check
check (type in ('sticky','text','shape','connector','table','image','file'));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'visual-board-files',
  'visual-board-files',
  true,
  10485760,
  array[
    'image/png','image/jpeg','image/webp','image/gif','image/svg+xml',
    'application/pdf','text/plain','text/csv',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists visual_board_files_select_public on storage.objects;
create policy visual_board_files_select_public
on storage.objects for select
using (bucket_id = 'visual-board-files');

drop policy if exists visual_board_files_insert_authenticated on storage.objects;
create policy visual_board_files_insert_authenticated
on storage.objects for insert
with check (bucket_id = 'visual-board-files' and auth.uid() is not null);

drop policy if exists visual_board_files_update_authenticated on storage.objects;
create policy visual_board_files_update_authenticated
on storage.objects for update
using (bucket_id = 'visual-board-files' and auth.uid() is not null)
with check (bucket_id = 'visual-board-files' and auth.uid() is not null);

drop policy if exists visual_board_files_delete_authenticated on storage.objects;
create policy visual_board_files_delete_authenticated
on storage.objects for delete
using (bucket_id = 'visual-board-files' and auth.uid() is not null);

create index if not exists visual_board_comments_anchor_idx
on public.visual_board_comments(board_id, element_id)
where resolved = false;
