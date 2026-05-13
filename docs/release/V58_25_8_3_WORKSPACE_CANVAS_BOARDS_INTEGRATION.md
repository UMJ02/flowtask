# v58.25.8.3 — Workspace Canvas/Boards Integration

## Objetivo
Conectar la vista Canvas del nuevo Workspace System con datos reales de `visual_boards`, sin duplicar el módulo de Pizarras ni tocar migraciones.

## Cambios principales
- Se agrega `WorkspaceBoardSummary` al modelo del Workspace System.
- Se agrega `getWorkspaceBoards()` para leer pizarras reales desde Supabase con scope de workspace.
- `/app/workspace` ahora carga pizarras reales junto con tasks, projects y reports.
- `WorkspaceSystemPage` pasa `boards` a Canvas y Files.
- `CanvasView` muestra pizarras reales del workspace/proyecto y enlaza al `BoardPage` existente usando `/app/boards/[id]`.
- `FilesView` muestra pizarras reales como primer paso de integración de archivos/pizarras.
- Se agrega `boardRoute()` y `workspaceCanvasRoute()` en navegación.

## Reglas respetadas
- No se crean tablas nuevas.
- No se agregan migraciones.
- No se reemplaza `BoardPage`.
- No se duplica lógica de pizarras.
- No se toca `safe_delete_visual_board`.
- No se rompen `/app/tasks`, `/app/projects`, `/app/boards` ni `/app/reports`.

## Validación esperada
```bash
npm run verify:current
npm run typecheck
npm run build:preflight
npm run build
```
