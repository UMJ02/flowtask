# v58.25.9.5 — Workspace Project Home Dashboard

## Objetivo

Crear una vista `Home` dentro de `/app/workspace` para que cada proyecto/espacio tenga una portada operativa antes de entrar a Lista, Board, Timeline, Tabla, Canvas, Archivos o Reportes.

## Cambios principales

- Nueva view `home` en `WorkspaceViewId`.
- Nueva vista `src/components/workspace-system/views/home-view.tsx`.
- `/app/workspace` ahora abre `home` por defecto cuando no hay `view` ni `savedViewId`.
- Tabs superiores agregan `Home`.
- Sidebar Workspace agrega `Home del proyecto`.
- Home muestra datos reales del contexto activo:
  - progreso general,
  - tareas importantes,
  - vencidas/próximas,
  - pizarras conectadas,
  - archivos recientes,
  - actividad reciente,
  - vistas guardadas,
  - accesos rápidos.
- Nueva migración `0058_v58_25_9_5_project_views_home_view_support.sql` para permitir `view_type = 'home'` en `project_views`.
- Saved Views Manager ahora puede guardar vistas Home.
- CSS nuevo `ft-ws-home-*` para hero, métricas, recursos, actividad y estados vacíos.
- Readiness y `verify:current` actualizados a v58.25.9.5.

## Migración requerida

Aplicar después de 0056 y 0057:

```sql
-- supabase/migrations/0058_v58_25_9_5_project_views_home_view_support.sql
```

Esta migración no recrea tablas. Solo actualiza el check constraint de `project_views.view_type` para incluir `home`.

## No se tocó

- No se reemplazó `/app/tasks`.
- No se reemplazó `/app/projects`.
- No se reemplazó `/app/boards`.
- No se reemplazó `/app/reports`.
- No se duplicó `BoardPage`.
- No se tocó `safe_delete_visual_board`.
- No se agregaron dependencias.

## Validación recomendada

```bash
npm run workspace:doctor
npm run verify:current
npm run typecheck
npm run build:preflight
npm run build
```
