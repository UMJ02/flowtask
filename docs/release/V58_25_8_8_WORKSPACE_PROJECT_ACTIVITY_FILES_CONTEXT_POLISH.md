# v58.25.8.8 — Workspace Project Activity + Files Context Polish

## Objetivo

Endurecer el Workspace System para que el panel contextual y la vista Archivos de `/app/workspace` usen datos reales de actividad y adjuntos, manteniendo la arquitectura Workspace-First sin migraciones nuevas.

## Base

- Base: v58.25.8.7 — Workspace Views Real Interaction Polish.
- Ruta principal: `/app/workspace`.
- No reemplaza `/app/tasks`, `/app/projects`, `/app/boards` ni `/app/reports`.

## Cambios incluidos

- Nuevos tipos `WorkspaceActivityItem` y `WorkspaceFileSummary`.
- Nuevas queries server-safe en `src/lib/workspace-system/server-data.ts`:
  - `getWorkspaceActivity()`
  - `getWorkspaceFiles()`
- `/app/workspace` carga actividad y archivos reales del contexto activo.
- `WorkspaceRightPanel` muestra:
  - Actividad del proyecto/workspace.
  - Archivos recientes.
  - Métricas de archivos visibles.
  - Señal IA basada también en archivos/actividad.
- `FilesView` evoluciona de pizarras-only a centro de archivos:
  - Adjuntos recientes.
  - Conteos por adjuntos, imágenes, documentos y pizarras.
  - Pizarras conectadas.
- CSS nuevo para actividad y archivos:
  - `ft-ws-activity-item`
  - `ft-ws-file-mini-card`
  - `ft-ws-file-card`
  - `ft-ws-file-context-stat`

## Reglas respetadas

- Sin migraciones nuevas.
- Sin tablas `workspace_spaces` ni `project_views`.
- Sin dependencias nuevas.
- Sin duplicar BoardPage.
- Sin tocar `safe_delete_visual_board`.
- Sin romper rutas actuales.

## Archivos clave

- `src/app/(app)/app/workspace/page.tsx`
- `src/lib/workspace-system/view-state.ts`
- `src/lib/workspace-system/server-data.ts`
- `src/components/workspace-system/workspace-system-page.tsx`
- `src/components/workspace-system/workspace-right-panel.tsx`
- `src/components/workspace-system/views/files-view.tsx`
- `src/app/globals.css`
- `scripts/verify-v58.25.8.8.mjs`

## Validación recomendada

```bash
npm run verify:current
npm run typecheck
npm run build:preflight
npm run build
```
