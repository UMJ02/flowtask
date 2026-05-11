# v58.24.8.4 — Boards Create RLS Diagnostics + Workspace Scope Hardening

**Base:** v58.24.8.3 — Boards Home Style Polish

## Objetivo

Endurecer el flujo de creación de pizarras después de validar que el problema real no era una migración faltante, sino una interacción entre RLS, `INSERT ... RETURNING`, sesión y workspace activo.

## Cambios incluidos

- El mensaje de creación ya no culpa únicamente a la migración de Boards.
- `createBoard()` envía `public_can_edit: false` explícitamente.
- `createBoard()` solicita `id, owner_id, organization_id, visibility, public_can_edit` para diagnosticar mejor el retorno de Supabase.
- Se agregan logs de desarrollo para errores RLS/auth/workspace.
- Se agrega clasificación de errores para:
  - sesión no activa
  - RLS/permisos `42501`
  - FK/workspace inválido `23503`
  - datos obligatorios faltantes `23502`
  - migración/tabla faltante
- Se conserva la separación:
  - Personal: `owner_id = user.id` y `organization_id = null`
  - Organización: `owner_id = user.id` y `organization_id = activeOrganizationId`
- No se tocan Storage, Realtime ni el editor `/app/boards/[boardId]`.

## SQL validado fuera del ZIP

La DB quedó corregida aplicando policies directas en `visual_boards` para evitar que la policy de SELECT dependa de una función que vuelve a leer la misma tabla. Esa corrección está documentada en:

- `docs/boards/FLOWTASK_BOARDS_RLS_WORKSPACE_SCOPE_HARDENING.md`

## Validación recomendada

```bash
npm install
npm run verify:v58.24.8.4
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```
