# FlowTask — v58.24.9.3 Workspace Kanban Status Isolation + Important Tasks Performance

Base: **v58.24.9.2 — Organization Delete RPC Schema + Workspace Switch Fix**

## Objetivo

Corregir el comportamiento del flujo de trabajo/Kanban en `/app/dashboard`:

1. Las tareas deben quedarse en su columna real según `tasks.status`.
2. Ocultar una columna no debe mover ni mezclar tareas en otra columna visible.
3. Las tareas importantes se gestionan con `priority = 'alta'`.
4. El contador del dashboard ahora muestra `Importantes` en vez de leer favoritas desde localStorage.
5. Desde el Kanban se puede marcar/quitar una tarea como importante con el botón de estrella.

## Cambios principales

- `TaskKanbanBoard` ya no remapea tareas de columnas ocultas hacia la primera columna visible.
- `TaskKanbanBoard` mantiene cada tarea en su estado persistido:
  - `en_proceso`
  - `produccion`
  - `en_espera`
  - `concluido`
- Se agregó acción rápida de estrella en cada card:
  - estrella activa = `priority: alta`
  - estrella inactiva = `priority: media`
- El KPI del dashboard cambió de `Favoritas` a `Importantes`.
- El conteo de importantes se calcula desde tareas reales con `priority === 'alta'`.

## Validación recomendada

```bash
npm install
npm run verify:v58.24.9.3
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```
