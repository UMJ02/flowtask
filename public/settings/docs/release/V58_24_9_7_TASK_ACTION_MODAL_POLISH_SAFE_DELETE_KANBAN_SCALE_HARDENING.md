# v58.24.9.7 — Task Action Modal Polish + Safe Delete + Kanban Scale Hardening

**Base:** v58.24.9.6 — Task Visibility Rules + Professional Actions Feedback

## Problemas abordados

1. Quedaba `window.prompt` en crear nueva vista.
2. Eliminar tareas usaba hard delete directo desde UI.
3. No había columnas de papelera para tareas.
4. Las queries principales no filtraban tareas eliminadas.
5. El crecimiento de tareas necesita mejores índices.

## Solución

- Modal interno para nueva vista.
- Helper `safeDeleteTaskClient`.
- Migración `0052` con soft delete e índices.
- RPC `safe_delete_task`.
- Queries principales filtran `deleted_at is null`.
- Componentes de tareas dejan de usar `.delete()` directamente.

## Nota operativa

Para true soft delete, aplicar en Supabase:

```txt
supabase/migrations/0052_v58_24_9_7_task_safe_delete_indexes.sql
```

El fallback de hard delete existe solo para evitar bloqueo durante QA si la migración no está aplicada.
