# FlowTask v58.25.9.8 — Workspace Navigation + Search Command Center

## Objetivo

Elevar `/app/workspace` a una experiencia más pro tipo ClickUp/Notion/Linear agregando un centro de búsqueda y comandos contextual sin crear tablas nuevas, sin dependencias nuevas y sin romper las rutas clásicas.

## Cambios principales

- Nuevo `WorkspaceCommandCenter`.
- Apertura con botón visible y atajo `⌘K` / `Ctrl+K`.
- Búsqueda unificada sobre:
  - vistas del workspace,
  - vistas guardadas,
  - espacios,
  - proyectos,
  - tareas,
  - pizarras,
  - archivos,
  - acciones rápidas.
- Acción rápida para abrir quick create si el usuario tiene permiso.
- Navegación contextual manteniendo `space`, `projectId`, `view` y `savedViewId` cuando corresponde.
- Header contextual y action bar ahora exponen entrada de búsqueda/comandos.
- CSS dedicado para command palette, resultados activos y trigger.

## Reglas respetadas

- No agrega migraciones.
- No cambia RLS.
- No reemplaza `/app/tasks`, `/app/projects`, `/app/boards` ni `/app/reports`.
- No duplica `BoardPage`.
- No toca `safe_delete_visual_board`.
- No instala dependencias nuevas.

## Validación esperada

```bash
npm run workspace:doctor
npm run verify:current
npm run typecheck
npm run build:preflight
npm run build
```
