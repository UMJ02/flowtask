# QA — v58.25.8.3 Workspace Canvas/Boards Integration

## Checklist funcional
- `/app/workspace?view=canvas` carga sin romper el shell.
- Canvas muestra conteo de tareas conectadas.
- Canvas muestra conteo de pizarras reales.
- Las cards de pizarra abren `/app/boards/[id]`.
- Con `projectId`, Canvas prioriza pizarras del proyecto activo.
- Si no existen pizarras, aparece estado vacío profesional.
- Files muestra tarjetas de pizarras como integración inicial.
- No se crean ni leen `workspace_spaces` ni `project_views`.
- El módulo `/app/boards` sigue siendo el editor completo de pizarras.

## Checklist técnico
- `WorkspaceBoardSummary` existe en `view-state.ts`.
- `getWorkspaceBoards()` lee `visual_boards` con scope de workspace.
- `WorkspaceSystemPage` recibe `boards`.
- `CanvasView` no importa `BoardPage`; solo enlaza al módulo existente.
- `verify:current` apunta a `verify:v58.25.8.3`.
