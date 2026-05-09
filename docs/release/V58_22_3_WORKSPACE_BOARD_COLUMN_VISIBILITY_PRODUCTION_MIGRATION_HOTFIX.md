# v58.22.3 — Workspace Board Column Visibility + Production Migration Hotfix

Base: v58.22.2 Task Status Production + Attachment List + Inline Department Edit
Stage: production-candidate

## Objetivo

Esta versión corrige la migración de Producción para bases que no tienen `public.task_statuses` y agrega control visual de columnas en la sección **Mi flujo de trabajo** del Workspace.

## Cambios

- Selector compacto **Columnas** en Workspace.
- Permite mostrar/ocultar columnas de estado: En progreso, Producción, En espera y Hecho.
- Preferencia guardada en `localStorage` por workspace.
- Mantiene mínimo 1 columna visible.
- No modifica `/app/tasks` ni la vista global de tareas.
- `TaskKanbanBoard` acepta `visibleStatuses` como prop opcional.
- Migración `0044` ahora es segura si `public.task_statuses` no existe.

## Supabase

No agrega nuevas tablas ni RLS. La migración solo actualiza el `CHECK` de `tasks.status` y registra el estado en `task_statuses` únicamente si la tabla existe.
