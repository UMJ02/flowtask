# v58.24.9.5 — Important Tasks UX + Analytics Separation

**Base:** v58.24.9.4.1 — Kanban Important Tasks Typecheck Fix

## Decisión de producto

No se elimina la estrella. Se redefine como una señal manual de foco:

```txt
Importante = priority alta
```

No debe mezclarse con productividad, progreso o estado real.

## Cambios principales

- Kanban confirma la mutación de prioridad con Supabase.
- Kanban actualiza el dashboard mediante `onTaskPriorityChange`.
- Workspace KPI cambia a señal secundaria: `Importantes · Foco, no avance`.
- Lista de tareas mantiene estrella y agrega filtro `Solo importantes`.
- Se conserva separación analítica:
  - Estado = flujo real
  - Prioridad = foco/importancia
  - Fecha = compromiso temporal
  - Analítica = rendimiento real

## Archivos tocados

- `src/components/tasks/task-kanban-board.tsx`
- `src/components/workspace/workspace-home.tsx`
- `src/components/tasks/task-action-list.tsx`
- release/version/scripts
