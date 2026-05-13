# v58.25.8.7 — Workspace Views Real Interaction Polish

## Objetivo

Convertir las vistas principales del Workspace en superficies realmente operables, no solo previews visuales. La meta es que Lista, Board y Tabla permitan acciones rápidas con datos reales sin salir de `/app/workspace`.

## Cambios incluidos

- Nuevo componente `WorkspaceTaskInlineEditor` para editar tareas desde el Workspace.
- Nuevo componente `WorkspaceTaskQuickMove` para mover tareas desde tarjetas de Board.
- Lista ahora permite cambiar estado, prioridad y fecha límite inline.
- Board ahora muestra acciones rápidas para mover tareas entre estados.
- Tabla ahora funciona como superficie operativa de edición rápida.
- Los updates usan `supabase.from("tasks").update(...)` y `router.refresh()` para conservar datos reales.
- Se mantiene aislamiento por RLS/Supabase: no se crean tablas nuevas y no se fuerzan datos cruzados.
- Se agregan estilos `ft-ws-inline-*`, `ft-ws-interactive-row` y `ft-ws-board-interactive-card`.

## Archivos clave

- `src/components/workspace-system/workspace-task-inline-actions.tsx`
- `src/components/workspace-system/views/list-view.tsx`
- `src/components/workspace-system/views/board-view.tsx`
- `src/components/workspace-system/views/table-view.tsx`
- `src/app/globals.css`
- `src/lib/release/version.ts`
- `package.json`
- `scripts/verify-v58.25.8.7.mjs`
- `scripts/build-deploy-readiness.mjs`
- `scripts/deploy-production-readiness.mjs`

## No incluido

- No crea `workspace_spaces` ni `project_views`.
- No agrega migraciones.
- No reemplaza `/app/tasks`, `/app/projects`, `/app/boards` ni `/app/reports`.
- No duplica `BoardPage`.
- No toca `safe_delete_visual_board`.
- No instala dependencias nuevas.

## Validación recomendada

```bash
npm run verify:current
npm run typecheck
npm run build:preflight
npm run build
```

## Resultado esperado

El Workspace se siente más cercano a ClickUp/Notion/Asana: las vistas no solo muestran información, también permiten operar el trabajo real desde el contexto activo.
