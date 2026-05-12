# QA — v58.24.8.4 Boards Create RLS Diagnostics + Workspace Scope Hardening

## Objetivo

Confirmar que la creación de pizarras funciona tanto en workspace personal como en organización, y que los mensajes de error ya no son confusos cuando falla Supabase/RLS.

## QA funcional

1. Entrar a `/app/boards` con usuario autenticado.
2. En workspace personal, crear una pizarra en blanco.
3. Confirmar que abre `/app/boards/[boardId]`.
4. Confirmar en Supabase:
   - `owner_id = user.id`
   - `organization_id is null`
   - `visibility = private`
   - `public_can_edit = false`
5. Cambiar a organización.
6. Crear una pizarra.
7. Confirmar en Supabase:
   - `owner_id = user.id`
   - `organization_id = organización activa`
   - `public_can_edit = false`
8. Confirmar que la vista personal no mezcla pizarras de organización.
9. Confirmar que la organización no mezcla pizarras personales.

## QA de diagnóstico

En desarrollo, si falla un insert, la consola debe mostrar:

- `code`
- `message`
- `details`
- `hint`
- `workspaceMode`
- `workspaceKey`
- `userId`
- `activeOrganizationId`
- `payload`

## Rutas a revisar

- `/app/boards`
- `/app/boards/[boardId]`
- `/share/boards/[token]`
