# v58.24.9.3 — Workspace Kanban Status Isolation + Important Tasks Performance

**Base:** v58.24.9.2 — Organization Delete RPC Schema + Workspace Switch Fix

## Problema

En el Kanban del dashboard, al ocultar columnas con el selector de columnas, las tareas cuyo estado quedaba oculto podían remapearse visualmente a la primera columna visible. Eso hacía que tareas `concluido` parecieran mezclarse con `en_proceso`.

## Corrección

`TaskKanbanBoard` ya no normaliza el estado de una tarea hacia una columna visible. Si una columna está oculta, sus tareas quedan ocultas, pero no cambian de estado ni aparecen en otra columna.

## Importantes

Se reemplaza el concepto visual de “Favoritas” del dashboard por “Importantes”, basado en `priority = 'alta'`.

Desde cada card del Kanban ahora se puede marcar o quitar una tarea como importante con una estrella.

## Performance

Se elimina el cálculo de favoritas basado en `localStorage` en el dashboard y se usa el estado real ya cargado en memoria.
