# v58.25.9.7 — Workspace Empty States + Client QA Hardening

## Objetivo
Cerrar la experiencia Workspace-First con estados vacíos profesionales y señales de QA visual antes de avanzar al Command Center.

## Cambios principales
- Nuevo `WorkspaceEmptyState` reutilizable para vistas del workspace.
- Nuevo `WorkspacePermissionEmptyState` para acciones bloqueadas por permisos.
- Nuevo `WorkspaceMigrationEmptyState` para persistencia parcial, bloqueada o sin migraciones.
- Nuevo `WorkspaceHealthPanel` para validar visualmente Persistence, Spaces, Saved views, Assignments, Permissions y Data.
- `/app/workspace` ahora muestra aviso profesional cuando la persistencia está en modo fallback o cuando no hay proyectos visibles.
- Board, Table, Timeline, Files, Canvas, Reports y Right Panel tienen estados vacíos con acción clara.
- Right Panel ahora incluye bloque Client QA / Workspace Health.
- CSS nuevo para empty states, health panel, pills y filas de estado.

## Sin cambios de BD
No agrega migraciones. Usa lo existente:
- `0056_v58_25_9_workspace_persistence_foundation.sql`
- `0057_v58_25_9_4_workspace_space_project_assignments.sql`
- `0058_v58_25_9_5_project_views_home_view_support.sql`

## Archivos clave
- `src/components/workspace-system/workspace-empty-state.tsx`
- `src/components/workspace-system/workspace-system-page.tsx`
- `src/components/workspace-system/workspace-right-panel.tsx`
- `src/components/workspace-system/views/board-view.tsx`
- `src/components/workspace-system/views/table-view.tsx`
- `src/components/workspace-system/views/timeline-view.tsx`
- `src/components/workspace-system/views/files-view.tsx`
- `src/components/workspace-system/views/canvas-view.tsx`
- `src/components/workspace-system/views/reports-view.tsx`
- `src/app/globals.css`
- `scripts/verify-v58.25.9.7.mjs`

## Validación recomendada
```bash
npm run workspace:doctor
npm run verify:current
npm run typecheck
npm run build:preflight
npm run build
```
