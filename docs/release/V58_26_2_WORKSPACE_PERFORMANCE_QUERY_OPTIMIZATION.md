# v58.26.2 — Workspace Performance + Query Optimization

## Objetivo

Optimizar `/app/workspace` después del cierre de producción v58.26.0/v58.26.1 para que la experiencia Workspace-First no cargue recursos pesados cuando la vista activa no los necesita.

## Cambios principales

- Nueva capa `src/lib/workspace-system/performance.ts`.
- Nuevo `buildWorkspaceLoadPlan()` para decidir datos secundarios por view.
- Nuevos límites centralizados `WORKSPACE_QUERY_LIMITS`.
- `/app/workspace` deja de cargar siempre reportes, pizarras, archivos y actividad en el primer bloque de datos.
- Reportes se cargan solo para `home` y `reports`.
- Pizarras se cargan para `home`, `canvas` y `files`.
- Archivos se cargan para `home` y `files`.
- Actividad se carga para `home` y `files`.
- `getWorkspaceBoards()` ahora recibe `projectId` para reducir datos cuando existe proyecto activo.
- `server-data.ts` usa límites centralizados para boards, files, activity y assignments.
- Nuevo script `workspace:performance:ready`.
- `build:preflight` incluye `workspace:performance:ready`.

## Sin cambios de BD

No agrega migraciones. No cambia RLS. No toca `safe_delete_visual_board`.

## Validación esperada

```bash
npm run workspace:performance:ready
npm run verify:current
npm run typecheck
npm run build:preflight
```
