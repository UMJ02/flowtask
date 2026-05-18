# v58.28.17.1 — Unified Data QA Inline Status Type Hotfix

Hotfix sobre v58.28.17 para corregir el error de TypeScript en `workspace-task-inline-actions.tsx`.

## Corrección

- `event.target.value` llega como `string` desde el `<select>`.
- El estado local espera `TaskStatus`.
- Se agregó `isTaskStatus(...)` antes de llamar `setStatus(...)`.
- Se tipó `normalizeStatus(...)` como `TaskStatus`.
- Se mantuvo intacta la sincronización Clásico + Pro de v58.28.17.

## Validación

- `npm run verify:current`
- `npm run workspace:unified-data-qa:ready`
- `npm run workspace:task-sync:ready`
- `npm run typecheck`
