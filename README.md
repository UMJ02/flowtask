# FlowTask — v58.24.8.4 Boards Create RLS Diagnostics + Workspace Scope Hardening

Base: **v58.24.8.3 — Boards Home Style Polish**

## Cambios clave

- Se mejora el flujo de creación de pizarras en `/app/boards`.
- `createBoard()` envía `public_can_edit: false` explícitamente.
- El insert ahora devuelve `id, owner_id, organization_id, visibility, public_can_edit` para diagnóstico.
- Los errores RLS/auth/workspace ahora muestran mensajes más precisos.
- En desarrollo se loguean detalles útiles de Supabase:
  - `code`
  - `message`
  - `details`
  - `hint`
  - `workspaceMode`
  - `workspaceKey`
  - `userId`
  - `activeOrganizationId`
- Se documenta el fix SQL validado para `visual_boards` RLS.
- Se mantiene intacto el editor `/app/boards/[boardId]`.
- No se tocan Storage ni Realtime.

## SQL importante

El fix SQL validado está documentado en:

- `docs/boards/FLOWTASK_BOARDS_RLS_WORKSPACE_SCOPE_HARDENING.md`
- `supabase/migrations/0050_v58_24_8_4_visual_boards_rls_workspace_scope.sql`

## Validación recomendada

```bash
npm install
npm run verify:v58.24.8.4
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```

## QA principal

- Crear pizarra en workspace personal.
- Crear pizarra en organización.
- Confirmar que personal y organización no mezclan datos.
- Confirmar que los mensajes de error ya no indican solo “migración” cuando el problema es RLS/sesión/workspace.
