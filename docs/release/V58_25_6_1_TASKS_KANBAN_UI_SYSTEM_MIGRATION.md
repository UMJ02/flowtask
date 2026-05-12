# v58.25.6.1 — Tasks + Kanban UI System Migration

**Base:** v58.25.6 — Design System Consolidation + App UI Architecture Hardening

## Objetivo

Aplicar el sistema madre a Tareas y Kanban para que la app mantenga una sola línea visual: Apple-clean, Notion-simple y Asana-functional.

## Alcance aplicado

### Tareas
- `ft-tasks-screen`
- `ft-tasks-toolbar`
- `ft-tasks-table`
- `ft-tasks-table-head`
- `ft-tasks-row`
- `ft-tasks-row-important`
- `ft-task-star`
- `ft-task-star-active`
- `ft-task-icon-button`
- `ft-task-filter-panel`
- `ft-task-form-panel`

### Kanban
- `ft-kanban-grid`
- `ft-kanban-header`
- `ft-kanban-column`
- `ft-kanban-column-active`
- `ft-kanban-column-head`
- `ft-kanban-card`
- `ft-kanban-card-important`
- `ft-kanban-drop-target`

## Decisiones UX/UI

- Se evita reordenamiento visual por prioridad.
- Los importantes se resaltan de forma estable, sin saltos.
- El Kanban queda en 4 columnas en desktop para respetar los 4 estados base.
- Los cards son más compactos y con radios/sombras del sistema.
- Las acciones usan botones iconográficos consistentes.
- Los selects, inputs y checkboxes se apoyan en la capa global de v58.25.6.

## Funcionalidad preservada

- Lista.
- Calendario.
- Paginar.
- Seleccionar.
- Marcar importante.
- Finalizar.
- Eliminar con flujo seguro.
- Drag/drop Kanban.
- Persistencia de status/order override.
- Filtros.
- Formulario de crear/editar tarea.
