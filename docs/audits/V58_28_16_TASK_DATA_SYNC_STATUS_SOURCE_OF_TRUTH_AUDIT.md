# Audit — v58.28.16 Task Data Sync + Status Source of Truth

## Hallazgos corregidos

- `src/types/task.ts` estaba limitado a cuatro estados.
- `TaskKanbanBoard` clásico tenía solo cuatro columnas.
- El board clásico seguía leyendo overrides de status desde localStorage/layout_config.
- Workspace Pro tenía estado local optimista sin una sincronización compartida.
- Mutaciones de estado/prioridad estaban dispersas.

## Decisión arquitectónica

`tasks.status` en Supabase es la única fuente de verdad para estado.

`boards.layout_config` puede conservar orden visual, pero no debe sobrescribir estado real.

## Superficie nueva

- `src/lib/tasks/task-mutations.ts`
- `flowtask:task-updated`
- `updateTaskStatusCore`
- `updateTaskPriorityCore`
- `updateTaskCore`
- `emitTaskUpdated`
- `subscribeTaskUpdated`
