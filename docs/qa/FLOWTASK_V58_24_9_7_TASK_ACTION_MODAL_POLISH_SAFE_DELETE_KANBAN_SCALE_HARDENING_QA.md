# QA — v58.24.9.7 Task Action Modal Polish + Safe Delete + Kanban Scale Hardening

## 1. Migración

Aplicar:

```sql
-- supabase/migrations/0052_v58_24_9_7_task_safe_delete_indexes.sql
```

Validar:

```sql
select column_name
from information_schema.columns
where table_schema = 'public'
  and table_name = 'tasks'
  and column_name in ('deleted_at', 'deleted_by', 'delete_reason');

select
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as arguments
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname = 'safe_delete_task';
```

## 2. Nueva vista sin prompt

1. Abrir `/app/tasks`.
2. Cambiar a vista calendario/Gantt si aplica.
3. Presionar `Nueva vista`.
4. Confirmar que aparece modal interno.
5. Guardar.
6. Confirmar que no aparece prompt del navegador.

## 3. Safe delete en listado

1. Eliminar una tarea desde listado.
2. Confirmar modal interno.
3. Confirmar eliminación.
4. Validar en DB que `deleted_at is not null`.
5. Confirmar que la tarea no aparece en `/app/tasks`.

## 4. Safe delete en detalle

1. Abrir detalle de tarea.
2. Presionar `Eliminar`.
3. Confirmar modal interno.
4. Confirmar eliminación.
5. Validar redirección a `/app/tasks`.

## 5. Kanban

1. Abrir dashboard.
2. Confirmar que no muestra tareas con `deleted_at is not null`.
3. Confirmar que columnas siguen funcionando.
4. Confirmar que concluidas aparecen en `Hecho`.

## 6. CLI

```bash
npm install
npm run verify:v58.24.9.7
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```
