# v58.24.9.8 — Client Final Readiness + Global Modal System + Trash Recovery

**Base:** v58.24.9.7.1 — Important Filter + No Auto Reorder + Selection Stability

## Qué agrega

- Papelera de tareas en `/app/tasks/trash`
- Restaurar tareas eliminadas
- Eliminar definitivamente tareas eliminadas
- RPCs `restore_deleted_task` y `purge_deleted_task`
- Componentes globales base:
  - `ActionNotice`
  - `ConfirmDialog`
  - `PromptModal`
- Script `db:doctor`

## Notas

Esta versión no reemplaza todo el sistema visual de modales en cada módulo, pero crea la base reutilizable y aplica la recuperación más importante: tareas.

## Migraciones requeridas

Aplicar en Supabase:

```txt
0052_v58_24_9_7_task_safe_delete_indexes.sql
0053_v58_24_9_8_task_trash_recovery_rpc.sql
```
