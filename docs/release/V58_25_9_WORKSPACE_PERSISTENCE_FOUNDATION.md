# v58.25.9 — Workspace Persistence Foundation

## Objetivo

Agregar la base de persistencia para que el Workspace System pueda guardar espacios y vistas por proyecto sin reemplazar la experiencia Workspace-First ya creada.

## Incluye

- Migración `0056_v58_25_9_workspace_persistence_foundation.sql`.
- Nueva tabla opcional `workspace_spaces`.
- Nueva tabla opcional `project_views`.
- RLS para modo personal y organización.
- Helpers server-safe `getWorkspacePersistedSpaces()` y `getWorkspaceProjectViews()`.
- `/app/workspace` usa espacios persistidos cuando existen y mantiene espacios generados como fallback.
- Tabs superiores muestran indicador de vista persistida cuando `project_views` tiene configuración para el proyecto activo.
- Panel derecho muestra bloque de Persistencia Workspace.

## No incluye

- No reemplaza `/app/tasks`, `/app/projects`, `/app/boards` ni `/app/reports`.
- No duplica BoardPage.
- No toca `safe_delete_visual_board`.
- No obliga a usar nuevas tablas: si están vacías o no aplicadas, la UI sigue funcionando con adapters.

## Validación

```bash
npm run verify:current
npm run typecheck
npm run build:preflight
npm run build
```
