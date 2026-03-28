-- Permite al owner del proyecto actualizar el rol de sus miembros.
create policy "project_members_update_project_owner"
on public.project_members
for update
to authenticated
using (
  exists (
    select 1
    from public.projects p
    where p.id = project_members.project_id
      and p.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.projects p
    where p.id = project_members.project_id
      and p.owner_id = auth.uid()
  )
  and role in ('owner', 'editor', 'viewer')
);
