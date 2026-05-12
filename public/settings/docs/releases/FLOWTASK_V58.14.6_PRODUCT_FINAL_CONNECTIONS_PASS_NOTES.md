# FlowTask V58.14.6 Product Final Connections PASS

Base: V58.14.5.1 Task New Hero Fix.

## Cambios principales

### 1. Base de datos / Supabase
Se agrega la migración:

- `supabase/migrations/0039_v58_14_6_product_final_connections.sql`

Incluye:

- `task_checklist_items`: checklist persistente por tarea.
- `task_view_preferences`: vistas guardadas para Timeline/Gantt.
- `task_dependencies`: base para dependencias Gantt.
- índices, triggers `updated_at` y políticas RLS.

### 2. Ver tarea / Checklist real
Archivos:

- `src/lib/queries/task-checklist.ts`
- `src/components/tasks/task-checklist-card.tsx`
- `src/app/(app)/app/tasks/[id]/page.tsx`

El checklist ya no es solo estado local:

- lee items desde Supabase.
- agrega items nuevos.
- marca/desmarca completados.
- elimina items.
- registra actividad con `activity_logs`.

### 3. Tareas / Timeline-Gantt
Archivo:

- `src/components/tasks/task-action-list.tsx`

Cambios:

- `Guardar vista` intenta sincronizar con `task_view_preferences`.
- `Nueva vista` crea una preferencia guardada con nombre.
- `Exportar` genera CSV real de tareas visibles.
- Se mantiene fallback localStorage si no hay sesión o la migración aún no está aplicada.

## Importante
Antes de usar checklist y vistas guardadas en Supabase, aplicar la migración 0039.

## Validación recomendada local

```bash
rm -rf node_modules .next
npm ci
npm run typecheck
npm run build:preflight
npm run build
```

## Validación SQL recomendada

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
and table_name in (
  'task_checklist_items',
  'task_view_preferences',
  'task_dependencies'
);
```
