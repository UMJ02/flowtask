# FlowTask Boards — RLS Workspace Scope Hardening

## Contexto

El error original fue:

```txt
No pudimos crear la pizarra. Confirma que la migración de Boards esté aplicada.
403 /rest/v1/visual_boards?select=id
```

La tabla, columnas, grants, defaults, perfil de usuario y `auth.uid()` estaban correctos. El problema real estaba en la policy de `SELECT` de `visual_boards`, que usaba `visual_board_can_view(id)`. Esa función vuelve a consultar `visual_boards`, lo que es riesgoso para la tabla principal durante `insert().select()` / `INSERT ... RETURNING`.

## Modelo correcto

### Workspace personal

```txt
owner_id = auth.uid()
organization_id = null
```

### Workspace organización

```txt
owner_id = auth.uid()
organization_id = organization_members.organization_id
y el usuario debe existir en organization_members
```

## Script SQL recomendado

```sql
drop policy if exists visual_boards_select_access on public.visual_boards;
drop policy if exists visual_boards_update_access on public.visual_boards;
drop policy if exists visual_boards_insert_owner on public.visual_boards;

create policy visual_boards_select_access
on public.visual_boards
for select
to public
using (
  deleted_at is null
  and (
    owner_id = auth.uid()
    or visibility = 'public_link'
    or exists (
      select 1
      from public.organization_members om
      where om.organization_id = visual_boards.organization_id
        and om.user_id = auth.uid()
    )
    or public.visual_board_collaborator_role(id) in ('viewer', 'editor', 'admin')
  )
);

create policy visual_boards_insert_owner
on public.visual_boards
for insert
to authenticated
with check (
  owner_id = auth.uid()
  and (
    organization_id is null
    or exists (
      select 1
      from public.organization_members om
      where om.organization_id = visual_boards.organization_id
        and om.user_id = auth.uid()
    )
  )
);

create policy visual_boards_update_access
on public.visual_boards
for update
to public
using (
  deleted_at is null
  and (
    owner_id = auth.uid()
    or exists (
      select 1
      from public.organization_members om
      where om.organization_id = visual_boards.organization_id
        and om.user_id = auth.uid()
    )
    or public.visual_board_collaborator_role(id) in ('editor', 'admin')
    or (
      visibility = 'public_link'
      and public_can_edit = true
    )
  )
)
with check (
  deleted_at is null
  and (
    owner_id = auth.uid()
    or exists (
      select 1
      from public.organization_members om
      where om.organization_id = visual_boards.organization_id
        and om.user_id = auth.uid()
    )
    or public.visual_board_collaborator_role(id) in ('editor', 'admin')
    or (
      visibility = 'public_link'
      and public_can_edit = true
    )
  )
);
```

## Tests validados

### Personal

```txt
owner_id = user.id
organization_id = null
visibility = private
public_can_edit = false
```

### Organización

```txt
owner_id = user.id
organization_id = organization_members.organization_id
visibility = private
public_can_edit = false
```

Ambos casos pasaron con `INSERT ... RETURNING`.
