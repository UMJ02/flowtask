# v58.25.8.4 — Workspace Board Preview + Inline Create Polish

## Objetivo
Pulir la experiencia Workspace-First sin cambiar la arquitectura de base: mejorar la vista Canvas con previews visuales de pizarras reales y convertir `+ Nueva tarea` en un quick create inline contextual.

## Base
- Base directa: `v58.25.8.3 — Workspace Canvas/Boards Integration`.
- Se mantiene `/app/workspace` como capa nueva.
- No se reemplazan `/app/tasks`, `/app/projects`, `/app/boards` ni `/app/reports`.
- No se crean migraciones ni tablas nuevas.

## Cambios principales

### Canvas / Boards
- `CanvasView` ahora renderiza `WorkspaceBoardPreviewCard`.
- Las pizarras muestran preview visual con thumbnail cuando existe `thumbnailUrl`.
- Cuando no hay thumbnail, se genera una tarjeta visual tipo canvas con grid/dots, nodos y conexión decorativa.
- Se agrega un panel `Preview principal` para reforzar el comportamiento de tablero conectado.
- Las tarjetas siguen enlazando al editor real con `boardRoute(board.id)`.
- No se monta ni duplica `BoardPage` dentro del Workspace.

### Inline Create
- Nuevo componente `src/components/workspace-system/workspace-quick-create.tsx`.
- El botón `+ Nueva tarea` ahora abre/cierra un formulario inline.
- El formulario crea tareas usando Supabase Browser Client y respeta:
  - `context.organizationId`
  - `context.projectId`
  - proyecto seleccionado
  - prioridad
  - fecha límite
  - estado inicial
- Después de crear, ejecuta `router.refresh()` para traer datos reales de servidor.

### CSS
- Se agregan estilos `ft-ws-board-preview-card`.
- Se agrega `ft-ws-quick-create`.
- No se borran tokens `ft-*` ni `ft-ws-*` existentes.

## Archivos clave
- `src/components/workspace-system/workspace-system-page.tsx`
- `src/components/workspace-system/workspace-quick-create.tsx`
- `src/components/workspace-system/views/canvas-view.tsx`
- `src/app/globals.css`
- `src/lib/release/version.ts`
- `scripts/verify-v58.25.8.4.mjs`
- `scripts/build-deploy-readiness.mjs`
- `scripts/deploy-production-readiness.mjs`

## Validación esperada
```bash
npm run verify:current
npm run typecheck
npm run design:doctor
npm run density:guard
npm run density:guard:strict
npm run board:stability
npm run client:readiness:check
npm run deploy:readiness
npm run deploy:production:ready
npm run build:preflight
npm run build
```

## Notas
Esta versión sigue siendo fase Workspace-First progresiva. La persistencia avanzada de `workspace_spaces` y `project_views` queda pendiente para una versión posterior.
