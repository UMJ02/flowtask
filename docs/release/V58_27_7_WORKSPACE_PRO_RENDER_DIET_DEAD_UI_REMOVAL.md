# v58.27.7 — Workspace Pro Render Diet + Dead UI Removal

## Objetivo

Reducir la sensación de Workspace Pro “pegado” sin migraciones, sin tocar Supabase y sin reemplazar rutas clásicas.

## Cambios principales

- Nuevo helper `src/lib/workspace-system/render-diet.ts`.
- Nueva validación `workspace:render-diet:ready`.
- `WorkspaceProPage` deriva métricas y previews una sola vez con `getWorkspaceProDerivedData`.
- Home usa previews limitados: importantes, próximos vencimientos, proyectos activos y actividad reciente.
- Proyectos usa `projectTaskMap` en vez de filtrar todas las tareas por cada proyecto en render.
- Board usa `boardColumns` derivado en vez de recalcular columnas por cada render.
- Inspector reutiliza `derived.upcomingTasks` y métricas centralizadas.
- `build:preflight` ahora ejecuta `workspace:render-diet:ready`.

## Reglas respetadas

- No se agregan dependencias.
- No se agregan migraciones.
- No se cambia Supabase ni RLS.
- No se toca `safe_delete_visual_board`.
- No se reescriben rutas clásicas.
- No se borra ningún componente compartido sin validación de imports.

## Validación recomendada

```bash
npm run verify:current
npm run workspace:render-diet:ready
npm run workspace:deep-cleanup:ready
npm run typecheck
npm run build:preflight
npm run build
```
