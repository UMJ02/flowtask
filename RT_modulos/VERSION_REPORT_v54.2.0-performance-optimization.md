# FlowTask V54.2.0 — Performance + Query Optimization

Base: V54.1

## Objetivo
Reducir latencia percibida y carga redundante en queries críticas sin romper la base cliente final.

## Cambios aplicados
- caché por request para contexto autenticado y cliente Supabase server-side
- caché por request para access summary y lookup de departamentos en queries de proyectos y tareas
- memoización en componentes pesados del dashboard y tareas
- creación perezosa y estable del cliente Supabase en componentes cliente
- índices críticos para proyectos, tareas, comentarios, miembros, permisos y observabilidad
- versión centralizada actualizada a `54.2.0-performance-optimization`

## Archivos clave
- `src/lib/performance/server-cache.ts`
- `src/lib/security/organization-access.ts`
- `src/lib/queries/workspace.ts`
- `src/lib/queries/projects.ts`
- `src/lib/queries/tasks.ts`
- `src/components/dashboard/interactive-dashboard-board.tsx`
- `src/components/tasks/task-action-list.tsx`
- `src/components/tasks/task-kanban-board.tsx`
- `supabase/migrations/0026_v54_2_performance_optimization.sql`

## Notas
- No cambia contratos de datos del frontend.
- No cambia reglas RLS.
- Se puede aplicar por copy/paste sobre V54.1.


## Hotfix de migración
- Corrige la referencia errónea a `public.support_tickets`.
- Usa como tabla canónica `public.internal_support_tickets`.
- Si existía un parche manual en `public.support_tickets`, migra sus filas a la tabla canónica y elimina la tabla manual.
- Reconstituye `error_logs`, `usage_events` e `internal_support_tickets` en caso de que V54.1 hubiera quedado aplicada parcialmente.
