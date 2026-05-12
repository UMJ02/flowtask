alter table public.notifications
  add column if not exists deleted_at timestamptz;

create index if not exists notifications_user_active_idx
  on public.notifications (user_id, created_at desc)
  where deleted_at is null;

create index if not exists notifications_user_unread_active_idx
  on public.notifications (user_id, is_read)
  where deleted_at is null;

do $$
begin
  if not exists (select 1 from storage.buckets where id = 'profile-avatars') then
    insert into storage.buckets (id, name, public)
    values ('profile-avatars', 'profile-avatars', true);
  end if;
exception when undefined_table then
  null;
end $$;

do $$ begin
  create policy "profile_avatars_select_authenticated"
  on storage.objects for select to authenticated
  using (bucket_id = 'profile-avatars');
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "profile_avatars_insert_owner"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'profile-avatars' and owner = auth.uid());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "profile_avatars_update_owner"
  on storage.objects for update to authenticated
  using (bucket_id = 'profile-avatars' and owner = auth.uid())
  with check (bucket_id = 'profile-avatars' and owner = auth.uid());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "profile_avatars_delete_owner"
  on storage.objects for delete to authenticated
  using (bucket_id = 'profile-avatars' and owner = auth.uid());
exception when duplicate_object then null; end $$;
