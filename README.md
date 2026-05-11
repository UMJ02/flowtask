# FlowTask — v58.24.9.8 Client Final Readiness + Global Modal System + Trash Recovery

Base: **v58.24.9.7.1 — Important Filter + No Auto Reorder + Selection Stability**

## Objetivo

Avanzar la app hacia cliente final con recuperación real de tareas, componentes reutilizables de feedback y validación de base de datos.

## Cambios principales

### Trash recovery

- Nueva ruta: `/app/tasks/trash`
- Nueva vista: `TaskTrashRecovery`
- Permite:
  - ver tareas eliminadas
  - restaurar tareas
  - eliminar definitivamente

### RPCs de recuperación

Nueva migración:

```txt
supabase/migrations/0053_v58_24_9_8_task_trash_recovery_rpc.sql
```

Incluye:

```txt
restore_deleted_task(task_id)
purge_deleted_task(task_id)
```

### Global modal system

Nuevo archivo:

```txt
src/components/ui/action-modal.tsx
```

Incluye:

```txt
ActionNotice
ConfirmDialog
PromptModal
```

Sirve como base reutilizable para ir eliminando alert/confirm/prompt nativos restantes.

### DB Doctor

Nuevo script:

```bash
npm run db:doctor
```

Valida de forma básica que `tasks.deleted_at` sea consultable y recuerda validar RPCs críticas.

### Cliente final

- `/app/tasks` agrega link a Papelera.
- Las tareas eliminadas no aparecen en listado ni Kanban.
- La recuperación de tareas ya tiene UI propia.

## Validación recomendada

```bash
npm install
npm run verify:v58.24.9.8
npm run typecheck
npm run build:preflight
npm run build
npm run db:doctor
npm run dev
```
