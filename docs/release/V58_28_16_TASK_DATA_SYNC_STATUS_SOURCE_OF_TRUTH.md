# v58.28.16 — Task Data Sync + Status Source of Truth

## Objetivo
Alinear la convivencia entre FlowTask clásico y Workspace Pro para que estado, prioridad, fecha y datos base de tareas no se contradigan entre vistas.

## Cambios principales

- `tasks.status` queda como fuente única de verdad para los boards.
- El kanban clásico ya no aplica `kanbanStatusOverrides` ni localStorage de status sobre las tareas reales.
- El kanban clásico ahora expone las columnas reales: pendiente, en proceso, producción, en espera, revisión y concluido.
- Se mantiene únicamente `kanbanOrderOverrides` para orden visual.
- Se limpian overrides legacy de estado desde localStorage.
- Se agrega `src/lib/tasks/task-mutations.ts` como superficie unificada de mutación.
- Workspace Pro usa `updateTaskStatusCore` y `updateTaskPriorityCore`.
- Board clásico usa las mismas mutaciones unificadas.
- Task Form, Task Status Form e Inline Actions emiten `flowtask:task-updated`.
- Board clásico y Workspace Pro escuchan `flowtask:task-updated` para sincronizar estado local.

## Notas de Supabase
La migración `0055_v58_28_4_task_status_pending_review.sql` debe estar aplicada para que `pendiente` y `revision` se guarden en producción.

## No incluido
- No se tocaron RLS.
- No se tocaron rutas clásicas.
- No se agregaron dependencias.
- No se cambió `safe_delete_visual_board`.
