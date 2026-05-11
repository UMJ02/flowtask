# FlowTask — v58.24.9.7 Task Action Modal Polish + Safe Delete + Kanban Scale Hardening

Base: **v58.24.9.6 — Task Visibility Rules + Professional Actions Feedback**

## Objetivo

Subir el flujo de tareas a un nivel más profesional:

- Reemplazar el último `window.prompt` por modal interno.
- Mover eliminación de tareas hacia safe delete / soft delete.
- Agregar migración de papelera segura.
- Evitar hard delete directo desde los componentes.
- Filtrar tareas eliminadas en queries principales.
- Mantener el Kanban más escalable con mayor carga y exclusión de eliminadas.
- Agregar índices de performance para tareas.

## Cambios principales

### Safe delete

Se agrega:

```txt
supabase/migrations/0052_v58_24_9_7_task_safe_delete_indexes.sql
src/lib/tasks/safe-delete-client.ts
```

La migración agrega:

```txt
tasks.deleted_at
tasks.deleted_by
tasks.delete_reason
safe_delete_task(task_id)
índices por workspace/status/fecha/prioridad/proyecto
```

### Tareas

- `getTasks()` filtra `deleted_at is null`.
- `getTaskById()` filtra `deleted_at is null`.
- El listado y detalle usan `safeDeleteTaskClient`.
- Bulk delete usa `safeDeleteTasksClient`.
- Si la RPC no existe todavía, hay fallback temporal de hard delete para no bloquear QA, pero lo correcto es aplicar la migración 0052.

### Modal polish

- Se reemplaza `window.prompt` de “Nueva vista” por modal interno.
- Se conserva confirmación visual para eliminar.
- No quedan `window.alert`, `window.confirm` ni `window.prompt` en el flujo principal de tareas.

## Validación recomendada

```bash
npm install
npm run verify:v58.24.9.7
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```
