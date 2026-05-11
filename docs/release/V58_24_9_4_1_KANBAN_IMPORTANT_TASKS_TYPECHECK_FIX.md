# v58.24.9.4.1 — Kanban Important Tasks Typecheck Fix

**Base:** v58.24.9.4 — Task Priority Sync + Fresh Detail State + Attachment Icons + Loader Cleanup

## Problema

La versión v58.24.9.4 tenía el uso de `importantFirstTasks()` en `task-kanban-board.tsx`, pero la función no quedó declarada en ese archivo. Además, el callback de `column.items.map()` quedó sin tipo explícito.

## Solución

- Agregar `importantFirstTasks(items: TaskItem[])`.
- Tipar `column.items.map((task: TaskItem) => ...)`.
- Mantener el orden de tareas importantes primero.

## Archivos tocados

- `src/components/tasks/task-kanban-board.tsx`
- `package.json`
- `package-lock.json`
- `src/lib/release/version.ts`
- scripts/docs de release
