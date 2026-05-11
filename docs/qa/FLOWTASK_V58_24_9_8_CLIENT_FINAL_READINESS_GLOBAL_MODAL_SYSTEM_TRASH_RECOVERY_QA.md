# QA — v58.24.9.8 Client Final Readiness + Global Modal System + Trash Recovery

## 1. Migraciones

Aplicar:

```txt
0052_v58_24_9_7_task_safe_delete_indexes.sql
0053_v58_24_9_8_task_trash_recovery_rpc.sql
```

Validar:

```sql
select column_name
from information_schema.columns
where table_schema = 'public'
  and table_name = 'tasks'
  and column_name in ('deleted_at', 'deleted_by', 'delete_reason');

select p.proname, pg_get_function_arguments(p.oid)
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('safe_delete_task', 'restore_deleted_task', 'purge_deleted_task');
```

## 2. Papelera

1. Abrir `/app/tasks`.
2. Eliminar una tarea.
3. Abrir `/app/tasks/trash`.
4. Confirmar que la tarea eliminada aparece.
5. Restaurarla.
6. Confirmar que desaparece de papelera y aparece en tareas.
7. Eliminar otra tarea.
8. Ir a papelera.
9. Eliminar definitivamente.
10. Confirmar que ya no aparece.

## 3. Tareas activas

1. Confirmar que tareas con `deleted_at is not null` no aparecen en `/app/tasks`.
2. Confirmar que tampoco aparecen en Kanban.
3. Confirmar que tareas concluidas activas siguen en columna `Hecho`.

## 4. DB Doctor

```bash
npm run db:doctor
```

Debe confirmar que `tasks.deleted_at` es consultable.

## 5. CLI

```bash
npm install
npm run verify:v58.24.9.8
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```
